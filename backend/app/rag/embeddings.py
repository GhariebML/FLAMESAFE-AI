import hashlib
import math
from abc import ABC, abstractmethod
from typing import List
import httpx
from app.core.config import settings
from app.core.logging import logger


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
    Always sets is_mock = True so retrieval telemetry is transparent.
    """

    def __init__(self, dimension: int = 768):
        self.provider_name = "mock"
        self.model_name = "deterministic-sha256-v1"
        self.dimension = dimension
        self.is_mock = True

    def _generate_vector(self, text: str) -> List[float]:
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
        return [self._generate_vector(t) for t in texts]


class GeminiEmbeddingProvider(BaseEmbeddingProvider):
    """
    Google Gemini Embedding API provider via official Generative Language REST endpoint.
    Supports text-embedding-004 / gemini-embedding-001 with explicit dimension validation.
    """

    def __init__(
        self,
        api_key: str,
        model_name: str = "text-embedding-004",
        dimension: int = 768,
    ):
        self.api_key = api_key
        self.provider_name = "gemini"
        self.model_name = model_name
        self.dimension = dimension
        self.is_mock = False

    async def embed_query(self, text: str) -> List[float]:
        model_path = self.model_name if self.model_name.startswith("models/") else f"models/{self.model_name}"
        url = f"https://generativelanguage.googleapis.com/v1beta/{model_path}:embedContent"
        payload = {
            "model": model_path,
            "content": {"parts": [{"text": text[:8000]}]},
            "outputDimensionality": self.dimension,
        }
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(url, params={"key": self.api_key}, json=payload)
                resp.raise_for_status()
                data = resp.json()
                values = data.get("embedding", {}).get("values", [])
                if not values:
                    raise ValueError("Empty embedding vector returned from Gemini API")
                return [float(v) for v in values]
        except Exception as e:
            logger.warning(f"Gemini embedding request failed ({e}); falling back to deterministic mock vector.")
            self.is_mock = True
            return MockEmbeddingProvider(dimension=self.dimension)._generate_vector(text)

    async def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return [await self.embed_query(t) for t in texts]


def get_embedding_provider() -> BaseEmbeddingProvider:
    provider = settings.EMBEDDING_PROVIDER.lower()
    if provider == "gemini" and settings.GEMINI_API_KEY:
        return GeminiEmbeddingProvider(
            api_key=settings.GEMINI_API_KEY,
            model_name=settings.EMBEDDING_MODEL_NAME,
            dimension=settings.EMBEDDING_DIMENSION,
        )
    return MockEmbeddingProvider(dimension=settings.EMBEDDING_DIMENSION)
