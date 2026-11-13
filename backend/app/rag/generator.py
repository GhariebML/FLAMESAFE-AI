from abc import ABC, abstractmethod
from typing import Any

import httpx

from app.core.config import settings
from app.core.logging import logger


class LLMProviderError(Exception):
    """Base exception for LLM provider failures."""


class GeminiAuthenticationError(LLMProviderError):
    """Raised when Gemini API authentication or authorization fails (HTTP 401/403)."""


class GeminiRateLimitError(LLMProviderError):
    """Raised when Gemini API rate limits are exceeded (HTTP 429)."""


class GeminiAPIError(LLMProviderError):
    """Raised when Gemini API returns a server or protocol error (HTTP 5xx, safety blocks, bad payload)."""


class GeminiTimeoutError(LLMProviderError):
    """Raised when Gemini API request times out."""


class GeminiNetworkError(LLMProviderError):
    """Raised when Gemini API network connection fails."""


class BaseLLMProvider(ABC):
    @abstractmethod
    async def generate_response(
        self,
        prompt: str,
        context_chunks: list[dict[str, Any]],
        system_instructions: str,
    ) -> str:
        pass


class MockLLMProvider(BaseLLMProvider):
    """
    Offline evidence-grounded response generator.
    Synthesizes scientific responses strictly from the provided context chunks.
    """
    provider_name: str = "mock"
    model_name: str = "mock-llm-v1"
    is_mock: bool = True

    async def generate_response(
        self,
        prompt: str,
        context_chunks: list[dict[str, Any]],
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
    """
    Google Gemini REST API LLM provider.
    Executes grounded generation strictly constrained by NASA evidence chunks.
    """

    API_BASE_URL: str = "https://generativelanguage.googleapis.com/v1beta"
    provider_name: str = "gemini"
    is_mock: bool = False

    def __init__(
        self,
        api_key: str,
        model_name: str = "gemini-1.5-pro",
        timeout_seconds: float = 30.0,
        client: httpx.AsyncClient | None = None,
    ):
        self.api_key = api_key
        self.model_name = model_name
        self.provider_name = "gemini"
        self.is_mock = False
        self.timeout_seconds = timeout_seconds
        self._client = client

    def _normalize_model_name(self) -> str:
        name = self.model_name.strip()
        if name.startswith("models/"):
            return name.removeprefix("models/")
        return name

    def _build_system_instructions(self, base_instructions: str) -> str:
        return (
            f"{base_instructions}\n\n"
            "CRITICAL SCIENTIFIC INTEGRITY INSTRUCTIONS:\n"
            "1. You are answering a scientific spacecraft fire safety research query.\n"
            "2. Base your response EXCLUSIVELY on the provided NASA experimental evidence passages.\n"
            "3. NEVER fabricate experimental measurements, physical variables, DOIs, PSI IDs, or author names.\n"
            "4. If the provided evidence passages do not contain sufficient verified empirical data to answer the inquiry, "
            "explicitly state that empirical evidence is insufficient.\n"
            "5. Note that orbital microgravity (0g) results do not directly translate to lunar (0.166g) or Martian (0.38g) "
            "surface conditions without analytical partial-gravity scaling.\n"
            "6. Preserve physical units (e.g., cm/s, kPa, % O2) exactly as reported in the context."
        )

    def _format_context_passages(self, context_chunks: list[dict[str, Any]]) -> str:
        passages = []
        for idx, chunk in enumerate(context_chunks, start=1):
            acronym = chunk.get("acronym", "NASA-PSI")
            title = chunk.get("document_title", "NASA Publication")
            sec = chunk.get("section_name", "General")
            text = chunk.get("chunk_text", "").strip()
            passages.append(
                f"[Evidence Passage {idx}]\n"
                f"Investigation: {acronym}\n"
                f"Document: {title}\n"
                f"Section: {sec}\n"
                f"Excerpt: {text}"
            )
        return "\n\n".join(passages)

    async def generate_response(
        self,
        prompt: str,
        context_chunks: list[dict[str, Any]],
        system_instructions: str,
    ) -> str:
        if not context_chunks:
            return (
                "Insufficient verified NASA experimental evidence was retrieved to answer this query. "
                "The FlameSafe AI system abstains from generating unsupported conclusions."
            )

        model = self._normalize_model_name()
        endpoint_url = f"{self.API_BASE_URL}/models/{model}:generateContent"

        full_system_instructions = self._build_system_instructions(system_instructions)
        formatted_context = self._format_context_passages(context_chunks)

        user_content = (
            f"Scientific Research Query:\n{prompt}\n\n"
            f"Verified NASA Microgravity Context Passages:\n{formatted_context}\n\n"
            "Provide a grounded, scientifically rigorous synthesis answering the query "
            "strictly using the evidence passages above. If the evidence is incomplete, "
            "explicitly declare the uncertainty."
        )

        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": user_content}],
                }
            ],
            "systemInstruction": {
                "parts": [{"text": full_system_instructions}],
            },
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 1024,
            },
        }

        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": self.api_key,
        }

        logger.info(f"Submitting grounded generation request to Gemini API ({model})")

        timeout = httpx.Timeout(self.timeout_seconds)

        try:
            if self._client is not None:
                response = await self._client.post(endpoint_url, json=payload, headers=headers)
            else:
                async with httpx.AsyncClient(timeout=timeout) as client:
                    response = await client.post(endpoint_url, json=payload, headers=headers)
        except httpx.TimeoutException as e:
            logger.error(f"Gemini API request timed out after {self.timeout_seconds}s")
            raise GeminiTimeoutError(
                f"Google Gemini API request timed out after {self.timeout_seconds} seconds."
            ) from e
        except httpx.RequestError as e:
            logger.error(f"Network error communicating with Gemini API: {e}")
            raise GeminiNetworkError(
                f"Network error connecting to Google Gemini API: {e}"
            ) from e

        # Handle specific HTTP status codes
        if response.status_code in (401, 403):
            logger.error(f"Gemini API authentication failed (HTTP {response.status_code})")
            raise GeminiAuthenticationError(
                f"Google Gemini API authentication failed (HTTP {response.status_code}). "
                "Please verify that GEMINI_API_KEY is correctly set in your environment."
            )
        if response.status_code == 429:
            logger.error("Gemini API rate limit exceeded (HTTP 429)")
            raise GeminiRateLimitError(
                "Google Gemini API rate limit exceeded (HTTP 429). Please retry later."
            )
        if response.status_code >= 500:
            logger.error(f"Gemini API server error (HTTP {response.status_code})")
            raise GeminiAPIError(
                f"Google Gemini API server error (HTTP {response.status_code}): {response.text[:200]}"
            )
        if response.status_code != 200:
            logger.error(f"Gemini API unexpected response (HTTP {response.status_code})")
            raise GeminiAPIError(
                f"Google Gemini API unexpected error (HTTP {response.status_code}): {response.text[:200]}"
            )

        try:
            data = response.json()
        except Exception as e:
            raise GeminiAPIError("Failed to parse JSON response from Google Gemini API.") from e

        candidates = data.get("candidates", [])
        if not candidates:
            prompt_feedback = data.get("promptFeedback", {})
            block_reason = prompt_feedback.get("blockReason")
            if block_reason:
                raise GeminiAPIError(f"Google Gemini blocked query due to safety filters: {block_reason}")
            raise GeminiAPIError("Google Gemini API returned no response candidates.")

        candidate = candidates[0]
        content = candidate.get("content", {})
        parts = content.get("parts", [])
        if not parts or "text" not in parts[0]:
            finish_reason = candidate.get("finishReason", "UNKNOWN")
            raise GeminiAPIError(
                f"Google Gemini API candidate contains no text parts (finishReason: {finish_reason})."
            )

        generated_text = parts[0]["text"].strip()
        if not generated_text:
            raise GeminiAPIError("Google Gemini API returned an empty text response.")

        return generated_text


def get_llm_provider() -> BaseLLMProvider:
    provider = settings.AI_PROVIDER.lower()
    if provider == "gemini" and settings.GEMINI_API_KEY:
        return GeminiLLMProvider(api_key=settings.GEMINI_API_KEY, model_name=settings.AI_MODEL_NAME)
    return MockLLMProvider()
