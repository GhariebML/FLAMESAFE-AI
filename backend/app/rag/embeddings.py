import hashlib
import math
from abc import ABC, abstractmethod
from typing import Any

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.logging import logger
from app.models.evidence_chunk import EvidenceChunk


class EmbeddingProviderError(Exception):
    """Base exception for embedding provider errors."""


class GeminiEmbeddingAuthenticationError(EmbeddingProviderError):
    """Raised when Gemini API authentication or authorization fails (HTTP 401/403)."""


class GeminiEmbeddingRateLimitError(EmbeddingProviderError):
    """Raised when Gemini API rate limits are exceeded (HTTP 429)."""


class GeminiEmbeddingAPIError(EmbeddingProviderError):
    """Raised when Gemini API returns an error or malformed payload."""


class GeminiEmbeddingTimeoutError(EmbeddingProviderError):
    """Raised when Gemini API request times out."""


class GeminiEmbeddingNetworkError(EmbeddingProviderError):
    """Raised when Gemini API network connection fails."""


class BaseEmbeddingProvider(ABC):
    @abstractmethod
    async def embed_query(self, text: str) -> list[float]:
        pass

    @abstractmethod
    async def embed_documents(self, texts: list[str]) -> list[list[float]]:
        pass


class MockEmbeddingProvider(BaseEmbeddingProvider):
    """
    Deterministic pseudo-embedding provider that generates normalized vectors
    from text hashes, allowing local testing without API keys.
    """
    provider_name: str = "mock"
    model_name: str = "mock-embedding-v1"

    def __init__(self, dimension: int = 768):
        self.dimension = dimension
        self.provider_name = "mock"
        self.model_name = "mock-embedding-v1"

    def _generate_vector(self, text: str) -> list[float]:
        if not text:
            return [0.0] * self.dimension

        words = [w for w in text.lower().split() if len(w) > 2]
        if not words:
            words = [text]

        vec = [0.0] * self.dimension
        for word in words:
            word_hash = hashlib.sha256(word.encode("utf-8")).digest()
            for i in range(self.dimension):
                vec[i] += (word_hash[i % len(word_hash)] / 127.5) - 1.0

        # Normalize vector to unit length
        norm = math.sqrt(sum(x * x for x in vec))
        return [round(x / norm, 5) for x in vec] if norm > 0 else vec

    async def embed_query(self, text: str) -> list[float]:
        return self._generate_vector(text)

    async def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return [self._generate_vector(t) for t in texts]


