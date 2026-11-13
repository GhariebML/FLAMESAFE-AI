import json
import math
from unittest.mock import AsyncMock, patch

import httpx
import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.evidence_chunk import EvidenceChunk
from app.models.investigation import Investigation
from app.models.research_document import ResearchDocument
from app.rag.embeddings import (
    BaseEmbeddingProvider,
    GeminiEmbeddingAPIError,
    GeminiEmbeddingAuthenticationError,
    GeminiEmbeddingNetworkError,
    GeminiEmbeddingProvider,
    GeminiEmbeddingRateLimitError,
    GeminiEmbeddingTimeoutError,
    MockEmbeddingProvider,
    compute_and_store_chunk_embeddings,
    get_embedding_provider,
)


def _vector_norm(vec: list[float]) -> float:
    return math.sqrt(sum(x * x for x in vec))


@pytest.mark.asyncio
async def test_mock_embedding_provider_deterministic_and_normalized():
    """Verify MockEmbeddingProvider generates deterministic 768-dim unit vectors."""
    provider = MockEmbeddingProvider(dimension=768)
    assert isinstance(provider, BaseEmbeddingProvider)

    vec1 = await provider.embed_query("Microgravity solid fuel extinction")
    vec2 = await provider.embed_query("Microgravity solid fuel extinction")
    vec3 = await provider.embed_query("Different query on smoke aerosols")

    assert len(vec1) == 768
    assert vec1 == vec2
    assert vec1 != vec3

    # Check normalization: norm should be approximately 1.0
    norm = _vector_norm(vec1)
    assert pytest.approx(norm, abs=1e-3) == 1.0

    # Test embed_documents
    docs = ["Doc 1 text", "Doc 2 text"]
    doc_vecs = await provider.embed_documents(docs)
    assert len(doc_vecs) == 2
    assert len(doc_vecs[0]) == 768
    assert len(doc_vecs[1]) == 768


@pytest.mark.asyncio
async def test_mock_embedding_empty_input():
    """Verify MockEmbeddingProvider handles empty strings gracefully."""
    provider = MockEmbeddingProvider(dimension=768)
    vec = await provider.embed_query("")
    assert len(vec) == 768
    assert all(x == 0.0 for x in vec)


@pytest.mark.asyncio
async def test_gemini_embed_query_success():
    """Verify GeminiEmbeddingProvider single query request construction and parsing."""
    fake_vector = [0.05] * 768
    fake_response_data = {
        "embedding": {
            "values": fake_vector,
        }
    }

    mock_client = AsyncMock(spec=httpx.AsyncClient)
    mock_response = httpx.Response(
        status_code=200,
        content=json.dumps(fake_response_data).encode("utf-8"),
        request=httpx.Request("POST", "https://test.url"),
    )
    mock_client.post.return_value = mock_response

    provider = GeminiEmbeddingProvider(
        api_key="test-api-key",
        model_name="models/text-embedding-004",
        expected_dimension=768,
        client=mock_client,
    )

    query_vec = await provider.embed_query("Quench airflow velocity in BASS")
    assert query_vec == fake_vector
    assert len(query_vec) == 768

    assert mock_client.post.call_count == 1
    call_args = mock_client.post.call_args
    called_url = call_args[0][0]
    called_json = call_args[1]["json"]
    called_headers = call_args[1]["headers"]

    assert called_url == "https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent"
    assert called_headers["x-goog-api-key"] == "test-api-key"
    assert called_json["taskType"] == "RETRIEVAL_QUERY"
    assert called_json["content"]["parts"][0]["text"] == "Quench airflow velocity in BASS"


@pytest.mark.asyncio
async def test_gemini_embed_documents_batching():
    """Verify GeminiEmbeddingProvider batch document embedding."""
    fake_vector_1 = [0.01] * 768
    fake_vector_2 = [0.02] * 768
    fake_response_data = {
        "embeddings": [
            {"values": fake_vector_1},
            {"values": fake_vector_2},
        ]
    }

    mock_client = AsyncMock(spec=httpx.AsyncClient)
    mock_response = httpx.Response(
        status_code=200,
        content=json.dumps(fake_response_data).encode("utf-8"),
        request=httpx.Request("POST", "https://test.url"),
    )
    mock_client.post.return_value = mock_response

    provider = GeminiEmbeddingProvider(
        api_key="test-api-key",
        model_name="text-embedding-004",
        expected_dimension=768,
        client=mock_client,
    )

    docs = ["Passage 1 content", "Passage 2 content"]
    doc_vecs = await provider.embed_documents(docs)

    assert len(doc_vecs) == 2
    assert doc_vecs[0] == fake_vector_1
    assert doc_vecs[1] == fake_vector_2

    assert mock_client.post.call_count == 1
    call_args = mock_client.post.call_args
    called_url = call_args[0][0]
    called_json = call_args[1]["json"]

    assert called_url == "https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:batchEmbedContents"
    assert len(called_json["requests"]) == 2
    assert called_json["requests"][0]["taskType"] == "RETRIEVAL_DOCUMENT"


