import math

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.data_source import DataSource
from app.models.evidence_chunk import EMBEDDING_SCHEMA_DIMENSION, EvidenceChunk
from app.models.research_document import ResearchDocument


class DocumentRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, document_id: str) -> ResearchDocument | None:
        query = (
            select(ResearchDocument)
            .where(ResearchDocument.id == document_id)
            .options(
                selectinload(ResearchDocument.evidence_chunks),
                selectinload(ResearchDocument.investigation),
            )
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def get_by_doi(self, doi: str) -> ResearchDocument | None:
        """Find a research document by exact DOI, eager-loading its chunks and parent investigation."""
        if not doi:
            return None
        query = (
            select(ResearchDocument)
            .where(ResearchDocument.doi == doi.strip())
            .options(
                selectinload(ResearchDocument.evidence_chunks),
                selectinload(ResearchDocument.investigation),
            )
        )
        result = await self.session.execute(query)
        return result.scalars().first()

    async def get_by_title_and_investigation(
        self, title: str, investigation_id: str
    ) -> ResearchDocument | None:
        """Find a document by title within an investigation, eager-loading chunks and investigation."""
        if not title or not investigation_id:
            return None
        query = (
            select(ResearchDocument)
            .where(
                ResearchDocument.title == title.strip(),
                ResearchDocument.investigation_id == investigation_id,
            )
            .options(
                selectinload(ResearchDocument.evidence_chunks),
                selectinload(ResearchDocument.investigation),
            )
        )
        result = await self.session.execute(query)
        return result.scalars().first()

    async def get_chunks_by_document_id(self, document_id: str) -> list[EvidenceChunk]:
        """Retrieve all evidence chunks belonging to a document with citation metadata."""
        query = (
            select(EvidenceChunk)
            .where(EvidenceChunk.document_id == document_id)
            .options(
                selectinload(EvidenceChunk.document).selectinload(ResearchDocument.investigation)
            )
            .order_by(EvidenceChunk.page_number.asc().nulls_last(), EvidenceChunk.id.asc())
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_chunks_for_investigation(
        self, investigation_id: str
    ) -> list[EvidenceChunk]:
        query = (
            select(EvidenceChunk)
            .join(ResearchDocument, EvidenceChunk.document_id == ResearchDocument.id)
            .where(ResearchDocument.investigation_id == investigation_id)
            .options(
                selectinload(EvidenceChunk.document).selectinload(ResearchDocument.investigation)
            )
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_all_chunks(self) -> list[EvidenceChunk]:
        query = select(EvidenceChunk).options(
            selectinload(EvidenceChunk.document).selectinload(ResearchDocument.investigation)
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_source_by_id(self, source_id: str) -> DataSource | None:
        query = (
            select(DataSource)
            .where(DataSource.id == source_id)
            .options(selectinload(DataSource.investigation))
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def list_all_sources(self) -> list[DataSource]:
        """Retrieve all data sources with their associated investigation eager-loaded."""
        query = select(DataSource).options(selectinload(DataSource.investigation))
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def list_all_documents(self) -> list[ResearchDocument]:
        """Retrieve all research documents with investigation and evidence chunks eager-loaded."""
        query = select(ResearchDocument).options(
            selectinload(ResearchDocument.investigation),
            selectinload(ResearchDocument.evidence_chunks),
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())

    @staticmethod
    def _in_memory_cosine_similarity(vec_a: list[float], vec_b: list[float]) -> float:
        if not vec_a or not vec_b or len(vec_a) != len(vec_b):
            return 0.0
        dot = sum(a * b for a, b in zip(vec_a, vec_b))
        norm_a = math.sqrt(sum(a * a for a in vec_a))
        norm_b = math.sqrt(sum(b * b for b in vec_b))
        if norm_a == 0.0 or norm_b == 0.0:
            return 0.0
        return dot / (norm_a * norm_b)

    async def search_similar_chunks(
        self,
        query_vector: list[float],
        top_k: int = 5,
        similarity_threshold: float | None = None,
        investigation_id_filter: str | None = None,
    ) -> list[tuple[EvidenceChunk, float]]:
        """
        Search for most similar evidence chunks to the query vector.
        Uses PostgreSQL pgvector cosine distance (<=>) when running on PostgreSQL,
        or Python cosine similarity fallback when running on SQLite / test environments.

        Args:
            query_vector: 768-dimensional float embedding vector.
            top_k: Maximum number of chunks to return.
            similarity_threshold: Minimum cosine similarity threshold [0.0, 1.0].
            investigation_id_filter: Optional investigation ID constraint.

        Returns:
            List of (EvidenceChunk, similarity_score) tuples ordered by descending similarity,
            with chunk.document and chunk.document.investigation eagerly loaded.
        """
        if not query_vector or len(query_vector) != EMBEDDING_SCHEMA_DIMENSION:
            raise ValueError(
                f"Query vector dimension must be {EMBEDDING_SCHEMA_DIMENSION}, "
                f"got {len(query_vector) if query_vector else 0}"
            )

        conn = await self.session.connection()
        dialect_name = conn.dialect.name

        if dialect_name == "postgresql":
            # Native pgvector cosine distance: d = chunk.embedding <=> query_vector
            distance_col = EvidenceChunk.embedding.cosine_distance(query_vector).label("distance")
            stmt = (
                select(EvidenceChunk, distance_col)
                .where(EvidenceChunk.embedding.is_not(None))
                .options(
                    selectinload(EvidenceChunk.document).selectinload(ResearchDocument.investigation)
                )
            )

            if investigation_id_filter:
                stmt = stmt.join(ResearchDocument, EvidenceChunk.document_id == ResearchDocument.id).where(
                    ResearchDocument.investigation_id == investigation_id_filter
                )

            if similarity_threshold is not None:
                max_distance = 1.0 - similarity_threshold
                stmt = stmt.where(distance_col <= max_distance)

            stmt = stmt.order_by(distance_col.asc()).limit(top_k)
            result = await self.session.execute(stmt)
            rows = result.all()
            return [(chunk, round(1.0 - float(dist), 4)) for chunk, dist in rows]

        else:
            # Fallback for SQLite / test environments
            candidates = await (
                self.get_chunks_for_investigation(investigation_id_filter)
                if investigation_id_filter
                else self.get_all_chunks()
            )

            scored: list[tuple[EvidenceChunk, float]] = []
            for chunk in candidates:
                if chunk.embedding is not None and len(chunk.embedding) == len(query_vector):
                    sim = self._in_memory_cosine_similarity(query_vector, chunk.embedding)
                    if similarity_threshold is None or sim >= similarity_threshold:
                        scored.append((chunk, round(sim, 4)))

            scored.sort(key=lambda x: x[1], reverse=True)
            return scored[:top_k]
