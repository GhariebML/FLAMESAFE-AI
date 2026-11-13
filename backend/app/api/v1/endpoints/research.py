"""Multi-Agent Research Intelligence API endpoints (/api/v1/research)."""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.orchestrator.supervisor import ChiefIntelligenceOrchestrator
from app.core.database import get_db
from app.models.multi_agent import ResearchRequest, WorkflowEvent
from app.schemas.common import APIResponseEnvelope
from app.schemas.multi_agent import (
    ApprovalDecisionRequest,
    ResearchRequestCreate,
    ResearchRequestDetailResponse,
    ReviseIntentRequest,
    WorkflowEventSchema,
)

router = APIRouter(prefix="/research", tags=["Multi-Agent Research Intelligence"])


def _serialize_request(req: ResearchRequest) -> ResearchRequestDetailResponse:
    """Converts a ResearchRequest ORM model into a typed ResearchRequestDetailResponse."""
    runs = sorted(
        req.agent_runs or [],
        key=lambda r: r.started_at.replace(tzinfo=None) if r.started_at else "",
    )
    events = sorted(
        req.workflow_events or [],
        key=lambda e: e.created_at.replace(tzinfo=None) if e.created_at else "",
    )

    return ResearchRequestDetailResponse(
        id=req.id,
        thread_id=req.thread_id,
        user_question=req.user_question,
        status=req.status,
        require_approval=req.require_approval,
        approval_status=req.approval_status,
        research_intent=req.research_intent,
        existing_data_coverage=req.existing_data_coverage,
        discovered_investigations=req.discovered_investigations or [],
        candidate_files=req.candidate_files or [],
        selected_files=req.selected_files or [],
        acquisition_summary=req.acquisition_summary,
        validation_summary=req.validation_summary,
        dataset_id=req.dataset_id,
        dataset_version_id=req.dataset_version_id,
        indexing_status=req.indexing_status,
        final_answer=req.final_answer,
        final_report=req.final_report,
        error_log=req.error_log or [],
        agent_runs=[
            {
                "id": r.id,
                "agent_id": r.agent_id,
                "agent_name": r.agent_name,
                "status": r.status,
                "input_summary": r.input_summary,
                "output_summary": r.output_summary,
                "tools_invoked": r.tools_invoked or [],
                "retry_count": r.retry_count,
                "error_category": r.error_category,
                "error_message": r.error_message,
                "started_at": r.started_at,
                "completed_at": r.completed_at,
            }
            for r in runs
        ],
        workflow_events=[
            {
                "id": e.id,
                "request_id": e.request_id,
                "thread_id": e.thread_id,
                "from_state": e.from_state,
                "to_state": e.to_state,
                "agent_id": e.agent_id,
                "event_type": e.event_type,
                "message": e.message,
                "payload": e.payload,
                "created_at": e.created_at,
            }
            for e in events
        ],
        created_at=req.created_at,
        updated_at=req.updated_at,
    )


@router.post(
    "/requests",
    response_model=APIResponseEnvelope[ResearchRequestDetailResponse],
    status_code=status.HTTP_201_CREATED,
)
async def create_research_request(
    payload: ResearchRequestCreate,
    db: AsyncSession = Depends(get_db),
):
    """Launches the 11-Agent Scientific Data Intelligence Workflow for a natural-language research question."""
    orchestrator = ChiefIntelligenceOrchestrator(db)
    req_row = await orchestrator.execute_request(
        query=payload.question,
        require_approval=payload.require_approval,
        force_psi_discovery=payload.force_psi_discovery,
    )
    return APIResponseEnvelope(data=_serialize_request(req_row))


@router.get(
    "/requests",
    response_model=APIResponseEnvelope[list[ResearchRequestDetailResponse]],
    status_code=status.HTTP_200_OK,
)
async def list_research_requests(
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
):
    """Lists recent multi-agent research requests with full status and audit logs."""
    res = await db.execute(
        select(ResearchRequest).order_by(desc(ResearchRequest.created_at)).limit(limit)
    )
    rows = list(res.scalars().all())
    return APIResponseEnvelope(data=[_serialize_request(r) for r in rows])


