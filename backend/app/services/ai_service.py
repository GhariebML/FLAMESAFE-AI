from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.logging import logger
from app.rag.citations import CitationValidator
from app.rag.generator import get_llm_provider
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
                is_mock_provider=generator.is_mock,
                prompt_version="1.1.0",
            )

        # 2. Vector Retrieval
        retrieved = await EvidenceRetriever.retrieve(
            query=req.query,
            candidates=candidates,
            session=self.session,
            top_k=req.max_citations * 2,
            threshold=0.35,
            investigation_id_filter=req.investigation_id_filter,
        )

        # 3. Scientific Reranking
        reranked = ScientificReranker.rerank(req.query, retrieved)[: req.max_citations]

        # 4. Tri-State Abstention & Evidence Evaluation
        top_score = reranked[0][1] if reranked else 0.0
        has_domain_terms = CitationValidator.has_combustion_domain_terms(req.query)
        is_out_of_domain = not has_domain_terms and top_score < settings.SIMILARITY_THRESHOLD

        # Case 1: Out-of-Domain Query
        if is_out_of_domain:
            return AssistantQueryResponse(
                query=req.query,
                answer=(
                    "The FlameSafe AI Research Assistant is specialized exclusively in NASA microgravity "
                    "combustion experiments, spacecraft fire safety, and material flammability research. "
                    "This inquiry is outside the scope of indexed spaceflight investigations, and the system "
                    "abstains from generating ungrounded assertions on out-of-domain topics."
                ),
                citations=[],
                scientific_uncertainty_note="Query is outside the scope of indexed NASA microgravity combustion archives.",
                has_sufficient_evidence=False,
                ai_provider=settings.AI_PROVIDER,
                model_name=settings.AI_MODEL_NAME,
                is_mock_provider=generator.is_mock,
                prompt_version="1.1.0",
            )

        # Case 2: In-Domain Query with Insufficient Evidence
        min_evidence_score = 0.35
        if not reranked or top_score < min_evidence_score:
            return AssistantQueryResponse(
                query=req.query,
                answer=(
                    "Insufficient verified NASA experimental evidence was retrieved to answer this query with scientific certainty. "
                    "The FlameSafe AI system indexes microgravity combustion and spacecraft fire safety research and abstains from "
                    "generating ungrounded assertions when flight dataset evidence is below the required relevance threshold "
                    f"(top score: {top_score:.2f}, required: {min_evidence_score:.2f})."
                ),
                citations=[],
                scientific_uncertainty_note="Similarity threshold not met across indexed combustion papers.",
                has_sufficient_evidence=False,
                ai_provider=settings.AI_PROVIDER,
                model_name=settings.AI_MODEL_NAME,
                is_mock_provider=generator.is_mock,
                prompt_version="1.1.0",
            )

        # Case 3: In-Domain Query with Sufficient Evidence -> Proceed to Generation

        # 5. Context Construction
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

        # 6. LLM Answer Generation
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

        # 7. Citation Verification & Provenance Grounding Guarantee
        raw_citations = CitationValidator.build_citations(reranked)
        retrieved_chunks = [c for c, _ in reranked]
        citations = CitationValidator.validate_citations_match_chunks(raw_citations, retrieved_chunks)

        # Fail-safe: if all citations fail provenance validation, withhold response
        if not citations:
            return AssistantQueryResponse(
                query=req.query,
                answer=(
                    "Response withheld due to citation provenance validation failure: "
                    "no citations could be verified against the retrieved evidence chunks."
                ),
                citations=[],
                scientific_uncertainty_note="All proposed citations failed chunk provenance verification.",
                has_sufficient_evidence=False,
                ai_provider=settings.AI_PROVIDER,
                model_name=settings.AI_MODEL_NAME,
                is_mock_provider=generator.is_mock,
                prompt_version="1.1.0",
            )

        # 8. Sanitize Inline Citation References
        sanitized_answer = CitationValidator.sanitize_answer_inline_citations(answer, citations)

        # 9. Partial-Gravity Warning Protocol
        is_partial_gravity = CitationValidator.is_partial_gravity_query(req.query)
        if is_partial_gravity:
            partial_gravity_warning = CitationValidator.get_partial_gravity_warning()
            uncertainty_note = partial_gravity_warning
            if partial_gravity_warning not in sanitized_answer:
                final_answer = (
                    f"{sanitized_answer}\n\n"
                    f"> [!WARNING]\n"
                    f"> **Partial-Gravity Advisory**: {partial_gravity_warning}"
                )
            else:
                final_answer = sanitized_answer
        else:
            uncertainty_note = (
                "Findings are grounded in microgravity (0g) orbital flight experiments. "
                "Direct applicability to surface partial-gravity (Lunar 0.166g, Mars 0.38g) requires analytical scaling."
            )
            final_answer = sanitized_answer

        return AssistantQueryResponse(
            query=req.query,
            answer=final_answer,
            citations=citations,
            scientific_uncertainty_note=uncertainty_note,
            has_sufficient_evidence=True,
            ai_provider=settings.AI_PROVIDER,
            model_name=settings.AI_MODEL_NAME,
            is_mock_provider=generator.is_mock,
            prompt_version="1.1.0",
        )
