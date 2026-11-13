import json
from unittest.mock import AsyncMock, patch

import httpx
import pytest

from app.rag.generator import (
    BaseLLMProvider,
    GeminiAPIError,
    GeminiAuthenticationError,
    GeminiLLMProvider,
    GeminiNetworkError,
    GeminiRateLimitError,
    GeminiTimeoutError,
    MockLLMProvider,
    get_llm_provider,
)


@pytest.fixture
def sample_context_chunks():
    return [
        {
            "acronym": "BASS",
            "document_title": "Extinction of Solid Fuels in Microgravity",
            "section_name": "Results",
            "chunk_text": "Extinction of PMMA rods occurred at a forced convective flow of 0.8 cm/s.",
            "relevance_score": 0.95,
        },
        {
            "acronym": "SAFFIRE",
            "document_title": "Spacecraft Fire Safety Experiment-I",
            "section_name": "Discussion",
            "chunk_text": "Flames in 100 kPa atmosphere exhibited low spread rates under quiescent air.",
            "relevance_score": 0.88,
        },
    ]


@pytest.mark.asyncio
async def test_mock_provider_offline_generation(sample_context_chunks):
    """Verify MockLLMProvider operates offline and adheres to BaseLLMProvider interface."""
    provider = MockLLMProvider()
    assert isinstance(provider, BaseLLMProvider)

    response = await provider.generate_response(
        prompt="What is the extinction airflow velocity in BASS?",
        context_chunks=sample_context_chunks,
        system_instructions="NASA Fire Safety Guidelines",
    )

    assert "Based on NASA microgravity research findings" in response
    assert "convective ventilation" in response


@pytest.mark.asyncio
async def test_mock_provider_abstains_on_empty_context():
    """Verify MockLLMProvider abstains when no context chunks are supplied."""
    provider = MockLLMProvider()
    response = await provider.generate_response(
        prompt="Non-existent phenomenon",
        context_chunks=[],
        system_instructions="NASA Guidelines",
    )
    assert "Insufficient verified NASA experimental evidence" in response
    assert "abstains" in response


@pytest.mark.asyncio
async def test_gemini_provider_abstains_on_empty_context_without_http():
    """Verify GeminiLLMProvider abstains on empty context chunks without making HTTP calls."""
    mock_client = AsyncMock(spec=httpx.AsyncClient)
    provider = GeminiLLMProvider(
        api_key="fake-key-123",
        model_name="gemini-1.5-pro",
        client=mock_client,
    )

    response = await provider.generate_response(
        prompt="What is fire?",
        context_chunks=[],
        system_instructions="NASA Assistant",
    )

    assert "Insufficient verified NASA experimental evidence" in response
    mock_client.post.assert_not_called()


@pytest.mark.asyncio
async def test_gemini_successful_generation(sample_context_chunks):
    """Verify successful Gemini generation with correctly structured request and response."""
    fake_gemini_response = {
        "candidates": [
            {
                "content": {
                    "parts": [
                        {
                            "text": "In the BASS investigation, PMMA flame extinction was recorded at 0.8 cm/s forced flow."
                        }
                    ],
                    "role": "model",
                },
                "finishReason": "STOP",
            }
        ]
    }

    mock_client = AsyncMock(spec=httpx.AsyncClient)
    mock_response = httpx.Response(
        status_code=200,
        content=json.dumps(fake_gemini_response).encode("utf-8"),
        request=httpx.Request("POST", "https://test.url"),
    )
    mock_client.post.return_value = mock_response

    provider = GeminiLLMProvider(
        api_key="secret-gemini-key",
        model_name="models/gemini-1.5-pro",
        client=mock_client,
    )

    result = await provider.generate_response(
        prompt="Explain extinction velocity in BASS",
        context_chunks=sample_context_chunks,
        system_instructions="Act as NASA SI Assistant",
    )

    assert result == "In the BASS investigation, PMMA flame extinction was recorded at 0.8 cm/s forced flow."

    # Verify request payload and endpoint structure
    assert mock_client.post.call_count == 1
    call_args = mock_client.post.call_args
    called_url = call_args[0][0]
    called_json = call_args[1]["json"]
    called_headers = call_args[1]["headers"]

    # Verify normalized model URL (no duplicate models/)
    assert called_url == "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent"
    assert called_headers["x-goog-api-key"] == "secret-gemini-key"
    assert "systemInstruction" in called_json
    assert "CRITICAL SCIENTIFIC INTEGRITY INSTRUCTIONS" in called_json["systemInstruction"]["parts"][0]["text"]
    assert "Verified NASA Microgravity Context Passages" in called_json["contents"][0]["parts"][0]["text"]
    assert "[Evidence Passage 1]" in called_json["contents"][0]["parts"][0]["text"]


