import math

from sqlalchemy import select, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.logging import logger
from app.models.evidence_chunk import EvidenceChunk
from app.models.research_document import ResearchDocument
from app.rag.embeddings import get_embedding_provider

STOP_WORDS = frozenset({
    "what",
    "which",
    "where",
    "when",
    "that",
    "this",
    "from",
    "with",
    "have",
    "were",
    "does",
    "about",
    "under",
    "into",
    "than",
    "more",
    "most",
    "been",
    "their",
    "there",
    "these",
    "those",
    "such",
    "show",
    "shown",
    "shows",
    "during",
    "after",
    "before",
    "flame",
    "flames",
    "fire",
    "fires",
    "combustion",
    "microgravity",
    "gravity",
    "space",
    "spacecraft",
})


class EvidenceRetriever:
    """
    Retrieves relevant scientific text chunks based on semantic similarity.
    Supports pgvector accelerated cosine distance in PostgreSQL with an in-memory
    mathematical fallback for SQLite and offline testing.
    """

    @staticmethod
    def _cosine_similarity(vec_a: list[float], vec_b: list[float]) -> float:
        if not vec_a or not vec_b or len(vec_a) != len(vec_b):
            return 0.0
        dot = sum(a * b for a, b in zip(vec_a, vec_b))
        norm_a = math.sqrt(sum(a * a for a in vec_a))
        norm_b = math.sqrt(sum(b * b for b in vec_b))
        if norm_a == 0.0 or norm_b == 0.0:
            return 0.0
        return dot / (norm_a * norm_b)

    @staticmethod
    def _match_term(term: str, text: str) -> bool:
        return term in text or bool(len(term) >= 6 and term[:5] in text)

    @classmethod
    async def retrieve_in_memory(
        cls,
        query: str,
        candidates: list[EvidenceChunk],
        top_k: int = 5,
        threshold: float = 0.35,
        investigation_id_filter: str | None = None,
    ) -> list[tuple[EvidenceChunk, float]]:
        """In-memory cosine similarity retrieval with keyword boosting for SQLite / test environments."""
        if not candidates:
            return []

        embedder = get_embedding_provider()
        query_vec = await embedder.embed_query(query)
        scored: list[tuple[EvidenceChunk, float]] = []

        q_clean = query.lower().replace("-", " ")
        q_terms = [
            t.strip("?,.;:!\"'")
            for t in q_clean.split()
            if len(t) > 3 and t.strip("?,.;:!\"'") not in STOP_WORDS
        ]

        for chunk in candidates:
            if investigation_id_filter:
                doc = chunk.document
                if doc and str(doc.investigation_id) != investigation_id_filter:
                    continue

            sim = 0.0
            if chunk.embedding and len(chunk.embedding) == len(query_vec):
                sim = cls._cosine_similarity(query_vec, chunk.embedding)
            else:
                chunk_vec = await embedder.embed_query(chunk.chunk_text)
                sim = cls._cosine_similarity(query_vec, chunk_vec)

            # Boost if query terms appear in text or associated metadata
            search_corpus = chunk.chunk_text.lower()
            if chunk.section_name:
                search_corpus += " " + chunk.section_name.lower()
            doc = chunk.document
            acronym_match = False
            if doc:
                if doc.title:
                    search_corpus += " " + doc.title.lower()
                if doc.investigation:
                    if doc.investigation.acronym:
                        inv_acr = doc.investigation.acronym.lower()
                        search_corpus += " " + inv_acr
                        if inv_acr in q_terms:
                            acronym_match = True
                    if doc.investigation.title:
                        search_corpus += " " + doc.investigation.title.lower()

            keyword_bonus = sum(0.1 for t in q_terms if cls._match_term(t, search_corpus))
            if acronym_match:
                keyword_bonus += 0.20

            final_score = min(1.0, max(0.0, sim) * 0.7 + min(0.4, keyword_bonus))

            if final_score >= threshold:
                scored.append((chunk, round(final_score, 4)))

        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:top_k]

    @classmethod
    async def retrieve_pgvector(
        cls,
        session: AsyncSession,
        query: str,
        top_k: int = 5,
        threshold: float = 0.35,
        investigation_id_filter: str | None = None,
    ) -> list[tuple[EvidenceChunk, float]]:
        """
        Executes native pgvector cosine similarity search in PostgreSQL using the <=> operator.
        Cosine similarity = 1 - cosine distance.
        """
        embedder = get_embedding_provider()
        query_vec = await embedder.embed_query(query)
        vec_str = "[" + ",".join(str(x) for x in query_vec) + "]"

        # Raw pgvector query ordering by cosine distance <=>
        raw_sql = text("""
            SELECT ec.id,
                   (1.0 - (ec.embedding <=> CAST(:vec_str AS vector))) AS similarity
            FROM evidence_chunks ec
            JOIN research_documents rd ON ec.document_id = rd.id
            WHERE (:inv_id IS NULL OR rd.investigation_id = :inv_id)
              AND ec.embedding IS NOT NULL
            ORDER BY ec.embedding <=> CAST(:vec_str AS vector) ASC
            LIMIT :top_k
        """)

        params = {
            "vec_str": vec_str,
            "inv_id": investigation_id_filter,
            "top_k": top_k * 2,
        }

        result = await session.execute(raw_sql, params)
        rows = result.fetchall()

        if not rows:
            return []

        chunk_ids = [r[0] for r in rows]
        score_map = {r[0]: float(r[1]) for r in rows}

        # Load chunks with relationships eagerly
        query_chunks = (
            select(EvidenceChunk)
            .where(EvidenceChunk.id.in_(chunk_ids))
            .options(selectinload(EvidenceChunk.document).selectinload(ResearchDocument.investigation))
        )
        loaded_res = await session.execute(query_chunks)
        loaded_chunks = {c.id: c for c in loaded_res.scalars().all()}

        scored: list[tuple[EvidenceChunk, float]] = []
        q_clean = query.lower().replace("-", " ")
        q_terms = [t.strip("?,.;:!\"'") for t in q_clean.split() if len(t) > 3 and t.strip("?,.;:!\"'") not in STOP_WORDS]

        for cid in chunk_ids:
            chunk = loaded_chunks.get(cid)
            if not chunk:
                continue
            base_sim = score_map.get(cid, 0.0)
            search_corpus = chunk.chunk_text.lower()
            if chunk.section_name:
                search_corpus += " " + chunk.section_name.lower()
            doc = chunk.document
            acronym_match = False
            if doc:
                if doc.title:
                    search_corpus += " " + doc.title.lower()
                if doc.investigation:
                    if doc.investigation.acronym:
                        inv_acr = doc.investigation.acronym.lower()
                        search_corpus += " " + inv_acr
                        if inv_acr in q_terms:
                            acronym_match = True
                    if doc.investigation.title:
                        search_corpus += " " + doc.investigation.title.lower()

            keyword_bonus = sum(0.1 for t in q_terms if cls._match_term(t, search_corpus))
            if acronym_match:
                keyword_bonus += 0.20

            final_score = min(1.0, max(0.0, base_sim) * 0.7 + min(0.4, keyword_bonus))

            if final_score >= threshold:
                scored.append((chunk, round(final_score, 4)))

        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:top_k]

    @classmethod
    async def retrieve(
        cls,
        query: str,
        candidates: list[EvidenceChunk] | None = None,
        session: AsyncSession | None = None,
        top_k: int = 5,
        threshold: float = 0.35,
        investigation_id_filter: str | None = None,
    ) -> list[tuple[EvidenceChunk, float]]:
        """
        Unified retrieval entrypoint.
        Dispatches to PostgreSQL pgvector when active and supported; falls back
        gracefully to in-memory cosine similarity for SQLite and test environments.
        """
        if session is not None:
            bind = session.bind or session.get_bind()
            dialect_name = bind.dialect.name if bind else "sqlite"
            if dialect_name == "postgresql":
                try:
                    logger.info("Executing native pgvector retrieval on PostgreSQL")
                    return await cls.retrieve_pgvector(
                        session=session,
                        query=query,
                        top_k=top_k,
                        threshold=threshold,
                        investigation_id_filter=investigation_id_filter,
                    )
                except (SQLAlchemyError, Exception) as e:  # noqa: BLE001
                    logger.warning(
                        f"pgvector query failed ({e}); falling back to in-memory cosine retrieval"
                    )

        # Fallback to in-memory cosine calculation
        return await cls.retrieve_in_memory(
            query=query,
            candidates=candidates or [],
            top_k=top_k,
            threshold=threshold,
            investigation_id_filter=investigation_id_filter,
        )
