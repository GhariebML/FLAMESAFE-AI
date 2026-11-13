from typing import List, Optional, Tuple
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.investigation import Investigation
from app.models.experimental_run import ExperimentalRun
from app.models.measurement import Measurement
from app.models.research_document import ResearchDocument
from app.models.data_source import DataSource
from app.schemas.investigation import InvestigationFilterParams


class InvestigationRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, investigation_id: str) -> Optional[Investigation]:
        query = (
            select(Investigation)
            .where(or_(Investigation.id == investigation_id, Investigation.psi_id == investigation_id))
            .options(
                selectinload(Investigation.experimental_runs).selectinload(ExperimentalRun.measurements),
                selectinload(Investigation.research_documents),
                selectinload(Investigation.data_sources),
            )
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def list_investigations(
        self,
        filters: Optional[InvestigationFilterParams] = None,
        offset: int = 0,
        limit: int = 10,
    ) -> Tuple[List[Investigation], int]:
        query = select(Investigation).options(
            selectinload(Investigation.experimental_runs),
            selectinload(Investigation.research_documents),
        )

        if filters:
            if filters.query:
                search = f"%{filters.query}%"
                query = query.where(
                    or_(
                        Investigation.title.ilike(search),
                        Investigation.acronym.ilike(search),
                        Investigation.description.ilike(search),
                        Investigation.objectives.ilike(search),
                    )
                )
            if filters.research_area:
                query = query.where(Investigation.research_area.ilike(f"%{filters.research_area}%"))
            if filters.acronym:
                query = query.where(Investigation.acronym.ilike(f"%{filters.acronym}%"))

        count_query = select(func.count()).select_from(query.subquery())
        total = (await self.session.execute(count_query)).scalar_one()

        paginated_query = query.offset(offset).limit(limit)
        result = await self.session.execute(paginated_query)
        items = list(result.scalars().all())

        return items, total

    async def get_by_ids(self, ids: List[str]) -> List[Investigation]:
        query = (
            select(Investigation)
            .where(or_(Investigation.id.in_(ids), Investigation.psi_id.in_(ids)))
            .options(
                selectinload(Investigation.experimental_runs).selectinload(ExperimentalRun.measurements),
                selectinload(Investigation.research_documents),
                selectinload(Investigation.data_sources),
            )
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_counts(self) -> Tuple[int, int, int, int]:
        total_inv = (await self.session.execute(select(func.count(Investigation.id)))).scalar_one()
        total_runs = (await self.session.execute(select(func.count(ExperimentalRun.id)))).scalar_one()
        total_meas = (await self.session.execute(select(func.count(Measurement.id)))).scalar_one()
        total_docs = (await self.session.execute(select(func.count(ResearchDocument.id)))).scalar_one()
        return total_inv, total_runs, total_meas, total_docs