@router.get(
    "/requests/{request_id}",
    response_model=APIResponseEnvelope[ResearchRequestDetailResponse],
    status_code=status.HTTP_200_OK,
)
async def get_research_request(
    request_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Retrieves full state, discovered PSI investigations, file scores, dataset links, and final report."""
    res = await db.execute(select(ResearchRequest).where(ResearchRequest.id == request_id))
    req_row = res.scalars().first()
    if not req_row:
        raise HTTPException(status_code=404, detail=f"ResearchRequest '{request_id}' not found.")
    return APIResponseEnvelope(data=_serialize_request(req_row))


@router.get(
    "/requests/{request_id}/events",
    response_model=APIResponseEnvelope[list[WorkflowEventSchema]],
    status_code=status.HTTP_200_OK,
)
async def get_research_request_events(
    request_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Returns ordered workflow state transitions and agent audit events for a research request."""
    res = await db.execute(
        select(WorkflowEvent)
        .where(WorkflowEvent.request_id == request_id)
        .order_by(WorkflowEvent.created_at)
    )
    events = list(res.scalars().all())
    return APIResponseEnvelope(
        data=[
            WorkflowEventSchema(
                id=e.id,
                request_id=e.request_id,
                thread_id=e.thread_id,
                from_state=e.from_state,
                to_state=e.to_state,
                agent_id=e.agent_id,
                event_type=e.event_type,
                message=e.message,
                payload=e.payload,
                created_at=e.created_at,
            )
            for e in events
        ]
    )


@router.post(
    "/requests/{request_id}/approve",
    response_model=APIResponseEnvelope[ResearchRequestDetailResponse],
    status_code=status.HTTP_200_OK,
)
async def approve_research_request(
    request_id: str,
    payload: ApprovalDecisionRequest,
    db: AsyncSession = Depends(get_db),
):
    """Human-in-the-Loop endpoint to approve, modify, or reject file acquisition and resume workflow."""
    orchestrator = ChiefIntelligenceOrchestrator(db)
    try:
        req_row = await orchestrator.approve_and_resume(
            request_id=request_id,
            decision=payload.decision,
            approved_file_ids=payload.selected_file_identifiers,
            decided_by=payload.decided_by,
            reason=payload.reason,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return APIResponseEnvelope(data=_serialize_request(req_row))


@router.post(
    "/requests/{request_id}/revise",
    response_model=APIResponseEnvelope[ResearchRequestDetailResponse],
    status_code=status.HTTP_200_OK,
)
async def revise_research_intent(
    request_id: str,
    payload: ReviseIntentRequest,
    db: AsyncSession = Depends(get_db),
):
    """Allows a researcher to revise parsed scientific intent parameters and re-execute the workflow."""
    res = await db.execute(select(ResearchRequest).where(ResearchRequest.id == request_id))
    req_row = res.scalars().first()
    if not req_row:
        raise HTTPException(status_code=404, detail=f"ResearchRequest '{request_id}' not found.")

    if payload.updated_question:
        req_row.user_question = payload.updated_question

    current_intent: dict[str, Any] = dict(req_row.research_intent or {})
    if payload.fuel_type:
        current_intent["fuel_type"] = payload.fuel_type
    if payload.gravity_regime:
        current_intent["gravity_regime"] = payload.gravity_regime
    if payload.variables_of_interest:
        current_intent["variables_of_interest"] = payload.variables_of_interest
    current_intent["revised_by_user"] = True

    orchestrator = ChiefIntelligenceOrchestrator(db)
    updated_row = await orchestrator.execute_request(
        query=req_row.user_question,
        require_approval=payload.require_approval,
        force_psi_discovery=True,
        existing_request=req_row,
        revised_intent=current_intent,
    )
    return APIResponseEnvelope(data=_serialize_request(updated_row))


@router.post(
    "/requests/{request_id}/resume",
    response_model=APIResponseEnvelope[ResearchRequestDetailResponse],
    status_code=status.HTTP_200_OK,
)
async def resume_research_workflow(
    request_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Resumes a paused or interrupted research workflow from the latest checkpoint."""
    orchestrator = ChiefIntelligenceOrchestrator(db)
    try:
        req_row = await orchestrator.approve_and_resume(
            request_id=request_id,
            decision="RESUME_WORKFLOW",
            decided_by="System Resume",
            reason="Manual workflow resume triggered.",
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return APIResponseEnvelope(data=_serialize_request(req_row))
