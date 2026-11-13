"""AI Runtime Status & Safe Connectivity Verification Endpoint (/api/v1/ai/status)."""

from typing import Any, Dict, Optional

from fastapi import APIRouter, Query, status

from app.core.config import settings
from app.rag.embeddings import GeminiEmbeddingProvider
from app.rag.generator import (
    GeminiProviderError,
    RuntimeAITelemetry,
    get_llm_provider,
    sanitize_secret,
)

router = APIRouter(prefix="/ai", tags=["AI Diagnostics & Runtime Status"])


async def verify_gemini_connectivity(force_check: bool = False) -> Dict[str, Any]:
    """
    Executes a safe backend-side connectivity check when Gemini is configured.
    Never reports connected=True merely because an API key string exists in .env.
    """
    provider_cfg = (settings.AI_PROVIDER or "gemini").lower().strip()
    has_key = bool(settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip())
    configured = (provider_cfg == "gemini" and has_key) or provider_cfg == "mock"

    gen_model = settings.GEMINI_MODEL or settings.AI_MODEL_NAME or "gemini-3.8-flash"
    emb_model = settings.GEMINI_EMBEDDING_MODEL or settings.EMBEDDING_MODEL_NAME or "gemini-embedding-2"
    emb_dims = int(settings.GEMINI_EMBEDDING_DIMENSIONS or settings.EMBEDDING_DIMENSION or 768)

    if provider_cfg == "mock":
        return {
            "provider": "mock",
            "configured": True,
            "connected": False,
            "generation_model": "deterministic-grounded-synthesizer-v1",
            "embedding_model": "deterministic-sha256-v1",
            "embedding_dimensions": emb_dims,
            "is_mock_provider": True,
            "last_successful_request_at": RuntimeAITelemetry.last_successful_request_at,
            "last_error": RuntimeAITelemetry.last_error,
            "error_category": RuntimeAITelemetry.last_error_category,
            "token_usage": RuntimeAITelemetry.last_token_usage,
        }

    if not has_key:
        missing_err = "GEMINI_API_KEY is not configured in backend/.env."
        RuntimeAITelemetry.record_failure("MISSING_API_KEY", missing_err)
        return {
            "provider": provider_cfg,
            "configured": False,
            "connected": False,
            "generation_model": gen_model,
            "embedding_model": emb_model,
            "embedding_dimensions": emb_dims,
            "is_mock_provider": True,
            "last_successful_request_at": RuntimeAITelemetry.last_successful_request_at,
            "last_error": missing_err,
            "error_category": "MISSING_API_KEY",
            "token_usage": RuntimeAITelemetry.last_token_usage,
        }

    # Perform live verification if not yet verified or if force_check=True
    if force_check or RuntimeAITelemetry.connection_verified_at is None:
        try:
            probe = GeminiEmbeddingProvider(
                api_key=settings.GEMINI_API_KEY,
                model_name=emb_model,
                dimension=emb_dims,
                timeout_seconds=10,
                max_retries=0,
            )
            await probe.embed_query("FlameSafe microgravity connectivity check")
        except GeminiProviderError as err:
            RuntimeAITelemetry.record_failure(err.error_category, err.message)
        except Exception as exc:
            RuntimeAITelemetry.record_failure("PROVIDER_ERROR", sanitize_secret(str(exc)))

    is_connected = bool(RuntimeAITelemetry.connected)
    active_llm = get_llm_provider()
    is_mock_active = bool(active_llm.is_mock or not is_connected)

    return {
        "provider": provider_cfg,
        "configured": configured,
        "connected": is_connected,
        "generation_model": gen_model,
        "active_generation_model": RuntimeAITelemetry.active_working_model or gen_model,
        "embedding_model": emb_model,
        "embedding_dimensions": emb_dims,
        "is_mock_provider": is_mock_active,
        "last_successful_request_at": RuntimeAITelemetry.last_successful_request_at,
        "last_error": sanitize_secret(RuntimeAITelemetry.last_error or "") if RuntimeAITelemetry.last_error else None,
        "error_category": RuntimeAITelemetry.last_error_category,
        "token_usage": RuntimeAITelemetry.last_token_usage,
    }


@router.get("/status", status_code=status.HTTP_200_OK)
async def get_ai_status(
    verify: bool = Query(default=False, description="Force a fresh backend connectivity check against Gemini"),
) -> Dict[str, Any]:
    """
    Returns real-time AI provider configuration, verified connectivity status, models,
    dimensions, mock status, last successful request timestamp, and sanitized error details.
    Includes both top-level keys and `data` envelope for full frontend client compatibility.
    """
    status_payload = await verify_gemini_connectivity(force_check=verify)
    return {
        "success": True,
        "message": "AI runtime status retrieved",
        **status_payload,
        "data": status_payload,
    }
