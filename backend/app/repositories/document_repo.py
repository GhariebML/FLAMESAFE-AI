from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.research_document import ResearchDocument
from app.models.evidence_chunk import EvidenceChunk
from app.models.data_source import DataSource
from app.models.investigation import Investigation


class DocumentRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, document_id: str) -> Optional[ResearchDocument]:
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

    async def get_chunks_for_investigation(
        self, investigation_id: str
    ) -> List[EvidenceChunk]:
        query = (
            select(EvidenceChunk)
            .join(ResearchDocument, EvidenceChunk.document_id == ResearchDocument.id)
            .join(Investigation, ResearchDocument.investigation_id == Investigation.id)
            .where(
                (ResearchDocument.investigation_id == investigation_id)
                | (Investigation.psi_id == investigation_id)
                | (Investigation.acronym.ilike(investigation_id))
            )
            .options(
                selectinload(EvidenceChunk.document).selectinload(ResearchDocument.investigation)
            )
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_all_chunks(self) -> List[EvidenceChunk]:
        query = select(EvidenceChunk).options(
            selectinload(EvidenceChunk.document).selectinload(ResearchDocument.investigation)
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_source_by_id(self, source_id: str) -> Optional[DataSource]:
        query = select(DataSource).where(DataSource.id == source_id)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def list_all_sources(self) -> List[DataSource]:
        query = select(DataSource).options(selectinload(DataSource.investigation))
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def list_all_documents(self) -> List[ResearchDocument]:
        query = select(ResearchDocument).options(
            selectinload(ResearchDocument.investigation),
            selectinload(ResearchDocument.evidence_chunks),
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())
