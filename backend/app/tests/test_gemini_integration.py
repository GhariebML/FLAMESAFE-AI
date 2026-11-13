"""
Comprehensive Unit, RAG, Multi-Agent, Diagnostics, and Opt-In Live Smoke Tests
for the Google Gemini API Integration (`google-genai`).
"""

import asyncio
import json
import os
from types import SimpleNamespace
from typing import Any, List
import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.nodes import MultiAgentNodes
from app.agents.orchestrator.supervisor import ChiefIntelligenceOrchestrator
from app.core.config import settings
from app.models.evidence_chunk import EvidenceChunk
from app.models.multi_agent import AgentRun
from app.rag.backfill import EmbeddingBackfillService
from app.rag.citations import CitationValidator
from app.rag.embeddings import (
    GeminiEmbeddingProvider,
    MockEmbeddingProvider,
    get_embedding_provider,
)
from app.rag.generator import (
    GeminiLLMProvider,
    GeminiProviderError,
    MockLLMProvider,
    RuntimeAITelemetry,
    get_llm_provider,
    sanitize_secret,
)
from app.rag.reranker import ScientificReranker
from app.rag.retriever import EvidenceRetriever
from app.repositories.document_repo import DocumentRepository
from app.schemas.assistant import AssistantQueryRequest
from app.schemas.multi_agent import ResearchIntentSchema
from app.services.ai_service import AIService


# ==============================================================================
# Mock Google GenAI Client Helpers for Deterministic Unit Tests
# ==============================================================================
class FakeGenAIModels:
    def __init__(self, generate_side_effects: List[Any] = None, embed_side_effects: List[Any] = None):
        self.generate_side_effects = list(generate_side_effects or [])
        self.embed_side_effects = list(embed_side_effects or [])
        self.generate_calls = 0
        self.embed_calls = 0

    async def generate_content(self, model: str, contents: Any, config: Any = None) -> Any:
        self.generate_calls += 1
        if not self.generate_side_effects:
            raise RuntimeError("No generate side effects configured")
        effect = self.generate_side_effects.pop(0)
        if isinstance(effect, Exception):
            raise effect
        return effect

    async def embed_content(self, model: str, contents: Any, config: Any = None) -> Any:
        self.embed_calls += 1
        if not self.embed_side_effects:
            raise RuntimeError("No embed side effects configured")
        effect = self.embed_side_effects.pop(0)
        if isinstance(effect, Exception):
            raise effect
        return effect


class FakeGenAIClient:
    def __init__(self, generate_side_effects: List[Any] = None, embed_side_effects: List[Any] = None):
        self.aio_models = FakeGenAIModels(generate_side_effects, embed_side_effects)
        self.aio = SimpleNamespace(models=self.aio_models)
        self.models = self.aio_models


# ==============================================================================
# 1. UNIT TESTS — GeminiLLMProvider & GeminiEmbeddingProvider
# ==============================================================================
@pytest.mark.asyncio
async def test_gemini_provider_initialization_and_missing_key():
    """Verifies GeminiLLMProvider and GeminiEmbeddingProvider initialization and missing key errors."""
    with pytest.raises(GeminiProviderError) as exc_info:
        GeminiLLMProvider(api_key="   ")
    assert exc_info.value.error_category == "MISSING_API_KEY"

    with pytest.raises(GeminiProviderError) as emb_exc:
        GeminiEmbeddingProvider(api_key="")
    assert emb_exc.value.error_category == "MISSING_API_KEY"

    fake_client = FakeGenAIClient()
    llm = GeminiLLMProvider(api_key="test-dummy-key-1234", model_name="gemini-3.8-flash", client=fake_client)
    assert llm.provider_name == "gemini"
    assert llm.model_name == "gemini-3.8-flash"
    assert llm.is_mock is False

    emb = GeminiEmbeddingProvider(
        api_key="test-dummy-key-1234",
        model_name="gemini-embedding-2",
        dimension=768,
        client=fake_client,
    )
    assert emb.provider_name == "gemini"
    assert emb.model_name == "gemini-embedding-2"
    assert emb.dimension == 768
    assert emb.is_mock is False