class GeminiEmbeddingProvider(BaseEmbeddingProvider):
    """
    Google Gemini REST API Embedding provider.
    Generates 768-dimensional normalized embeddings using text-embedding-004.
    """

    API_BASE_URL: str = "https://generativelanguage.googleapis.com/v1beta"
    MAX_BATCH_SIZE: int = 32
    provider_name: str = "gemini"

    def __init__(
        self,
        api_key: str,
        model_name: str = "text-embedding-004",
        expected_dimension: int = 768,
        timeout_seconds: float = 30.0,
        client: httpx.AsyncClient | None = None,
    ):
        self.api_key = api_key
        self.model_name = model_name
        self.provider_name = "gemini"
        self.expected_dimension = expected_dimension
        self.timeout_seconds = timeout_seconds
        self._client = client

    def _normalize_model_name(self) -> str:
        name = self.model_name.strip()
        if name.startswith("models/"):
            return name.removeprefix("models/")
        return name

    async def _dispatch_post(self, url: str, payload: dict[str, Any]) -> dict[str, Any]:
        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": self.api_key,
        }
        timeout = httpx.Timeout(self.timeout_seconds)

        try:
            if self._client is not None:
                response = await self._client.post(url, json=payload, headers=headers)
            else:
                async with httpx.AsyncClient(timeout=timeout) as client:
                    response = await client.post(url, json=payload, headers=headers)
        except httpx.TimeoutException as e:
            logger.error(f"Gemini Embedding API timed out after {self.timeout_seconds}s")
            raise GeminiEmbeddingTimeoutError(
                f"Google Gemini Embedding API timed out after {self.timeout_seconds} seconds."
            ) from e
        except httpx.RequestError as e:
            logger.error(f"Network error communicating with Gemini Embedding API: {e}")
            raise GeminiEmbeddingNetworkError(
                f"Network error connecting to Google Gemini Embedding API: {e}"
            ) from e

        if response.status_code in (401, 403):
            raise GeminiEmbeddingAuthenticationError(
                f"Google Gemini API authentication failed (HTTP {response.status_code}). "
                "Verify GEMINI_API_KEY."
            )
        if response.status_code == 429:
            raise GeminiEmbeddingRateLimitError(
                "Google Gemini API rate limit exceeded (HTTP 429)."
            )
        if response.status_code >= 500:
            raise GeminiEmbeddingAPIError(
                f"Google Gemini API server error (HTTP {response.status_code}): {response.text[:200]}"
            )
        if response.status_code != 200:
            raise GeminiEmbeddingAPIError(
                f"Google Gemini API unexpected error (HTTP {response.status_code}): {response.text[:200]}"
            )

        try:
            return response.json()
        except Exception as e:
            raise GeminiEmbeddingAPIError("Failed to parse JSON response from Gemini Embedding API.") from e

    async def embed_query(self, text: str) -> list[float]:
        if not text.strip():
            return [0.0] * self.expected_dimension

        model = self._normalize_model_name()
        url = f"{self.API_BASE_URL}/models/{model}:embedContent"

        payload = {
            "model": f"models/{model}",
            "content": {
                "parts": [{"text": text}],
            },
            "taskType": "RETRIEVAL_QUERY",
        }

        data = await self._dispatch_post(url, payload)

        embedding_data = data.get("embedding", {})
        values = embedding_data.get("values", [])
        if not values:
            raise GeminiEmbeddingAPIError("Gemini Embedding API returned no values for query.")

        if len(values) != self.expected_dimension:
            logger.warning(
                f"Embedding dimension mismatch: expected {self.expected_dimension}, got {len(values)}"
            )

        return values

    async def embed_documents(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []

        model = self._normalize_model_name()
        url = f"{self.API_BASE_URL}/models/{model}:batchEmbedContents"

        all_embeddings: list[list[float]] = []

        # Process in batches to adhere to API limits
        for i in range(0, len(texts), self.MAX_BATCH_SIZE):
            batch = texts[i : i + self.MAX_BATCH_SIZE]
            requests = [
                {
                    "model": f"models/{model}",
                    "content": {
                        "parts": [{"text": t if t.strip() else " "}],
                    },
                    "taskType": "RETRIEVAL_DOCUMENT",
                }
                for t in batch
            ]
            payload = {"requests": requests}

            data = await self._dispatch_post(url, payload)

            embeddings = data.get("embeddings", [])
            if len(embeddings) != len(batch):
                raise GeminiEmbeddingAPIError(
                    f"Gemini batchEmbedContents returned {len(embeddings)} items for batch of {len(batch)}."
                )

            for item in embeddings:
                vals = item.get("values", [])
                if not vals:
                    raise GeminiEmbeddingAPIError("Batch item contained no embedding values.")
                all_embeddings.append(vals)

        return all_embeddings


def get_embedding_provider() -> BaseEmbeddingProvider:
    provider = settings.EMBEDDING_PROVIDER.lower()
    if provider == "gemini" and settings.GEMINI_API_KEY:
        return GeminiEmbeddingProvider(
            api_key=settings.GEMINI_API_KEY,
            model_name=settings.EMBEDDING_MODEL_NAME,
            expected_dimension=settings.EMBEDDING_DIMENSION,
        )
    return MockEmbeddingProvider(dimension=settings.EMBEDDING_DIMENSION)


async def compute_and_store_chunk_embeddings(
    session: AsyncSession,
    embedder: BaseEmbeddingProvider | None = None,
    batch_size: int = 16,
    overwrite_existing: bool = False,
) -> int:
    """
    Computes vector embeddings for indexed EvidenceChunk entities and updates the database.
    Can be called by Role B ingestion pipelines or run directly as a background sync.
    """
    if embedder is None:
        embedder = get_embedding_provider()

    query = select(EvidenceChunk)
    result = await session.execute(query)
    all_chunks = list(result.scalars().all())

    if not overwrite_existing:
        chunks = [c for c in all_chunks if not c.embedding]
    else:
        chunks = all_chunks

    if not chunks:
        logger.info("No evidence chunks found needing embedding calculation.")
        return 0

    logger.info(f"Computing embeddings for {len(chunks)} evidence chunks using {embedder.__class__.__name__}...")

    total_updated = 0
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i : i + batch_size]
        texts = [c.chunk_text for c in batch]
        embeddings = await embedder.embed_documents(texts)

        for chunk, emb in zip(batch, embeddings):
            chunk.embedding = emb

        await session.commit()
        total_updated += len(batch)
        logger.info(f"Stored embeddings for {total_updated}/{len(chunks)} chunks.")

    return total_updated