@pytest.mark.asyncio
async def test_gemini_authentication_error(sample_context_chunks):
    """Verify HTTP 401/403 triggers GeminiAuthenticationError."""
    mock_client = AsyncMock(spec=httpx.AsyncClient)
    mock_response = httpx.Response(
        status_code=401,
        content=b'{"error": {"code": 401, "message": "API key not valid."}}',
        request=httpx.Request("POST", "https://test.url"),
    )
    mock_client.post.return_value = mock_response

    provider = GeminiLLMProvider(
        api_key="invalid-key",
        client=mock_client,
    )

    with pytest.raises(GeminiAuthenticationError) as exc_info:
        await provider.generate_response(
            prompt="Test prompt",
            context_chunks=sample_context_chunks,
            system_instructions="Instructions",
        )

    assert "authentication failed" in str(exc_info.value).lower()


@pytest.mark.asyncio
async def test_gemini_rate_limit_error(sample_context_chunks):
    """Verify HTTP 429 triggers GeminiRateLimitError."""
    mock_client = AsyncMock(spec=httpx.AsyncClient)
    mock_response = httpx.Response(
        status_code=429,
        content=b'{"error": {"code": 429, "message": "Resource exhausted."}}',
        request=httpx.Request("POST", "https://test.url"),
    )
    mock_client.post.return_value = mock_response

    provider = GeminiLLMProvider(
        api_key="valid-key",
        client=mock_client,
    )

    with pytest.raises(GeminiRateLimitError) as exc_info:
        await provider.generate_response(
            prompt="Test prompt",
            context_chunks=sample_context_chunks,
            system_instructions="Instructions",
        )

    assert "rate limit exceeded" in str(exc_info.value).lower()


@pytest.mark.asyncio
async def test_gemini_server_error(sample_context_chunks):
    """Verify HTTP 500 triggers GeminiAPIError."""
    mock_client = AsyncMock(spec=httpx.AsyncClient)
    mock_response = httpx.Response(
        status_code=503,
        content=b'{"error": {"code": 503, "message": "Backend service unavailable."}}',
        request=httpx.Request("POST", "https://test.url"),
    )
    mock_client.post.return_value = mock_response

    provider = GeminiLLMProvider(
        api_key="valid-key",
        client=mock_client,
    )

    with pytest.raises(GeminiAPIError) as exc_info:
        await provider.generate_response(
            prompt="Test prompt",
            context_chunks=sample_context_chunks,
            system_instructions="Instructions",
        )

    assert "server error" in str(exc_info.value).lower()


@pytest.mark.asyncio
async def test_gemini_timeout_error(sample_context_chunks):
    """Verify timeout triggers GeminiTimeoutError."""
    mock_client = AsyncMock(spec=httpx.AsyncClient)
    mock_client.post.side_effect = httpx.TimeoutException("Read timeout after 30s")

    provider = GeminiLLMProvider(
        api_key="valid-key",
        timeout_seconds=30.0,
        client=mock_client,
    )

    with pytest.raises(GeminiTimeoutError) as exc_info:
        await provider.generate_response(
            prompt="Test prompt",
            context_chunks=sample_context_chunks,
            system_instructions="Instructions",
        )

    assert "timed out after 30" in str(exc_info.value)