@pytest.mark.asyncio
async def test_gemini_valid_text_generation_and_token_usage():
    """Verifies valid text generation and token usage extraction via mocked GenAI client."""
    fake_response = SimpleNamespace(
        text="Microgravity eliminates buoyant convection in BASS-II PMMA tests [1].",
        candidates=[SimpleNamespace(finish_reason="STOP", content=SimpleNamespace(parts=[]))],
        usage_metadata=SimpleNamespace(
            prompt_token_count=120,
            candidates_token_count=45,
            total_token_count=165,
        ),
    )
    fake_client = FakeGenAIClient(generate_side_effects=[fake_response])
    llm = GeminiLLMProvider(api_key="dummy-key-secret", model_name="gemini-3.8-flash", client=fake_client)

    output = await llm.generate("Explain BASS-II PMMA flame spread.", system_instructions="Scientific mode")
    assert "BASS-II PMMA" in output
    assert llm.last_token_usage == {
        "prompt_tokens": 120,
        "completion_tokens": 45,
        "total_tokens": 165,
    }
    assert RuntimeAITelemetry.connected is True
    assert RuntimeAITelemetry.last_successful_request_at is not None


@pytest.mark.asyncio
async def test_gemini_structured_output_valid_and_malformed():
    """Verifies valid Pydantic structured JSON parsing and malformed JSON error normalization."""
    valid_json = json.dumps(
        {
            "intent_type": "scientific_comparison",
            "research_domain": "Solid Fuel Flammability & Suppression",
            "fuel_type": "Solid Polymer (PMMA)",
            "gravity_regime": "Microgravity (~0g)",
            "target_investigations": ["BASS-II", "SAFFIRE"],
            "variables_of_interest": ["flame_spread_rate", "oxygen_concentration"],
        }
    )
    good_resp = SimpleNamespace(
        text=valid_json,
        candidates=[SimpleNamespace(finish_reason="STOP")],
        usage_metadata=SimpleNamespace(prompt_token_count=50, candidates_token_count=30, total_token_count=80),
    )
    bad_resp = SimpleNamespace(
        text="{not_valid_json_at_all",
        candidates=[SimpleNamespace(finish_reason="STOP")],
        usage_metadata=None,
    )
    fake_client = FakeGenAIClient(generate_side_effects=[good_resp, bad_resp])
    llm = GeminiLLMProvider(api_key="dummy-key-secret", client=fake_client)

    parsed = await llm.generate_structured("Compare BASS-II and SAFFIRE", ResearchIntentSchema)
    assert isinstance(parsed, ResearchIntentSchema)
    assert parsed.intent_type == "scientific_comparison"
    assert "BASS-II" in parsed.target_investigations

    with pytest.raises(GeminiProviderError) as exc_info:
        await llm.generate_structured("Compare BASS-II and SAFFIRE", ResearchIntentSchema)
    assert exc_info.value.error_category == "MALFORMED_STRUCTURED_OUTPUT_ERROR"


@pytest.mark.asyncio
async def test_gemini_embedding_valid_invalid_dimensions_and_bilingual():
    """Verifies 768-d single & batch embeddings, English + Arabic support, and dimension mismatch error."""
    vec_768 = [0.0125] * 768
    vec_wrong = [0.5] * 256

    single_resp = SimpleNamespace(embeddings=[SimpleNamespace(values=vec_768)])
    arabic_resp = SimpleNamespace(embeddings=[SimpleNamespace(values=vec_768)])
    batch_resp = SimpleNamespace(
        embeddings=[SimpleNamespace(values=vec_768), SimpleNamespace(values=vec_768)]
    )
    wrong_dim_resp = SimpleNamespace(embeddings=[SimpleNamespace(values=vec_wrong)])

    fake_client = FakeGenAIClient(
        embed_side_effects=[single_resp, arabic_resp, batch_resp, wrong_dim_resp]
    )
    emb = GeminiEmbeddingProvider(
        api_key="dummy-key-secret",
        model_name="gemini-embedding-2",
        dimension=768,
        client=fake_client,
    )

    v_en = await emb.embed_query("Microgravity droplet combustion in FLEX")
    assert len(v_en) == 768

    v_ar = await emb.embed_query("تحليل انتشار اللهب في انعدام الجاذبية لوكالة ناسا")
    assert len(v_ar) == 768

    v_batch = await emb.embed_documents(["Chunk 1 English", "Chunk 2 العربية"])
    assert len(v_batch) == 2
    assert len(v_batch[0]) == 768

    with pytest.raises(GeminiProviderError) as dim_exc:
        await emb.embed_query("Test wrong dimension")
    assert dim_exc.value.error_category == "INVALID_EMBEDDING_DIMENSION_ERROR"


