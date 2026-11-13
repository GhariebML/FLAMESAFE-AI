from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.document_repo import DocumentRepository
from app.schemas.assistant import AssistantQueryRequest, AssistantQueryResponse
from app.rag.retriever import EvidenceRetriever
from app.rag.reranker import ScientificReranker
from app.rag.generator import get_llm_provider
from app.rag.citations import CitationValidator
from app.core.config import settings
from app.core.logging import logger


class AIService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.doc_repo = DocumentRepository(session)

    async def answer_query(self, req: AssistantQueryRequest) -> AssistantQueryResponse:
        logger.info(f"Processing scientific query: '{req.query}'")

        # 1. Fetch candidate chunks
        if req.investigation_id_filter:
            candidates = await self.doc_repo.get_chunks_for_investigation(req.investigation_id_filter)
        else:
            candidates = await self.doc_repo.get_all_chunks()

        if not candidates:
            return AssistantQueryResponse(
                query=req.query,
                answer=(
                    "No relevant indexed scientific documents found in the database. "
                    "Please verify that investigation documents and seed datasets are loaded."
                ),
                citations=[],
                scientific_uncertainty_note="No document corpus available for evidence retrieval.",
                has_sufficient_evidence=False,
                ai_provider=settings.AI_PROVIDER,
                model_name=settings.AI_MODEL_NAME,
            )

        # 2. Vector Retrieval
        retrieved = await EvidenceRetriever.retrieve(
            query=req.query,
            candidates=candidates,
            top_k=req.max_citations * 2,
            investigation_id_filter=req.investigation_id_filter,
        )

        # 3. Scientific Reranking
        reranked = ScientificReranker.rerank(req.query, retrieved)[: req.max_citations]

        if not reranked:
            return AssistantQueryResponse(
                query=req.query,
                answer=(
                    "Insufficient verified NASA experimental evidence was retrieved to answer this query with scientific certainty. "
                    "The FlameSafe AI system abstains from generating ungrounded assertions."
                ),
                citations=[],
                scientific_uncertainty_note="Similarity threshold not met across indexed combustion papers.",
                has_sufficient_evidence=False,
                ai_provider=settings.AI_PROVIDER,
                model_name=settings.AI_MODEL_NAME,
            )

        # 4. Context Construction
        context_chunks = []
        for chunk, score in reranked:
            doc = chunk.document
            inv = doc.investigation if doc else None
            context_chunks.append({
                "chunk_text": chunk.chunk_text,
                "acronym": inv.acronym if inv else "NASA-PSI",
                "document_title": doc.title if doc else "NASA Report",
                "section_name": chunk.section_name or "Results",
                "relevance_score": score,
            })

        # 5. LLM Answer Generation
        generator = get_llm_provider()
        answer = await generator.generate_response(
            prompt=req.query,
            context_chunks=context_chunks,
            system_instructions=(
                "You are an expert NASA microgravity combustion research assistant. "
                "Base all claims strictly on the provided experimental evidence. "
                "Never invent measurements, DOIs, or ungrounded conclusions."
            ),
        )

        # 6. Citation Verification
        citations = CitationValidator.build_citations(reranked)

        return AssistantQueryResponse(
            query=req.query,
            answer=answer,
            citations=citations,
            scientific_uncertainty_note=(
                "Findings are grounded in microgravity (0g) orbital flight experiments. "
                "Direct applicability to surface partial-gravity (Lunar 0.166g, Mars 0.38g) requires analytical scaling."
            ),
            has_sufficient_evidence=True,
            ai_provider=settings.AI_PROVIDER,
            model_name=settings.AI_MODEL_NAME,
        )
