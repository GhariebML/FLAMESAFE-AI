from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.ai_service import AIService
from app.schemas.assistant import AssistantQueryRequest, AssistantQueryResponse
from app.schemas.common import APIResponseEnvelope

router = APIRouter(prefix="/assistant", tags=["Assistant"])


@router.post("/query", response_model=APIResponseEnvelope[AssistantQueryResponse], status_code=status.HTTP_200_OK)
async def query_assistant(
    payload: AssistantQueryRequest,
    db: AsyncSession = Depends(get_db),
):
    """Module 6: SI Research Assistant with evidence-based RAG and verified citations."""
    service = AIService(db)
    result = await service.answer_query(payload)
    return APIResponseEnvelope(
        success=True,
        message="Assistant query processed successfully",
        data=result,
    )
