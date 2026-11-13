from typing import List, Optional, Tuple, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.investigation_repo import InvestigationRepository
from app.schemas.investigation import (
    InvestigationSummarySchema,
    InvestigationDetailSchema,
    InvestigationFilterParams,
)
from app.schemas.overview import (
    MissionOverviewResponse,
    DomainDistributionItem,
    FuelCategoryItem,
    RecentSourceItem,
)
from app.core.exceptions import InvestigationNotFoundError


class InvestigationService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repo = InvestigationRepository(session)

    async def get_overview(self) -> MissionOverviewResponse:
        total_inv, total_runs, total_meas, total_docs = await self.repo.get_counts()
        investigations, _ = await self.repo.list_investigations(limit=100)

        domain_map: Dict[str, Dict[str, int]] = {}
        fuel_map: Dict[str, int] = {}
        groups: List[str] = []
        recent_sources: List[RecentSourceItem] = []

        for inv in investigations:
            groups.append(inv.acronym)
            domain = inv.research_area or "General Combustion"
            if domain not in domain_map:
                domain_map[domain] = {"inv": 0, "runs": 0}
            domain_map[domain]["inv"] += 1
            domain_map[domain]["runs"] += len(inv.experimental_runs)

            for run in inv.experimental_runs:
                f_type = run.fuel_type or "Unclassified"
                fuel_map[f_type] = fuel_map.get(f_type, 0) + 1

            for src in inv.data_sources:
                recent_sources.append(
                    RecentSourceItem(
                        id=str(src.id),
                        source_name=src.source_name,
                        investigation_acronym=inv.acronym,
                        doi=src.doi or "N/A",
                        accessed_at=src.accessed_at.isoformat() if src.accessed_at else "2026-10-15T00:00:00Z",
                    )
                )

        domains_list = [
            DomainDistributionItem(domain=k, investigations_count=v["inv"], runs_count=v["runs"])
            for k, v in domain_map.items()
        ]
        fuels_list = [
            FuelCategoryItem(fuel_category=k, count=v)
            for k, v in fuel_map.items()
        ]

        coverage_summary = {
            "microgravity_regimes": "International Space Station (MSG, CIR) & Orbital Resupply (Cygnus)",
            "primary_combustion_modes": "Solid flammability, droplet combustion, smoke aerosol agglomeration, gaseous diffusion flames",
            "active_investigations_indexed": str(total_inv),
            "safety_focus": "Spacecraft, Lunar Habitat, and Mars Habitat exploration fire safety",
        }

        return MissionOverviewResponse(
            total_investigations=total_inv,
            total_experimental_runs=total_runs,
            total_measurements=total_meas,
            total_documents=total_docs,
            research_domains=domains_list,
            fuel_categories=fuels_list,
            investigation_groups=groups,
            recent_sources=recent_sources[:5],
            coverage_summary=coverage_summary,
        )

    async def list_investigations(
        self,
        filters: Optional[InvestigationFilterParams] = None,
        page: int = 1,
        page_size: int = 10,
    ) -> Tuple[List[InvestigationSummarySchema], int]:
        offset = (page - 1) * page_size
        items, total = await self.repo.list_investigations(filters=filters, offset=offset, limit=page_size)

        summaries = []
        for inv in items:
            fuel_types = sorted(list({r.fuel_type for r in inv.experimental_runs if r.fuel_type}))
            grav_regimes = sorted(list({r.gravity_regime for r in inv.experimental_runs if r.gravity_regime}))
            summaries.append(
                InvestigationSummarySchema(
                    id=str(inv.id),
                    psi_id=inv.psi_id,
                    acronym=inv.acronym,
                    title=inv.title,
                    research_area=inv.research_area,
                    description=inv.description,
                    doi=inv.doi,
                    source_url=inv.source_url,
                    experimental_runs_count=len(inv.experimental_runs),
                    documents_count=len(inv.research_documents),
                    primary_fuel_types=fuel_types,
                    gravity_regimes=grav_regimes,
                )
            )
        return summaries, total

    async def get_investigation_detail(self, investigation_id: str) -> InvestigationDetailSchema:
        inv = await self.repo.get_by_id(investigation_id)
        if not inv:
            raise InvestigationNotFoundError(investigation_id)
        return InvestigationDetailSchema.model_validate(inv)