@pytest.mark.asyncio
async def test_gemini_network_error(sample_context_chunks):
    """Verify connection error triggers GeminiNetworkError."""
    mock_client = AsyncMock(spec=httpx.AsyncClient)
    mock_client.post.side_effect = httpx.ConnectError("Failed to establish connection")

    provider = GeminiLLMProvider(
        api_key="valid-key",
        client=mock_client,
    )

    with pytest.raises(GeminiNetworkError) as exc_info:
        await provider.generate_response(
            prompt="Test prompt",
            context_chunks=sample_context_chunks,
            system_instructions="Instructions",
        )

    assert "network error" in str(exc_info.value).lower()


@pytest.mark.asyncio
async def test_gemini_safety_block_handling(sample_context_chunks):
    """Verify safety block in response triggers GeminiAPIError with reason."""
    blocked_response = {
        "promptFeedback": {
            "blockReason": "SAFETY",
        },
        "candidates": [],
    }

    mock_client = AsyncMock(spec=httpx.AsyncClient)
    mock_response = httpx.Response(
        status_code=200,
        content=json.dumps(blocked_response).encode("utf-8"),
        request=httpx.Request("POST", "https://test.url"),
    )
    mock_client.post.return_value = mock_response

    provider = GeminiLLMProvider(
        api_key="valid-key",
        client=mock_client,
    )

    with pytest.raises(GeminiAPIError) as exc_info:
        await provider.generate_response(
            prompt="Test prompt",
            context_chunks=sample_context_chunks,
            system_instructions="Instructions",
        )

    assert "safety filters: SAFETY" in str(exc_info.value)


@pytest.mark.asyncio
async def test_gemini_malformed_empty_candidate(sample_context_chunks):
    """Verify candidate with no text parts triggers GeminiAPIError."""
    malformed_response = {
        "candidates": [
            {
                "content": {"parts": []},
                "finishReason": "MAX_TOKENS",
            }
        ]
    }

    mock_client = AsyncMock(spec=httpx.AsyncClient)
    mock_response = httpx.Response(
        status_code=200,
        content=json.dumps(malformed_response).encode("utf-8"),
        request=httpx.Request("POST", "https://test.url"),
    )
    mock_client.post.return_value = mock_response

    provider = GeminiLLMProvider(
        api_key="valid-key",
        client=mock_client,
    )

    with pytest.raises(GeminiAPIError) as exc_info:
        await provider.generate_response(
            prompt="Test prompt",
            context_chunks=sample_context_chunks,
            system_instructions="Instructions",
        )

    assert "contains no text parts" in str(exc_info.value)


def test_get_llm_provider_selection():
    """Verify get_llm_provider selects Gemini when configured with key, or Mock otherwise."""
    with patch("app.rag.generator.settings") as mock_settings:
        # Case 1: AI_PROVIDER=gemini with key
        mock_settings.AI_PROVIDER = "gemini"
        mock_settings.GEMINI_API_KEY = "test-key"
        mock_settings.AI_MODEL_NAME = "gemini-1.5-pro"
        provider = get_llm_provider()
        assert isinstance(provider, GeminiLLMProvider)
        assert provider.api_key == "test-key"

        # Case 2: AI_PROVIDER=gemini but key is missing/empty -> fallback to MockLLMProvider
        mock_settings.AI_PROVIDER = "gemini"
        mock_settings.GEMINI_API_KEY = None
        provider = get_llm_provider()
        assert isinstance(provider, MockLLMProvider)

        # Case 3: AI_PROVIDER=mock -> MockLLMProvider
        mock_settings.AI_PROVIDER = "mock"
        mock_settings.GEMINI_API_KEY = "test-key"
        provider = get_llm_provider()
        assert isinstance(provider, MockLLMProvider)
