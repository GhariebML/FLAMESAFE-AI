from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.logging import logger
from app.rag.citations import CitationValidator
from app.rag.generator import (
    GeminiProviderError,
    MockLLMProvider,
    get_llm_provider,
)
from app.rag.prompts import PROMPT_VERSION, SCIENTIFIC_SYSTEM_PROMPT
from app.rag.reranker import ScientificReranker
from app.rag.retriever import EvidenceRetriever
from app.repositories.document_repo import DocumentRepository
from app.schemas.assistant import AssistantQueryRequest, AssistantQueryResponse


class AIService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.doc_repo = DocumentRepository(session)

    async def answer_query(self, req: AssistantQueryRequest) -> AssistantQueryResponse:
        logger.info(f"Processing scientific query: '{req.query}'")
        generator = get_llm_provider()

        if req.investigation_id_filter:
            candidates = await self.doc_repo.get_chunks_for_investigation(req.investigation_id_filter)
        else:
            candidates = await self.doc_repo.get_all_chunks()

        if not candidates:
            return AssistantQueryResponse(
                query=req.query,
                answer=(
                    "No relevant indexed scientific documents were found for the selected filter. "
                    "Please verify that investigation documents and seed datasets are loaded."
                ),
                citations=[],
                scientific_uncertainty_note="No document corpus available for evidence retrieval.",
                has_sufficient_evidence=False,
                ai_provider=generator.provider_name,
                model_name=generator.model_name,
                is_mock_provider=generator.is_mock,
                execution_mode="MOCK_DEMO_MODE" if generator.is_mock else "LIVE_AI_MODE",
                prompt_version=PROMPT_VERSION,
                token_usage=generator.last_token_usage,
                ai_error=generator.last_error,
            )

        retrieved = await EvidenceRetriever.retrieve(
            query=req.query,
            candidates=candidates,
            top_k=req.max_citations * 2,
            investigation_id_filter=req.investigation_id_filter,
        )

        reranked = ScientificReranker.rerank(req.query, retrieved)[: req.max_citations]

        if not reranked:
            return AssistantQueryResponse(
                query=req.query,
                answer=(
                    "Insufficient verified NASA experimental evidence was retrieved to answer this query with scientific certainty. "
                    "The FlameSafe AI system abstains from generating ungrounded assertions."
                ),
                citations=[],
                scientific_uncertainty_note="Similarity threshold not met across indexed combustion publications.",
                has_sufficient_evidence=False,
                ai_provider=generator.provider_name,
                model_name=generator.model_name,
                is_mock_provider=generator.is_mock,
                execution_mode="MOCK_DEMO_MODE" if generator.is_mock else "LIVE_AI_MODE",
                prompt_version=PROMPT_VERSION,
                token_usage=generator.last_token_usage,
                ai_error=generator.last_error,
            )

        context_chunks = []
        for chunk, score in reranked:
            doc = chunk.document
            inv = doc.investigation if doc else None
            context_chunks.append({
                "chunk_text": chunk.chunk_text,
                "acronym": inv.acronym if inv else "NASA-PSI",
                "document_title": doc.title if doc else "NASA Report",
                "doi": doc.doi if doc else None,
                "page_number": chunk.page_number,
                "section_name": chunk.section_name or "Results",
                "relevance_score": score,
            })

        ai_error = None
        active_provider_name = generator.provider_name
        active_model_name = generator.model_name
        is_mock = generator.is_mock
        exec_mode = "MOCK_DEMO_MODE" if is_mock else "LIVE_AI_MODE"
        token_usage = {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}

        try:
            answer = await generator.generate_response(
                prompt=req.query,
                context_chunks=context_chunks,
                system_instructions=SCIENTIFIC_SYSTEM_PROMPT,
            )
            token_usage = dict(generator.last_token_usage or token_usage)
            active_model_name = getattr(generator, "last_model_used", None) or generator.model_name
        except GeminiProviderError as err:
            ai_error = err.message
            if not settings.AI_FALLBACK_TO_MOCK:
                raise
            logger.warning(
                f"Gemini generation failed during answer_query [{err.error_category}]: {err.message}. "
                "Using explicit MockLLMProvider fallback (marked is_mock_provider=True)."
            )
            fallback_gen = MockLLMProvider()
            answer = await fallback_gen.generate_response(
                prompt=req.query,
                context_chunks=context_chunks,
                system_instructions=SCIENTIFIC_SYSTEM_PROMPT,
            )
            active_provider_name = "mock"
            active_model_name = fallback_gen.model_name
            is_mock = True
            exec_mode = "MOCK_FALLBACK_MODE"

        citations = CitationValidator.build_citations(reranked)

        q_lower = req.query.lower()
        if any(term in q_lower for term in ["lunar", "moon", "mars", "martian", "0.166", "0.38", "habitat"]):
            uncertainty_note = (
                "Partial-Gravity Extrapolation Advisory: Retrieved empirical evidence originates from orbital microgravity (~0g) "
                "experiments (ISS/Cygnus). Lunar (~0.166g) and Martian (~0.38g) surface habitats introduce buoyant convective plumes "
                "that can increase flame spread rates relative to quiescent 0g baselines."
            )
        else:
            uncertainty_note = (
                "Findings are grounded in orbital microgravity (0g) flight experiments. "
                "Direct applicability to planetary partial-gravity (Lunar 0.166g, Mars 0.38g) requires analytical scaling."
            )

        return AssistantQueryResponse(
            query=req.query,
            answer=answer,
            citations=citations,
            scientific_uncertainty_note=uncertainty_note,
            has_sufficient_evidence=True,
            ai_provider=active_provider_name,
            model_name=active_model_name,
            is_mock_provider=is_mock,
            execution_mode=exec_mode,
            prompt_version=PROMPT_VERSION,
            token_usage=token_usage,
            ai_error=ai_error,
        )
