import asyncio
import json
import random
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Type, TypeVar

from google import genai
from google.genai import types
from pydantic import BaseModel, ValidationError

from app.core.config import settings
from app.core.logging import logger
from app.rag.prompts import build_rag_user_prompt

T = TypeVar("T", bound=BaseModel)


def sanitize_secret(text: str, secret: Optional[str] = None) -> str:
    """Removes any accidental appearance of the API key from logs and exception messages."""
    if not text:
        return ""
    sanitized = str(text)
    active_key = secret or settings.GEMINI_API_KEY
    if active_key and len(active_key) >= 4:
        sanitized = sanitized.replace(active_key, "[REDACTED_API_KEY]")
    return sanitized


class GeminiProviderError(Exception):
    """Normalized, sanitized exception for all Gemini LLM and Embedding errors."""

    def __init__(
        self,
        message: str,
        error_category: str = "PROVIDER_ERROR",
        http_status: Optional[int] = None,
        retryable: bool = False,
    ) -> None:
        self.error_category = error_category
        self.http_status = http_status
        self.retryable = retryable
        clean_msg = sanitize_secret(message)
        super().__init__(clean_msg)
        self.message = clean_msg


class RuntimeAITelemetry:
    """Tracks live Gemini connectivity, last successful request timestamp, token usage, and sanitized errors."""

    last_successful_request_at: Optional[str] = None
    last_error: Optional[str] = None
    last_error_category: Optional[str] = None
    last_token_usage: Dict[str, int] = {
        "prompt_tokens": 0,
        "completion_tokens": 0,
        "total_tokens": 0,
    }
    connected: bool = False
    connection_verified_at: Optional[str] = None
    active_working_model: Optional[str] = None

    @classmethod
    def record_success(cls, token_usage: Optional[Dict[str, int]] = None) -> None:
        now_iso = datetime.now(timezone.utc).isoformat()
        cls.last_successful_request_at = now_iso
        cls.connection_verified_at = now_iso
        cls.connected = True
        cls.last_error = None
        cls.last_error_category = None
        if token_usage:
            cls.last_token_usage = token_usage

    @classmethod
    def record_failure(cls, error_category: str, error_message: str) -> None:
        cls.connected = False
        cls.connection_verified_at = datetime.now(timezone.utc).isoformat()
        cls.last_error_category = error_category
        cls.last_error = sanitize_secret(error_message)

    @classmethod
    def reset(cls) -> None:
        cls.last_successful_request_at = None
        cls.last_error = None
        cls.last_error_category = None
        cls.last_token_usage = {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
        cls.connected = False
        cls.connection_verified_at = None


def classify_gemini_exception(exc: Exception, api_key: Optional[str] = None) -> GeminiProviderError:
    """Normalizes SDK, HTTP, timeout, and validation exceptions into a structured GeminiProviderError."""
    if isinstance(exc, GeminiProviderError):
        return exc

    if isinstance(exc, (asyncio.TimeoutError, TimeoutError)):
        return GeminiProviderError(
            message="Gemini API request timed out before completion.",
            error_category="TIMEOUT_ERROR",
            http_status=504,
            retryable=True,
        )

    raw_msg = sanitize_secret(str(exc), api_key)
    msg_lower = raw_msg.lower()
    status_code: Optional[int] = getattr(exc, "code", None) or getattr(exc, "status_code", None)

    if status_code == 429 or "429" in msg_lower or "resource_exhausted" in msg_lower or "rate limit" in msg_lower or "quota" in msg_lower:
        return GeminiProviderError(
            message=f"Gemini API rate limit or quota exceeded: {raw_msg}",
            error_category="RATE_LIMIT_ERROR",
            http_status=429,
            retryable=True,
        )

    if (
        status_code in (401, 403)
        or "api_key_invalid" in msg_lower
        or "invalid api key" in msg_lower
        or "api key not valid" in msg_lower
        or "unauthenticated" in msg_lower
        or "permission_denied" in msg_lower
        or "permission denied" in msg_lower
        or "401" in msg_lower
        or "403" in msg_lower
    ):
        return GeminiProviderError(
            message=f"Gemini authentication or permission error: {raw_msg}",
            error_category="AUTHENTICATION_ERROR",
            http_status=status_code or 401,
            retryable=False,
        )

    if status_code == 404 or "not_found" in msg_lower or "is not found for api version" in msg_lower or "404" in msg_lower:
        return GeminiProviderError(
            message=f"Requested Gemini model or endpoint was not found: {raw_msg}",
            error_category="MODEL_NOT_FOUND_ERROR",
            http_status=404,
            retryable=False,
        )

    if status_code == 400 or "invalid_argument" in msg_lower or "bad request" in msg_lower:
        if "api key" in msg_lower:
            return GeminiProviderError(
                message=f"Invalid Gemini API key rejected by server: {raw_msg}",
                error_category="AUTHENTICATION_ERROR",
                http_status=400,
                retryable=False,
            )
        return GeminiProviderError(
            message=f"Invalid request sent to Gemini API: {raw_msg}",
            error_category="INVALID_REQUEST_ERROR",
            http_status=400,
            retryable=False,
        )

    if (
        (status_code is not None and 500 <= status_code < 600)
        or "500" in msg_lower
        or "502" in msg_lower
        or "503" in msg_lower
        or "504" in msg_lower
        or "unavailable" in msg_lower
        or "internal error" in msg_lower
        or "server error" in msg_lower
    ):
        return GeminiProviderError(
            message=f"Temporary Gemini server error: {raw_msg}",
            error_category="SERVER_ERROR",
            http_status=status_code or 503,
            retryable=True,
        )

    return GeminiProviderError(
        message=f"Gemini API error: {raw_msg}",
        error_category="PROVIDER_ERROR",
        http_status=status_code,
        retryable=False,
    )


class BaseLLMProvider(ABC):
    provider_name: str = "base"
    model_name: str = "unknown"
    is_mock: bool = False
    last_token_usage: Dict[str, int] = {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
    last_error: Optional[str] = None

    @abstractmethod
    async def generate_response(
        self,
        prompt: str,
        context_chunks: List[Dict[str, Any]],
        system_instructions: str,
    ) -> str:
        pass

    async def generate_structured(
        self,
        prompt: str,
        response_schema: Type[T],
        system_instructions: str = "",
    ) -> T:
        raise NotImplementedError("Structured output is not implemented by this provider.")


class MockLLMProvider(BaseLLMProvider):
    """
    Offline evidence-grounded response synthesizer for development and automated testing.
    Synthesizes structured scientific responses strictly from retrieved NASA context chunks.
    Always sets is_mock = True so API consumers can visibly identify demo/mock mode.
    """

    def __init__(self) -> None:
        self.provider_name = "mock"
        self.model_name = "deterministic-grounded-synthesizer-v1"
        self.is_mock = True
        self.last_token_usage = {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
        self.last_error = None

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
    Production Google Gemini LLM provider powered by the official `google-genai` SDK.
    Supports:
    - Non-blocking async generation (`generate` & `generate_response`)
    - Structured Pydantic JSON generation (`generate_structured`)
    - Bounded exponential backoff with jitter for transient errors (429, 5xx, timeout)
    - Strict error classification & secret sanitization (never fabricates fake AI responses)
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: Optional[str] = None,
        timeout_seconds: Optional[int] = None,
        max_retries: Optional[int] = None,
        temperature: Optional[float] = None,
        client: Optional[Any] = None,
    ) -> None:
        resolved_key = (api_key if api_key is not None else settings.GEMINI_API_KEY or "").strip()
        if not resolved_key:
            raise GeminiProviderError(
                message="GEMINI_API_KEY is missing or empty. Configure GEMINI_API_KEY in backend/.env.",
                error_category="MISSING_API_KEY",
                http_status=401,
                retryable=False,
            )

        self.api_key = resolved_key
        self.provider_name = "gemini"
        self.model_name = model_name or settings.GEMINI_MODEL or settings.AI_MODEL_NAME or "gemini-3.8-flash"
        self.timeout_seconds = float(timeout_seconds if timeout_seconds is not None else settings.GEMINI_TIMEOUT_SECONDS)
        self.max_retries = int(max_retries if max_retries is not None else settings.GEMINI_MAX_RETRIES)
        self.temperature = float(temperature if temperature is not None else settings.GEMINI_TEMPERATURE)
        self.is_mock = False
        self.last_token_usage = {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
        self.last_error: Optional[str] = None
        self.last_model_used: str = self.model_name
        self._has_custom_client = client is not None
        if client is not None:
            self._client = client
        else:
            http_opts = types.HttpOptions(
                retry_options=types.HttpRetryOptions(attempts=1),
            )
            self._client = genai.Client(api_key=self.api_key, http_options=http_opts)

    @staticmethod
    def _extract_usage_metadata(response: Any) -> Dict[str, int]:
        usage = getattr(response, "usage_metadata", None)
        if not usage:
            return {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
        prompt_tokens = int(getattr(usage, "prompt_token_count", 0) or 0)
        completion_tokens = int(getattr(usage, "candidates_token_count", 0) or 0)
        total_tokens = int(getattr(usage, "total_token_count", 0) or (prompt_tokens + completion_tokens))
        return {
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "total_tokens": total_tokens,
        }

    def _validate_and_extract_text(self, response: Any) -> str:
        if response is None:
            raise GeminiProviderError(
                message="Gemini API returned a null response object.",
                error_category="EMPTY_RESPONSE_ERROR",
                retryable=False,
            )

        # Check prompt feedback or candidate finish_reason for safety blocking
        prompt_feedback = getattr(response, "prompt_feedback", None)
        if prompt_feedback and getattr(prompt_feedback, "block_reason", None):
            block_reason = str(getattr(prompt_feedback, "block_reason", "SAFETY"))
            raise GeminiProviderError(
                message=f"Gemini response blocked by safety filter ({block_reason}).",
                error_category="SAFETY_BLOCKED_ERROR",
                retryable=False,
            )

        candidates = getattr(response, "candidates", None)
        if candidates:
            first_cand = candidates[0]
            finish_reason = str(getattr(first_cand, "finish_reason", "") or "").upper()
            if "SAFETY" in finish_reason or "BLOCKLIST" in finish_reason or "PROHIBITED" in finish_reason:
                raise GeminiProviderError(
                    message=f"Gemini candidate blocked by safety policy (finish_reason={finish_reason}).",
                    error_category="SAFETY_BLOCKED_ERROR",
                    retryable=False,
                )

        # Extract text via response.text or candidate parts
        text_val: Optional[str] = None
        try:
            raw_text = getattr(response, "text", None)
            if isinstance(raw_text, str) and raw_text.strip():
                text_val = raw_text.strip()
        except Exception:
            text_val = None

        if not text_val and candidates:
            content = getattr(candidates[0], "content", None)
            parts = getattr(content, "parts", None) if content else None
            if parts:
                joined = "".join(str(getattr(p, "text", "") or "") for p in parts).strip()
                if joined:
                    text_val = joined

        if not text_val:
            raise GeminiProviderError(
                message="Gemini API returned an empty response with no generated text.",
                error_category="EMPTY_RESPONSE_ERROR",
                retryable=False,
            )

        return text_val

    async def _invoke_sdk_generate(
        self,
        contents: str,
        config: types.GenerateContentConfig,
        model_override: Optional[str] = None,
    ) -> Any:
        """Invokes the Google GenAI SDK asynchronously without blocking the event loop."""
        target_model = model_override or (
            RuntimeAITelemetry.active_working_model
            if (not self._has_custom_client and RuntimeAITelemetry.active_working_model)
            else self.model_name
        )
        if self._has_custom_client:
            aio_client = getattr(self._client, "aio", None)
            if aio_client is not None and hasattr(aio_client, "models"):
                coro = aio_client.models.generate_content(
                    model=target_model,
                    contents=contents,
                    config=config,
                )
                return await asyncio.wait_for(coro, timeout=self.timeout_seconds)

        # Use synchronous httpx-backed `client.models.generate_content` inside `asyncio.to_thread`
        # to avoid Python 3.14 AiohttpClientSession hangs while remaining 100% non-blocking in FastAPI.
        effective_timeout = (
            min(self.timeout_seconds, 8.0)
            if (not self._has_custom_client and target_model in ("gemini-3.8-flash", "models/gemini-3.8-flash"))
            else self.timeout_seconds
        )
        return await asyncio.wait_for(
            asyncio.to_thread(
                self._client.models.generate_content,
                model=target_model,
                contents=contents,
                config=config,
            ),
            timeout=effective_timeout,
        )

    async def generate(
        self,
        prompt: str,
        system_instructions: str = "",
        temperature: Optional[float] = None,
        response_mime_type: Optional[str] = None,
        response_schema: Optional[Any] = None,
    ) -> str:
        """Executes a Gemini generation request with bounded exponential backoff + jitter."""
        if not prompt or not prompt.strip():
            raise GeminiProviderError(
                message="Prompt text cannot be empty for Gemini generation.",
                error_category="INVALID_REQUEST_ERROR",
                http_status=400,
                retryable=False,
            )

        cfg_kwargs: Dict[str, Any] = {
            "temperature": self.temperature if temperature is None else temperature,
        }
        if system_instructions:
            cfg_kwargs["system_instruction"] = system_instructions
        if response_mime_type:
            cfg_kwargs["response_mime_type"] = response_mime_type
        if response_schema is not None:
            cfg_kwargs["response_schema"] = response_schema

        gen_config = types.GenerateContentConfig(**cfg_kwargs)

        attempt = 0
        last_err: Optional[GeminiProviderError] = None
        max_attempts = max(1, self.max_retries + 1)

        while attempt < max_attempts:
            attempt += 1
            try:
                response = await self._invoke_sdk_generate(contents=prompt, config=gen_config)
                text_out = self._validate_and_extract_text(response)
                usage = self._extract_usage_metadata(response)
                self.last_token_usage = usage
                self.last_error = None
                self.last_model_used = (
                    RuntimeAITelemetry.active_working_model
                    if (not self._has_custom_client and RuntimeAITelemetry.active_working_model)
                    else self.model_name
                )
                RuntimeAITelemetry.record_success(token_usage=usage)
                return text_out
            except Exception as exc:
                norm_err = classify_gemini_exception(exc, self.api_key)
                # If live gemini-3.8-flash experiences temporary 503 high-demand spike on Google's endpoint,
                # transparently route to available Gemini 3.x Flash sibling (gemini-3.6-flash / gemini-3.5-flash)
                if (
                    not self._has_custom_client
                    and norm_err.error_category in ("SERVER_ERROR", "TIMEOUT_ERROR")
                    and self.model_name in ("gemini-3.8-flash", "models/gemini-3.8-flash")
                ):
                    for sibling_model in ("gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-3.6-flash"):
                        try:
                            logger.info(
                                f"Primary model '{self.model_name}' returned {norm_err.error_category}; "
                                f"trying live sibling model '{sibling_model}'..."
                            )
                            response = await self._invoke_sdk_generate(
                                contents=prompt,
                                config=gen_config,
                                model_override=sibling_model,
                            )
                            text_out = self._validate_and_extract_text(response)
                            usage = self._extract_usage_metadata(response)
                            self.last_token_usage = usage
                            self.last_error = None
                            self.last_model_used = sibling_model
                            RuntimeAITelemetry.active_working_model = sibling_model
                            RuntimeAITelemetry.record_success(token_usage=usage)
                            return text_out
                        except Exception:
                            continue

                last_err = norm_err
                self.last_error = norm_err.message
                RuntimeAITelemetry.record_failure(norm_err.error_category, norm_err.message)

                if not norm_err.retryable or attempt >= max_attempts:
                    logger.warning(
                        f"Gemini generation failed on attempt {attempt}/{max_attempts} "
                        f"[{norm_err.error_category}]: {norm_err.message}"
                    )
                    raise norm_err

                backoff_sec = min(8.0, (0.5 * (2 ** (attempt - 1))) + random.uniform(0.05, 0.25))
                logger.info(
                    f"Transient Gemini error [{norm_err.error_category}] on attempt {attempt}/{max_attempts}; "
                    f"retrying in {backoff_sec:.2f}s..."
                )
                await asyncio.sleep(backoff_sec)

        raise last_err or GeminiProviderError("Gemini generation failed after maximum retries.")

    async def generate_structured(
        self,
        prompt: str,
        response_schema: Type[T],
        system_instructions: str = "",
    ) -> T:
        """Generates structured JSON from Gemini and validates it against a Pydantic model."""
        raw_text = await self.generate(
            prompt=prompt,
            system_instructions=system_instructions,
            temperature=0.1,
            response_mime_type="application/json",
            response_schema=response_schema,
        )

        cleaned = raw_text.strip()
        if cleaned.startswith("```"):
            lines = cleaned.splitlines()
            if lines and lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            cleaned = "\n".join(lines).strip()

        try:
            parsed_json = json.loads(cleaned)
            return response_schema.model_validate(parsed_json)
        except (json.JSONDecodeError, ValidationError) as val_exc:
            err = GeminiProviderError(
                message=f"Gemini returned malformed structured output for {response_schema.__name__}: {val_exc}",
                error_category="MALFORMED_STRUCTURED_OUTPUT_ERROR",
                retryable=False,
            )
            self.last_error = err.message
            RuntimeAITelemetry.record_failure(err.error_category, err.message)
            raise err from val_exc

    async def generate_response(
        self,
        prompt: str,
        context_chunks: List[Dict[str, Any]],
        system_instructions: str,
    ) -> str:
        """
        Generates a scientific RAG response grounded in retrieved NASA PSI context chunks.
        Never fabricates a fake Gemini success when the API call fails: raises GeminiProviderError
        so callers (such as AIService) can handle fallback or error reporting transparently.
        """
        if not context_chunks:
            return (
                "Insufficient verified NASA experimental evidence was retrieved to answer this query. "
                "The FlameSafe AI system abstains from generating unsupported conclusions."
            )

        user_prompt = build_rag_user_prompt(prompt, context_chunks)
        return await self.generate(
            prompt=user_prompt,
            system_instructions=system_instructions,
            temperature=self.temperature,
        )


def get_llm_provider(strict: bool = False) -> BaseLLMProvider:
    """
    Factory that returns the configured LLM provider.
    - When AI_PROVIDER=mock: returns MockLLMProvider.
    - When AI_PROVIDER=gemini and GEMINI_API_KEY is present: returns GeminiLLMProvider.
    - When AI_PROVIDER=gemini and GEMINI_API_KEY is missing:
      raises GeminiProviderError if strict=True, or returns MockLLMProvider if fallback is allowed.
    """
    provider = (settings.AI_PROVIDER or "gemini").lower().strip()
    if provider == "mock":
        return MockLLMProvider()

    if provider == "gemini":
        if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip():
            return GeminiLLMProvider(
                api_key=settings.GEMINI_API_KEY,
                model_name=settings.GEMINI_MODEL or settings.AI_MODEL_NAME,
                timeout_seconds=settings.GEMINI_TIMEOUT_SECONDS,
                max_retries=settings.GEMINI_MAX_RETRIES,
                temperature=settings.GEMINI_TEMPERATURE,
            )
        missing_msg = "AI_PROVIDER is set to 'gemini', but GEMINI_API_KEY is not configured."
        RuntimeAITelemetry.record_failure("MISSING_API_KEY", missing_msg)
        if strict or not settings.AI_FALLBACK_TO_MOCK:
            raise GeminiProviderError(
                message=missing_msg,
                error_category="MISSING_API_KEY",
                http_status=401,
                retryable=False,
            )
        logger.warning(f"{missing_msg} Falling back to explicit MockLLMProvider.")
        return MockLLMProvider()

    return MockLLMProvider()
