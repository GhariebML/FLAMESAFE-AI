from fastapi import APIRouter
from app.api.v1.endpoints import (
    acquisitions,
    assistant,
    comparison,
    datasets,
    health,
    investigations,
    overview,
    psi,
    ranking,
    research,
    scenarios,
    sources,
)

api_v1_router = APIRouter()

api_v1_router.include_router(health.router)
api_v1_router.include_router(overview.router)
api_v1_router.include_router(investigations.router)
api_v1_router.include_router(comparison.router)
api_v1_router.include_router(ranking.router)
api_v1_router.include_router(scenarios.router)
api_v1_router.include_router(assistant.router)
api_v1_router.include_router(sources.router)
api_v1_router.include_router(research.router)
api_v1_router.include_router(psi.router)
api_v1_router.include_router(acquisitions.router)
api_v1_router.include_router(datasets.router)