@pytest.mark.asyncio
async def test_gemini_embedding_authentication_error():
    """Verify HTTP 401 raises GeminiEmbeddingAuthenticationError."""
    mock_client = AsyncMock(spec=httpx.AsyncClient)
    mock_client.post.return_value = httpx.Response(
        status_code=401,
        content=b'{"error": {"code": 401, "message": "API key invalid."}}',
        request=httpx.Request("POST", "https://test.url"),
    )

    provider = GeminiEmbeddingProvider(
        api_key="bad-key",
        client=mock_client,
    )

    with pytest.raises(GeminiEmbeddingAuthenticationError) as exc_info:
        await provider.embed_query("test query")

    assert "authentication failed" in str(exc_info.value).lower()


@pytest.mark.asyncio
async def test_gemini_embedding_rate_limit_error():
    """Verify HTTP 429 raises GeminiEmbeddingRateLimitError."""
    mock_client = AsyncMock(spec=httpx.AsyncClient)
    mock_client.post.return_value = httpx.Response(
        status_code=429,
        content=b'{"error": {"code": 429, "message": "Rate limit exceeded."}}',
        request=httpx.Request("POST", "https://test.url"),
    )

    provider = GeminiEmbeddingProvider(
        api_key="valid-key",
        client=mock_client,
    )

    with pytest.raises(GeminiEmbeddingRateLimitError) as exc_info:
        await provider.embed_query("test query")

    assert "rate limit exceeded" in str(exc_info.value).lower()


@pytest.mark.asyncio
async def test_gemini_embedding_server_error():
    """Verify HTTP 500 raises GeminiEmbeddingAPIError."""
    mock_client = AsyncMock(spec=httpx.AsyncClient)
    mock_client.post.return_value = httpx.Response(
        status_code=500,
        content=b'{"error": {"code": 500, "message": "Internal error."}}',
        request=httpx.Request("POST", "https://test.url"),
    )

    provider = GeminiEmbeddingProvider(
        api_key="valid-key",
        client=mock_client,
    )

    with pytest.raises(GeminiEmbeddingAPIError) as exc_info:
        await provider.embed_query("test query")

    assert "server error" in str(exc_info.value).lower()


@pytest.mark.asyncio
async def test_gemini_embedding_timeout_and_network_errors():
    """Verify timeouts and network errors raise appropriate exceptions."""
    mock_client = AsyncMock(spec=httpx.AsyncClient)
    mock_client.post.side_effect = httpx.TimeoutException("Read timed out")

    provider = GeminiEmbeddingProvider(
        api_key="valid-key",
        timeout_seconds=30.0,
        client=mock_client,
    )

    with pytest.raises(GeminiEmbeddingTimeoutError):
        await provider.embed_query("test query")

    mock_client.post.side_effect = httpx.ConnectError("Network down")
    with pytest.raises(GeminiEmbeddingNetworkError):
        await provider.embed_query("test query")


def test_get_embedding_provider_selection():
    """Verify get_embedding_provider selects Gemini when configured with key, or Mock otherwise."""
    with patch("app.rag.embeddings.settings") as mock_settings:
        # Case 1: AI_PROVIDER=gemini with key
        mock_settings.EMBEDDING_PROVIDER = "gemini"
        mock_settings.GEMINI_API_KEY = "test-key"
        mock_settings.EMBEDDING_MODEL_NAME = "text-embedding-004"
        mock_settings.EMBEDDING_DIMENSION = 768
        provider = get_embedding_provider()
        assert isinstance(provider, GeminiEmbeddingProvider)
        assert provider.api_key == "test-key"

        # Case 2: EMBEDDING_PROVIDER=mock -> MockEmbeddingProvider
        mock_settings.EMBEDDING_PROVIDER = "mock"
        provider = get_embedding_provider()
        assert isinstance(provider, MockEmbeddingProvider)


@pytest.mark.asyncio
async def test_compute_and_store_chunk_embeddings(db_session: AsyncSession):
    """Verify chunk embedding storage function updates database chunks without embeddings."""
    # Seed a test investigation and document
    inv = Investigation(
        id="test-inv-emb",
        psi_id="PSI-EMB-01",
        acronym="TEST-EMB",
        title="Embedding Test Investigation",
        research_area="Combustion",
    )
    doc = ResearchDocument(
        id="test-doc-emb",
        investigation_id="test-inv-emb",
        title="Test Document for Embeddings",
        document_type="Paper",
    )
    chunk1 = EvidenceChunk(
        id="chunk-emb-1",
        document_id="test-doc-emb",
        chunk_text="First test evidence passage regarding flame speed.",
        embedding=None,
    )
    chunk2 = EvidenceChunk(
        id="chunk-emb-2",
        document_id="test-doc-emb",
        chunk_text="Second test evidence passage regarding oxygen limits.",
        embedding=None,
    )

    db_session.add_all([inv, doc, chunk1, chunk2])
    await db_session.commit()

    # Run compute_and_store_chunk_embeddings using MockEmbeddingProvider
    embedder = MockEmbeddingProvider(dimension=768)
    updated_count = await compute_and_store_chunk_embeddings(
        session=db_session,
        embedder=embedder,
        batch_size=2,
    )

    assert updated_count >= 2

    # Query directly from database to verify persisted state
    res = await db_session.execute(select(EvidenceChunk).where(EvidenceChunk.id == "chunk-emb-1"))
    fetched = res.scalar_one()
    assert fetched.embedding is not None
    assert len(fetched.embedding) == 768
