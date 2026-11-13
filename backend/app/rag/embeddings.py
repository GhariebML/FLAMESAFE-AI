import hashlib
import math
from abc import ABC, abstractmethod
from typing import List
from app.core.config import settings
from app.core.logging import logger


class BaseEmbeddingProvider(ABC):
    @abstractmethod
    async def embed_query(self, text: str) -> List[float]:
        pass

    @abstractmethod
    async def embed_documents(self, texts: List[str]) -> List[List[float]]:
        pass


class MockEmbeddingProvider(BaseEmbeddingProvider):
    """
    Deterministic pseudo-embedding provider that generates normalized vectors
    from text hashes, allowing local testing without API keys.
    """

    def __init__(self, dimension: int = 768):
        self.dimension = dimension

    def _generate_vector(self, text: str) -> List[float]:
        # Generate pseudo-deterministic vector using hash chunks
        seed_hash = hashlib.sha256(text.encode("utf-8")).digest()
        vec = []
        for i in range(self.dimension):
            byte_val = seed_hash[i % len(seed_hash)]
            val = (byte_val / 127.5) - 1.0 + math.sin(i * 0.1)
            vec.append(val)

        # Normalize vector
        norm = math.sqrt(sum(x * x for x in vec))
        return [round(x / norm, 5) for x in vec] if norm > 0 else vec

    async def embed_query(self, text: str) -> List[float]:
        return self._generate_vector(text)

    async def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return [self._generate_vector(t) for t in texts]


class GeminiEmbeddingProvider(BaseEmbeddingProvider):
    """Placeholder for Google Gemini Embedding API integration."""

    def __init__(self, api_key: str, model_name: str = "text-embedding-004"):
        self.api_key = api_key
        self.model_name = model_name

    async def embed_query(self, text: str) -> List[float]:
        logger.info(f"Generating Gemini embedding for query using {self.model_name}")
        # In production, call google-genai or httpx to Google AI Studio
        return MockEmbeddingProvider()._generate_vector(text)

    async def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return [await self.embed_query(t) for t in texts]


def get_embedding_provider() -> BaseEmbeddingProvider:
    provider = settings.EMBEDDING_PROVIDER.lower()
    if provider == "gemini" and settings.GEMINI_API_KEY:
        return GeminiEmbeddingProvider(
            api_key=settings.GEMINI_API_KEY, model_name=settings.EMBEDDING_MODEL_NAME
        )
    return MockEmbeddingProvider(dimension=settings.EMBEDDING_DIMENSION)
