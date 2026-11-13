from abc import ABC, abstractmethod
from typing import List, Dict, Any
import httpx
from app.core.config import settings
from app.core.logging import logger
from app.rag.prompts import build_rag_user_prompt


class BaseLLMProvider(ABC):
    provider_name: str = "base"
    model_name: str = "unknown"
    is_mock: bool = False

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
    Offline evidence-grounded response synthesizer for development and automated testing.
    Synthesizes structured scientific responses strictly from retrieved NASA context chunks.
    Always sets is_mock = True so API consumers can visibly identify demo/mock mode.
    """

    def __init__(self):
        self.provider_name = "mock"
        self.model_name = "deterministic-grounded-synthesizer-v1"
        self.is_mock = True

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

        evidence_points = []
        investigations_referenced = []
        for i, c in enumerate(context_chunks, start=1):
            acronym = c.get("acronym", "NASA-PSI")
            if acronym not in investigations_referenced:
                investigations_referenced.append(acronym)
            sec = c.get("section_name", "Technical Section")
            page = c.get("page_number")
            page_str = f", p. {page}" if page else ""
            excerpt = c.get("chunk_text", "").strip()
            evidence_points.append(f"[{i}] {acronym} ({sec}{page_str}): {excerpt}")

        inv_list_str = ", ".join(investigations_referenced)
        synthesis_lines = [
            f"Based on retrieved NASA microgravity combustion evidence from {inv_list_str}:",
            "",
            *evidence_points,
            "",
            (
                "Scientific Interpretation & Boundaries: The retrieved empirical observations demonstrate "
                "that in orbital microgravity (~10^-6 g), buoyant natural convection is eliminated, making forced "
                "ventilation velocity, oxygen mole fraction, and radiative heat loss the primary controlling parameters "
                "for ignition, flame spread, and extinction."
            ),
        ]
        return "\n".join(synthesis_lines)


class GeminiLLMProvider(BaseLLMProvider):
    """
    Google Gemini LLM provider via official Generative Language REST API.
    If the external API call fails, explicitly marks is_mock = True when falling back.
    """

    def __init__(self, api_key: str, model_name: str = "gemini-2.0-flash"):
        self.api_key = api_key
        self.provider_name = "gemini"
        self.model_name = model_name
        self.is_mock = False

    async def generate_response(
        self,
        prompt: str,
        context_chunks: List[Dict[str, Any]],
        system_instructions: str,
    ) -> str:
        if not context_chunks:
            return await MockLLMProvider().generate_response(prompt, context_chunks, system_instructions)

        model_path = self.model_name if self.model_name.startswith("models/") else f"models/{self.model_name}"
        url = f"https://generativelanguage.googleapis.com/v1beta/{model_path}:generateContent"
        user_prompt = build_rag_user_prompt(prompt, context_chunks)
        payload = {
            "systemInstruction": {"parts": [{"text": system_instructions}]},
            "contents": [{"role": "user", "parts": [{"text": user_prompt}]}],
            "generationConfig": {
                "temperature": 0.1,
                "maxOutputTokens": 900,
            },
        }
        try:
            async with httpx.AsyncClient(timeout=25.0) as client:
                resp = await client.post(url, params={"key": self.api_key}, json=payload)
                resp.raise_for_status()
                data = resp.json()
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    text = "".join(p.get("text", "") for p in parts).strip()
                    if text:
                        return text
                raise ValueError("Gemini API returned empty candidate response")
        except Exception as e:
            logger.warning(f"Gemini generation request failed ({e}); falling back to deterministic grounded synthesis.")
            self.is_mock = True
            self.provider_name = "mock (gemini-fallback)"
            return await MockLLMProvider().generate_response(prompt, context_chunks, system_instructions)


def get_llm_provider() -> BaseLLMProvider:
    provider = settings.AI_PROVIDER.lower()
    if provider == "gemini" and settings.GEMINI_API_KEY:
        return GeminiLLMProvider(api_key=settings.GEMINI_API_KEY, model_name=settings.AI_MODEL_NAME)
    return MockLLMProvider()