@pytest.mark.asyncio
async def test_gemini_empty_input_auth_rate_limit_timeout_and_retry():
    """Verifies empty input rejection, secret sanitization on auth error, bounded retry on 429, and timeout."""
    secret_key = "SUPER_SECRET_KEY_DO_NOT_LEAK_9999"

    # 1. Empty input
    fake_client = FakeGenAIClient()
    llm = GeminiLLMProvider(api_key=secret_key, max_retries=2, client=fake_client)
    emb = GeminiEmbeddingProvider(api_key=secret_key, max_retries=2, client=fake_client)

    with pytest.raises(GeminiProviderError) as empty_gen_exc:
        await llm.generate("   ")
    assert empty_gen_exc.value.error_category == "INVALID_REQUEST_ERROR"

    with pytest.raises(GeminiProviderError) as empty_emb_exc:
        await emb.embed_query("")
    assert empty_emb_exc.value.error_category == "INVALID_REQUEST_ERROR"

    # 2. Authentication error (401/400 API_KEY_INVALID): must NOT retry and must redact secret key
    auth_client = FakeGenAIClient(
        generate_side_effects=[
            RuntimeError(f"400 INVALID_ARGUMENT: API_KEY_INVALID for key {secret_key}")
        ]
    )
    auth_llm = GeminiLLMProvider(api_key=secret_key, max_retries=3, client=auth_client)
    with pytest.raises(GeminiProviderError) as auth_exc:
        await auth_llm.generate("Test auth failure")
    assert auth_exc.value.error_category == "AUTHENTICATION_ERROR"
    assert secret_key not in auth_exc.value.message
    assert "[REDACTED_API_KEY]" in auth_exc.value.message
    assert auth_client.aio_models.generate_calls == 1  # No retries on auth error

    # 3. Rate limit (429) followed by success on retry
    ok_resp = SimpleNamespace(
        text="Recovered after rate limit",
        candidates=[SimpleNamespace(finish_reason="STOP")],
        usage_metadata=SimpleNamespace(prompt_token_count=10, candidates_token_count=5, total_token_count=15),
    )
    retry_client = FakeGenAIClient(
        generate_side_effects=[
            RuntimeError("429 RESOURCE_EXHAUSTED: Rate limit exceeded"),
            ok_resp,
        ]
    )
    retry_llm = GeminiLLMProvider(api_key=secret_key, max_retries=2, client=retry_client)
    recovered_text = await retry_llm.generate("Test retry")
    assert recovered_text == "Recovered after rate limit"
    assert retry_client.aio_models.generate_calls == 2

    # 4. Timeout handling
    timeout_client = FakeGenAIClient(
        generate_side_effects=[asyncio.TimeoutError("Request timed out")]
    )
    timeout_llm = GeminiLLMProvider(api_key=secret_key, max_retries=0, client=timeout_client)
    with pytest.raises(GeminiProviderError) as tm_exc:
        await timeout_llm.generate("Test timeout")
    assert tm_exc.value.error_category == "TIMEOUT_ERROR"


