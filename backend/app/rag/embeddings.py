import asyncio
import hashlib
import math
import random
from abc import ABC, abstractmethod
from typing import Any, List, Optional

from google import genai
from google.genai import types

from app.core.config import settings
from app.core.logging import logger
from app.rag.generator import (
    GeminiProviderError,
    RuntimeAITelemetry,
    classify_gemini_exception,
)


class BaseEmbeddingProvider(ABC):
    provider_name: str = "base"
    model_name: str = "unknown"
    dimension: int = 768
    is_mock: bool = False

    @abstractmethod
    async def embed_query(self, text: str) -> List[float]:
        pass

    @abstractmethod
    async def embed_documents(self, texts: List[str]) -> List[List[float]]:
        pass


class MockEmbeddingProvider(BaseEmbeddingProvider):
    """
    Deterministic pseudo-embedding provider for offline development and automated CI tests.
    NOTE: Generates normalized SHA-256 trigonometric vectors (NOT semantic embeddings).
    Always sets is_mock = True and provider_name = 'mock' so retrieval telemetry is transparent
    and mock vectors are never mixed with live Gemini vectors.
    """

    def __init__(self, dimension: int = 768) -> None:
        self.provider_name = "mock"
        self.model_name = "deterministic-sha256-v1"
        self.dimension = dimension
        self.is_mock = True

    def _generate_vector(self, text: str) -> List[float]:
        if not text or not text.strip():
            raise ValueError("Cannot generate embedding for empty text.")
        seed_hash = hashlib.sha256(text.encode("utf-8")).digest()
        vec = []
        for i in range(self.dimension):
            byte_val = seed_hash[i % len(seed_hash)]
            val = (byte_val / 127.5) - 1.0 + math.sin(i * 0.1)
            vec.append(val)

        norm = math.sqrt(sum(x * x for x in vec))
        return [round(x / norm, 5) for x in vec] if norm > 0 else vec

    async def embed_query(self, text: str) -> List[float]:
        return self._generate_vector(text)

    async def embed_documents(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []
        return [self._generate_vector(t) for t in texts]


class GeminiEmbeddingProvider(BaseEmbeddingProvider):
    """
    Production Google Gemini Embedding provider powered by the official `google-genai` SDK.
    Default model: `gemini-embedding-2` (configurable via GEMINI_EMBEDDING_MODEL).
    Default output dimensionality: `768` (configurable via GEMINI_EMBEDDING_DIMENSIONS).
    Supports single and batch embedding, Arabic & English UTF-8 text, strict dimension validation,
    and bounded exponential backoff with jitter.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: Optional[str] = None,
        dimension: Optional[int] = None,
        timeout_seconds: Optional[int] = None,
        max_retries: Optional[int] = None,
        client: Optional[Any] = None,
    ) -> None:
        resolved_key = (api_key if api_key is not None else settings.GEMINI_API_KEY or "").strip()
        if not resolved_key:
            raise GeminiProviderError(
                message="GEMINI_API_KEY is missing or empty for GeminiEmbeddingProvider.",
                error_category="MISSING_API_KEY",
                http_status=401,
                retryable=False,
            )

        self.api_key = resolved_key
        self.provider_name = "gemini"
        self.model_name = (
            model_name
            or settings.GEMINI_EMBEDDING_MODEL
            or settings.EMBEDDING_MODEL_NAME
            or "gemini-embedding-2"
        )
        self.dimension = int(
            dimension
            if dimension is not None
            else (settings.GEMINI_EMBEDDING_DIMENSIONS or settings.EMBEDDING_DIMENSION or 768)
        )
        self.timeout_seconds = float(
            timeout_seconds if timeout_seconds is not None else settings.GEMINI_TIMEOUT_SECONDS
        )
        self.max_retries = int(max_retries if max_retries is not None else settings.GEMINI_MAX_RETRIES)
        self.is_mock = False
        self._has_custom_client = client is not None
        if client is not None:
            self._client = client
        else:
            http_opts = types.HttpOptions(
                retry_options=types.HttpRetryOptions(attempts=1),
            )
            self._client = genai.Client(api_key=self.api_key, http_options=http_opts)

    def _validate_vector(self, raw_values: Any) -> List[float]:
        if not raw_values or not isinstance(raw_values, (list, tuple)):
            raise GeminiProviderError(
                message="Gemini Embedding API returned an empty or null embedding vector.",
                error_category="EMPTY_RESPONSE_ERROR",
                retryable=False,
            )
        vec = [float(v) for v in raw_values]
        if len(vec) != self.dimension:
            raise GeminiProviderError(
                message=(
                    f"Embedding dimension mismatch: expected {self.dimension} dimensions from "
                    f"'{self.model_name}', but received {len(vec)}."
                ),
                error_category="INVALID_EMBEDDING_DIMENSION_ERROR",
                retryable=False,
            )
        return vec

    async def _invoke_sdk_embed(self, contents: Any) -> Any:
        embed_config = types.EmbedContentConfig(output_dimensionality=self.dimension)
        if self._has_custom_client:
            aio_client = getattr(self._client, "aio", None)
            if aio_client is not None and hasattr(aio_client, "models"):
                coro = aio_client.models.embed_content(
                    model=self.model_name,
                    contents=contents,
                    config=embed_config,
                )
                return await asyncio.wait_for(coro, timeout=self.timeout_seconds)

        return await asyncio.wait_for(
            asyncio.to_thread(
                self._client.models.embed_content,
                model=self.model_name,
                contents=contents,
                config=embed_config,
            ),
            timeout=self.timeout_seconds,
        )

    async def embed_query(self, text: str) -> List[float]:
        """Generates a single validated embedding vector for a query string (supports English & Arabic)."""
        if not isinstance(text, str) or not text.strip():
            raise GeminiProviderError(
                message="Cannot embed empty or whitespace-only text.",
                error_category="INVALID_REQUEST_ERROR",
                http_status=400,
                retryable=False,
            )

        cleaned_text = text.strip()[:8000]
        attempt = 0
        max_attempts = max(1, self.max_retries + 1)
        last_err: Optional[GeminiProviderError] = None

        while attempt < max_attempts:
            attempt += 1
            try:
                response = await self._invoke_sdk_embed(contents=cleaned_text)
                embeddings_list = getattr(response, "embeddings", None)
                if embeddings_list and len(embeddings_list) > 0:
                    values = getattr(embeddings_list[0], "values", None)
                else:
                    single_emb = getattr(response, "embedding", None)
                    values = getattr(single_emb, "values", None) if single_emb else None

                vec = self._validate_vector(values)
                RuntimeAITelemetry.record_success()
                return vec
            except Exception as exc:
                norm_err = classify_gemini_exception(exc, self.api_key)
                last_err = norm_err
                RuntimeAITelemetry.record_failure(norm_err.error_category, norm_err.message)

                if not norm_err.retryable or attempt >= max_attempts:
                    logger.warning(
                        f"Gemini embedding failed on attempt {attempt}/{max_attempts} "
                        f"[{norm_err.error_category}]: {norm_err.message}"
                    )
                    raise norm_err

                backoff_sec = min(8.0, (0.5 * (2 ** (attempt - 1))) + random.uniform(0.05, 0.25))
                await asyncio.sleep(backoff_sec)

        raise last_err or GeminiProviderError("Gemini embedding failed after maximum retries.")

    async def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Generates validated batch embeddings for a list of document chunks."""
        if not texts:
            return []

        cleaned_batch: List[str] = []
        for idx, t in enumerate(texts):
            if not isinstance(t, str) or not t.strip():
                raise GeminiProviderError(
                    message=f"Document chunk at index {idx} is empty or whitespace-only.",
                    error_category="INVALID_REQUEST_ERROR",
                    http_status=400,
                    retryable=False,
                )
            cleaned_batch.append(t.strip()[:8000])

        attempt = 0
        max_attempts = max(1, self.max_retries + 1)
        last_err: Optional[GeminiProviderError] = None

        while attempt < max_attempts:
            attempt += 1
            try:
                response = await self._invoke_sdk_embed(contents=cleaned_batch)
                embeddings_list = getattr(response, "embeddings", None)
                # Note: `gemini-embedding-2` treats a list of strings as multi-part content for 1 embedding.
                # If the SDK returns 1 combined embedding for N > 1 documents on a real client, embed each document concurrently.
                if (
                    not self._has_custom_client
                    and embeddings_list
                    and len(embeddings_list) == 1
                    and len(cleaned_batch) > 1
                ):
                    sem = asyncio.Semaphore(5)

                    async def _embed_one(item_text: str) -> List[float]:
                        async with sem:
                            return await self.embed_query(item_text)

                    vectors = list(await asyncio.gather(*(_embed_one(t) for t in cleaned_batch)))
                    RuntimeAITelemetry.record_success()
                    return vectors

                if not embeddings_list or len(embeddings_list) != len(cleaned_batch):
                    raise GeminiProviderError(
                        message=(
                            f"Batch embedding count mismatch: requested {len(cleaned_batch)} embeddings, "
                            f"received {len(embeddings_list) if embeddings_list else 0}."
                        ),
                        error_category="EMPTY_RESPONSE_ERROR",
                        retryable=False,
                    )

                vectors = [self._validate_vector(getattr(emb, "values", None)) for emb in embeddings_list]
                RuntimeAITelemetry.record_success()
                return vectors
            except Exception as exc:
                norm_err = classify_gemini_exception(exc, self.api_key)
                last_err = norm_err
                RuntimeAITelemetry.record_failure(norm_err.error_category, norm_err.message)

                if not norm_err.retryable or attempt >= max_attempts:
                    logger.warning(
                        f"Gemini batch embedding failed on attempt {attempt}/{max_attempts} "
                        f"[{norm_err.error_category}]: {norm_err.message}"
                    )
                    raise norm_err

                backoff_sec = min(8.0, (0.5 * (2 ** (attempt - 1))) + random.uniform(0.05, 0.25))
                await asyncio.sleep(backoff_sec)

        raise last_err or GeminiProviderError("Gemini batch embedding failed after maximum retries.")


def get_embedding_provider(strict: bool = False) -> BaseEmbeddingProvider:
    """
    Factory that returns the configured EmbeddingProvider.
    - When AI_PROVIDER=mock or EMBEDDING_PROVIDER=mock: returns MockEmbeddingProvider.
    - When gemini is configured and GEMINI_API_KEY is present: returns GeminiEmbeddingProvider.
    - When GEMINI_API_KEY is missing: raises GeminiProviderError if strict=True, or returns MockEmbeddingProvider.
    """
    ai_prov = (settings.AI_PROVIDER or "gemini").lower().strip()
    emb_prov = (settings.EMBEDDING_PROVIDER or ai_prov).lower().strip()
    dim = settings.GEMINI_EMBEDDING_DIMENSIONS or settings.EMBEDDING_DIMENSION or 768

    if ai_prov == "mock" or emb_prov == "mock":
        return MockEmbeddingProvider(dimension=dim)

    if emb_prov == "gemini" or ai_prov == "gemini":
        if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip():
            return GeminiEmbeddingProvider(
                api_key=settings.GEMINI_API_KEY,
                model_name=settings.GEMINI_EMBEDDING_MODEL or settings.EMBEDDING_MODEL_NAME,
                dimension=dim,
                timeout_seconds=settings.GEMINI_TIMEOUT_SECONDS,
                max_retries=settings.GEMINI_MAX_RETRIES,
            )
        missing_msg = "Embedding provider is 'gemini', but GEMINI_API_KEY is not configured."
        RuntimeAITelemetry.record_failure("MISSING_API_KEY", missing_msg)
        if strict or not settings.AI_FALLBACK_TO_MOCK:
            raise GeminiProviderError(
                message=missing_msg,
                error_category="MISSING_API_KEY",
                http_status=401,
                retryable=False,
            )
        logger.warning(f"{missing_msg} Falling back to MockEmbeddingProvider.")
        return MockEmbeddingProvider(dimension=dim)

    return MockEmbeddingProvider(dimension=dim)
