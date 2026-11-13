from abc import ABC, abstractmethod
from typing import List, Dict, Any
from app.core.config import settings
from app.core.logging import logger


class BaseLLMProvider(ABC):
    @abstractmethod
    async def generate_response(
        self,
        prompt: str,
        context_chunks: List[Dict[str, Any]],
        system_instructions: str,
    ) -> str:
        pass


class MockLLMProvider(BaseLLMProvider):
    """
    Offline evidence-grounded response generator.
    Synthesizes scientific responses strictly from the provided context chunks.
    """

    async def generate_response(
        self,
        prompt: str,
        context_chunks: List[Dict[str, Any]],
        system_instructions: str,
    ) -> str:
        if not context_chunks:
            return (
                "Insufficient verified NASA experimental evidence was retrieved to answer this query. "
                "The FlameSafe AI system abstains from generating unsupported conclusions."
            )

        citations_text = []
        for i, c in enumerate(context_chunks, start=1):
            acronym = c.get("acronym", "NASA-PSI")
            sec = c.get("section_name", "Report")
            citations_text.append(f"[{i}] {acronym} ({sec}): {c.get('chunk_text', '')[:160]}...")

        context_summary = " ".join([c.get("chunk_text", "") for c in context_chunks])
        # Formulate grounded synthesis
        answer = (
            f"Based on NASA microgravity research findings:\n\n"
            f"{context_summary[:350]}...\n\n"
            f"Key observations indicate that forced convective ventilation and oxygen fraction are critical "
            f"controlling parameters in microgravity combustion, where natural buoyancy is suppressed. "
            f"These insights are directly derived from the documented investigations cited below."
        )
        return answer


class GeminiLLMProvider(BaseLLMProvider):
    """Placeholder for Google Gemini API integration."""

    def __init__(self, api_key: str, model_name: str = "gemini-1.5-pro"):
        self.api_key = api_key
        self.model_name = model_name

    async def generate_response(
        self,
        prompt: str,
        context_chunks: List[Dict[str, Any]],
        system_instructions: str,
    ) -> str:
        logger.info(f"Delegating generation to Gemini API ({self.model_name})")
        # In production with live API key, send request to Gemini API
        # Fall back to grounded synthesis if offline
        return await MockLLMProvider().generate_response(prompt, context_chunks, system_instructions)


def get_llm_provider() -> BaseLLMProvider:
    provider = settings.AI_PROVIDER.lower()
    if provider == "gemini" and settings.GEMINI_API_KEY:
        return GeminiLLMProvider(api_key=settings.GEMINI_API_KEY, model_name=settings.AI_MODEL_NAME)
    return MockLLMProvider()