@pytest.mark.asyncio
async def test_mock_and_gemini_provider_vector_isolation():
    """Verifies that EvidenceRetriever strictly isolates mock SHA-256 vectors from Gemini vectors."""
    mock_emb = MockEmbeddingProvider(dimension=768)
    fake_client = FakeGenAIClient(
        embed_side_effects=[SimpleNamespace(embeddings=[SimpleNamespace(values=[0.02] * 768)])]
    )
    gemini_emb = GeminiEmbeddingProvider(
        api_key="dummy-key",
        model_name="gemini-embedding-2",
        dimension=768,
        client=fake_client,
    )

    mock_chunk = EvidenceChunk(
        document_id="doc-1",
        chunk_text="BASS-II PMMA opposed flow flame spread rate.",
        embedding=[0.01] * 768,
        embedding_provider="mock",
        embedding_model="deterministic-sha256-v1",
        embedding_dimension=768,
    )
    gemini_chunk = EvidenceChunk(
        document_id="doc-1",
        chunk_text="BASS-II PMMA opposed flow flame spread rate.",
        embedding=[0.02] * 768,
        embedding_provider="gemini",
        embedding_model="gemini-embedding-2",
        embedding_dimension=768,
    )

    assert EvidenceRetriever.is_chunk_vector_compatible(mock_chunk, mock_emb, 768) is True
    assert EvidenceRetriever.is_chunk_vector_compatible(mock_chunk, gemini_emb, 768) is False
    assert EvidenceRetriever.is_chunk_vector_compatible(gemini_chunk, gemini_emb, 768) is True
    assert EvidenceRetriever.is_chunk_vector_compatible(gemini_chunk, mock_emb, 768) is False


# ==============================================================================
# 2. RAG & BACKFILL TESTS
# ==============================================================================
@pytest.mark.asyncio
async def test_rag_backfill_retrieval_reranking_and_insufficient_evidence(db_session: AsyncSession):
    """Tests chunk embedding backfill, vector retrieval, reranking, citations, and insufficient evidence."""
    fake_vec = [0.036] * 768

    class BatchFakeEmbedder(GeminiEmbeddingProvider):
        def __init__(self):
            self.api_key = "dummy"
            self.provider_name = "gemini"
            self.model_name = "gemini-embedding-2"
            self.dimension = 768
            self.is_mock = False

        async def embed_query(self, text: str) -> List[float]:
            return list(fake_vec)

        async def embed_documents(self, texts: List[str]) -> List[List[float]]:
            return [list(fake_vec) for _ in texts]

    embedder = BatchFakeEmbedder()
    summary = await EmbeddingBackfillService.backfill_chunks(
        session=db_session,
        embedder=embedder,
        batch_size=5,
        limit=10,
    )
    assert summary["updated_count"] > 0
    assert summary["target_provider"] == "gemini"
    assert summary["target_model"] == "gemini-embedding-2"
    assert summary["target_dimension"] == 768

    # Verify updated chunks via DocumentRepository (with eager-loaded document & investigation relationships)
    all_loaded_chunks = await DocumentRepository(db_session).get_all_chunks()
    gemini_chunks = [c for c in all_loaded_chunks if c.embedding_provider == "gemini"]
    assert len(gemini_chunks) == summary["updated_count"]

    retrieved = await EvidenceRetriever.retrieve(
        query="What is the PMMA flame spread rate in BASS-II?",
        candidates=gemini_chunks,
        top_k=3,
        embedder=embedder,
    )
    assert len(retrieved) > 0
    reranked = ScientificReranker.rerank("PMMA flame spread rate in BASS-II", retrieved)
    citations = CitationValidator.build_citations(reranked)
    assert len(citations) > 0

    # Insufficient evidence test with empty candidates
    empty_retrieved = await EvidenceRetriever.retrieve(
        query="Completely unrelated quantum graviton warp drive",
        candidates=[],
        top_k=3,
        embedder=embedder,
    )
    assert empty_retrieved == []


