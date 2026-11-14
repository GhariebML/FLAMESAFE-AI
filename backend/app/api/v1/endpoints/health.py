from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.core.database import get_db
from app.core.config import settings
from app.schemas.common import APIResponseEnvelope
from typing import Dict, Any

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=APIResponseEnvelope[Dict[str, Any]], status_code=status.HTTP_200_OK)
async def check_health(db: AsyncSession = Depends(get_db)):
    """Health check endpoint verifying backend and database connectivity."""
    db_status = "unhealthy"
    try:
        await db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"

    data = {
        "status": "healthy" if db_status == "connected" else "degraded",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "database_status": db_status,
        "ai_provider": settings.AI_PROVIDER,
        "embedding_provider": settings.EMBEDDING_PROVIDER,
    }

    return APIResponseEnvelope(
        success=True,
        message="FlameSafe AI backend service is healthy",
        data=data,
    )