# ==============================================================================
# 3. MULTI-AGENT WORKFLOW & AI STATUS DIAGNOSTICS TESTS
# ==============================================================================
@pytest.mark.asyncio
async def test_agent_02_07_11_and_agent_run_metadata_logging(
    db_session: AsyncSession,
    client: AsyncClient,
):
    """Tests Agent 02 intent parsing, Agent 07 deterministic extraction, Agent 11 synthesis, and AgentRun telemetry."""
    nodes = MultiAgentNodes(db_session)

    # Agent 02 intent decomposition
    state_02 = await nodes.agent_02_query_understanding(
        {"user_query": "Compare PMMA and SIBAL flame spread rates in BASS-II and SAFFIRE"}
    )
    intent = state_02["research_intent"]
    assert "BASS-II" in intent["target_investigations"]
    assert "SAFFIRE" in intent["target_investigations"]
    assert "_ai_execution" in intent

    # Agent 07 deterministic extraction
    state_07 = await nodes.agent_07_scientific_extraction(
        {"research_intent": intent, "acquired_assets": []}
    )
    assert len(state_07["extracted_records"]) > 0

    # Full orchestrator run and AgentRun metadata verification
    orchestrator = ChiefIntelligenceOrchestrator(db_session)
    req_row = await orchestrator.execute_request(
        query="Compare PMMA flame spread rate in BASS-II",
        require_approval=False,
        force_psi_discovery=False,
    )
    assert req_row.status == "READY"
    assert req_row.final_report is not None
    assert "ai_provider" in req_row.final_report
    assert "is_mock_provider" in req_row.final_report

    runs_res = await db_session.execute(
        select(AgentRun).where(AgentRun.request_id == req_row.id)
    )
    agent_runs = list(runs_res.scalars().all())
    assert len(agent_runs) > 0
    for r in agent_runs:
        assert r.output_summary is not None
        assert "provider" in r.output_summary
        assert "model" in r.output_summary
        assert "is_mock_provider" in r.output_summary
        if settings.GEMINI_API_KEY:
            assert settings.GEMINI_API_KEY not in str(r.error_message or "")

    # Diagnostics endpoint GET /api/v1/ai/status
    status_resp = await client.get("/api/v1/ai/status")
    assert status_resp.status_code == 200
    body = status_resp.json()
    assert "provider" in body
    assert "configured" in body
    assert "connected" in body
    assert "generation_model" in body
    assert "embedding_model" in body
    assert "embedding_dimensions" in body
    assert body["embedding_dimensions"] == 768
    if settings.GEMINI_API_KEY:
        assert settings.GEMINI_API_KEY not in json.dumps(body)


# ==============================================================================
# 4. OPT-IN LIVE GEMINI SMOKE TEST (RUN_LIVE_GEMINI_TESTS=1)
# ==============================================================================
@pytest.mark.skipif(
    os.getenv("RUN_LIVE_GEMINI_TESTS") != "1" or not settings.GEMINI_API_KEY,
    reason="Opt-in live Gemini test; set RUN_LIVE_GEMINI_TESTS=1 and configure GEMINI_API_KEY to run.",
)
@pytest.mark.asyncio
async def test_live_gemini_smoke_suite(db_session: AsyncSession):
    """
    Opt-in live smoke test against Google's Gemini API endpoint:
    1. Live text generation call
    2. Live structured output call
    3. Live 768-dimensional embedding call
    4. Live RAG query
    """
    llm = GeminiLLMProvider(
        api_key=settings.GEMINI_API_KEY,
        model_name=settings.GEMINI_MODEL,
        max_retries=1,
    )
    text_res = await llm.generate("State one key difference between 0g and 1g combustion.")
    assert len(text_res) > 10

    intent_res = await llm.generate_structured(
        "Compare PMMA flame spread in BASS-II",
        ResearchIntentSchema,
    )
    assert isinstance(intent_res, ResearchIntentSchema)

    emb = GeminiEmbeddingProvider(
        api_key=settings.GEMINI_API_KEY,
        model_name=settings.GEMINI_EMBEDDING_MODEL,
        dimension=768,
        max_retries=1,
    )
    vec = await emb.embed_query("Microgravity combustion test")
    assert len(vec) == 768

    ai_service = AIService(db_session)
    rag_res = await ai_service.answer_query(
        AssistantQueryRequest(query="What is observed in BASS-II PMMA combustion?", max_citations=2)
    )
    assert rag_res.is_mock_provider is False
