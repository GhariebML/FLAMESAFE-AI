"""AGENT 01 — Chief Intelligence Orchestrator implemented with LangGraph StateGraph and DB checkpointing."""

from datetime import datetime, timezone
from typing import Any

from langgraph.graph import END, START, StateGraph
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.nodes import MultiAgentNodes
from app.agents.state import ResearchWorkflowState
from app.models.multi_agent import (
    AgentCheckpoint,
    AgentRun,
    DatasetApproval,
    ResearchRequest,
    WorkflowEvent,
)


class ChiefIntelligenceOrchestrator:
    """AGENT 01: Coordinates Agents 02-11 using a compiled LangGraph StateGraph with durable SQLAlchemy audit logs."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.nodes = MultiAgentNodes(db)

    async def _log_agent_step(
        self,
        request_id: str,
        thread_id: str,
        agent_id: str,
        agent_name: str,
        step_index: int,
        tools_invoked: list[str],
        input_summary: dict[str, Any],
        output_summary: dict[str, Any],
        started_at: datetime,
        from_state: str,
        to_state: str,
        message: str,
        full_state: ResearchWorkflowState,
    ) -> None:
        """Persists AgentRun, WorkflowEvent, and AgentCheckpoint rows for full scientific auditability."""
        now = datetime.now(timezone.utc)
        run_row = AgentRun(
            request_id=request_id,
            thread_id=thread_id,
            agent_id=agent_id,
            agent_name=agent_name,
            status="COMPLETED",
            input_summary=input_summary,
            output_summary=output_summary,
            tools_invoked=tools_invoked,
            retry_count=0,
            started_at=started_at,
            completed_at=now,
        )
        self.db.add(run_row)

        event_row = WorkflowEvent(
            request_id=request_id,
            thread_id=thread_id,
            agent_id=agent_id,
            event_type="STATE_TRANSITION",
            from_state=from_state,
            to_state=to_state,
            message=message,
            payload=output_summary,
        )
        self.db.add(event_row)

        compact_state = {
            k: v
            for k, v in full_state.items()
            if k not in ("extracted_records", "mapped_records", "validated_records")
        }
        ckpt_row = AgentCheckpoint(
            request_id=request_id,
            thread_id=thread_id,
            step_name=f"{step_index:02d}_{agent_id}",
            workflow_state=compact_state,
            checkpoint_version=step_index,
        )
        self.db.add(ckpt_row)
        await self.db.commit()

    def build_graph(self, thread_id: str, start_from_acquisition: bool = False):
        """Compiles the LangGraph StateGraph for either a fresh run or post-approval resume."""
        graph = StateGraph(ResearchWorkflowState)

        async def node_02(state: ResearchWorkflowState) -> dict[str, Any]:
            t0 = datetime.now(timezone.utc)
            prev = state.get("workflow_status", "PARSING_INTENT")
            updates = await self.nodes.agent_02_query_understanding(state)
            merged = {**state, **updates}
            await self._log_agent_step(
                request_id=state["request_id"],
                thread_id=thread_id,
                agent_id="AGENT_02",
                agent_name="Query Understanding Agent",
                step_index=1,
                tools_invoked=["parse_research_intent", "extract_domain_entities"],
                input_summary={"query": state.get("user_query")},
                output_summary=updates.get("research_intent", {}),
                started_at=t0,
                from_state=prev,
                to_state=updates["workflow_status"],
                message=f"Parsed scientific intent: domain='{updates['research_intent'].get('research_domain')}'",
                full_state=merged,
            )
            return updates

        async def node_03(state: ResearchWorkflowState) -> dict[str, Any]:
            t0 = datetime.now(timezone.utc)
            prev = state.get("workflow_status", "CHECKING_EXISTING_DATA")
            updates = await self.nodes.agent_03_existing_knowledge(state)
            merged = {**state, **updates}
            cov = updates.get("existing_investigations", {})
            await self._log_agent_step(
                request_id=state["request_id"],
                thread_id=thread_id,
                agent_id="AGENT_03",
                agent_name="Existing Knowledge & Dataset Reuse Agent",
                step_index=2,
                tools_invoked=["check_local_investigations", "check_reusable_datasets"],
                input_summary={"target_investigations": state.get("research_intent", {}).get("target_investigations")},
                output_summary=cov if isinstance(cov, dict) else {"classification": updates["coverage_status"]},
                started_at=t0,
                from_state=prev,
                to_state=updates["workflow_status"],
                message=f"Existing database coverage evaluated as {updates['coverage_status']}.",
                full_state=merged,
            )
            return updates

        async def node_04(state: ResearchWorkflowState) -> dict[str, Any]:
            t0 = datetime.now(timezone.utc)
            prev = state.get("workflow_status", "DISCOVERING_PSI")
            updates = await self.nodes.agent_04_psi_discovery(state)
            merged = {**state, **updates}
            await self._log_agent_step(
                request_id=state["request_id"],
                thread_id=thread_id,
                agent_id="AGENT_04",
                agent_name="NASA PSI Discovery Agent",
                step_index=3,
                tools_invoked=["PSIDiscoveryService.search_investigations", "PSISourceValidator.validate_source_url"],
                input_summary={"research_domain": state.get("research_intent", {}).get("research_domain")},
                output_summary={
                    "psi_candidates_count": len(updates["psi_candidates"]),
                    "top_campaign": updates["psi_candidates"][0]["acronym"] if updates["psi_candidates"] else None,
                },
                started_at=t0,
                from_state=prev,
                to_state=updates["workflow_status"],
                message=f"Discovered {len(updates['psi_candidates'])} relevant NASA PSI investigations.",
                full_state=merged,
            )
            return updates

        async def node_05(state: ResearchWorkflowState) -> dict[str, Any]:
            t0 = datetime.now(timezone.utc)
            prev = state.get("workflow_status", "SELECTING_FILES")
            updates = await self.nodes.agent_05_file_selection(state)
            merged = {**state, **updates}
            await self._log_agent_step(
                request_id=state["request_id"],
                thread_id=thread_id,
                agent_id="AGENT_05",
                agent_name="File Intelligence & Selection Agent",
                step_index=4,
                tools_invoked=["PSIFileManifestService.score_and_select_files"],
                input_summary={"candidate_investigations": len(state.get("psi_candidates", []))},
                output_summary={
                    "selected_files_count": len(updates["selected_files"]),
                    "excluded_files_count": len(updates["excluded_files"]),
                    "approval_status": updates["approval_status"],
                },
                started_at=t0,
                from_state=prev,
                to_state=updates["workflow_status"],
                message=(
                    f"Selected {len(updates['selected_files'])} high-priority files using F=0.35Q+0.25T+0.20C+0.10P+0.10A "
                    f"(excluded {len(updates['excluded_files'])} bulky/low-relevance archives)."
                ),
                full_state=merged,
            )
            return updates

        async def node_06(state: ResearchWorkflowState) -> dict[str, Any]:
            t0 = datetime.now(timezone.utc)
            prev = state.get("workflow_status", "ACQUIRING_FILES")
            updates = await self.nodes.agent_06_file_acquisition(state)
            merged = {**state, **updates}
            await self._log_agent_step(
                request_id=state["request_id"],
                thread_id=thread_id,
                agent_id="AGENT_06",
                agent_name="Scientific Acquisition Agent",
                step_index=5,
                tools_invoked=["PSIDownloadStrategy.acquire_file", "StorageVaultService.store_raw_asset"],
                input_summary={"selected_files": len(state.get("selected_files", []))},
                output_summary={
                    "acquisition_jobs": len(updates["acquisition_jobs"]),
                    "acquired_assets": len(updates["acquired_assets"]),
                },
                started_at=t0,
                from_state=prev,
                to_state=updates["workflow_status"],
                message=f"Verified and stored {len(updates['acquired_assets'])} scientific file assets in local vault.",
                full_state=merged,
            )
            return updates

        async def node_07(state: ResearchWorkflowState) -> dict[str, Any]:
            t0 = datetime.now(timezone.utc)
            prev = state.get("workflow_status", "EXTRACTING_DATA")
            updates = await self.nodes.agent_07_scientific_extraction(state)
            merged = {**state, **updates}
            await self._log_agent_step(
                request_id=state["request_id"],
                thread_id=thread_id,
                agent_id="AGENT_07",
                agent_name="Scientific Extraction Agent",
                step_index=6,
                tools_invoked=["DynamicDatasetEngine.extract_from_database_and_assets"],
                input_summary={"acquired_assets": len(state.get("acquired_assets", []))},
                output_summary={"extracted_records_count": len(updates["extracted_records"])},
                started_at=t0,
                from_state=prev,
                to_state=updates["workflow_status"],
                message=f"Extracted {len(updates['extracted_records'])} structured experimental measurement rows.",
                full_state=merged,
            )
            return updates

        async def node_08(state: ResearchWorkflowState) -> dict[str, Any]:
            t0 = datetime.now(timezone.utc)
            prev = state.get("workflow_status", "MAPPING_SCHEMA")
            updates = await self.nodes.agent_08_schema_mapping(state)
            merged = {**state, **updates}
            await self._log_agent_step(
                request_id=state["request_id"],
                thread_id=thread_id,
                agent_id="AGENT_08",
                agent_name="Scientific Schema Mapping Agent",
                step_index=7,
                tools_invoked=["DynamicDatasetEngine.map_to_canonical_schema", "UnitNormalizer.normalize"],
                input_summary={"raw_records": len(state.get("extracted_records", []))},
                output_summary={"mapped_records_count": len(updates["mapped_records"])},
                started_at=t0,
                from_state=prev,
                to_state=updates["workflow_status"],
                message=f"Mapped {len(updates['mapped_records'])} rows into canonical FlameSafe schema with unit normalization.",
                full_state=merged,
            )
            return updates

        async def node_09(state: ResearchWorkflowState) -> dict[str, Any]:
            t0 = datetime.now(timezone.utc)
            prev = state.get("workflow_status", "VALIDATING_DATA")
            updates = await self.nodes.agent_09_scientific_validation(state)
            merged = {**state, **updates}
            rep = updates.get("validation_report", {})
            await self._log_agent_step(
                request_id=state["request_id"],
                thread_id=thread_id,
                agent_id="AGENT_09",
                agent_name="Scientific Validation & Quality Agent",
                step_index=8,
                tools_invoked=["DynamicDatasetEngine.validate_canonical_records"],
                input_summary={"mapped_records": len(state.get("mapped_records", []))},
                output_summary={
                    "overall_status": rep.get("overall_status"),
                    "passed_count": rep.get("passed_count"),
                    "warning_count": rep.get("warning_count"),
                    "rejected_count": rep.get("rejected_count"),
                    "overall_quality_score": rep.get("overall_quality_score"),
                },
                started_at=t0,
                from_state=prev,
                to_state=updates["workflow_status"],
                message=(
                    f"Deterministic validation {rep.get('overall_status')}: "
                    f"quality={rep.get('overall_quality_score')}, passed={rep.get('passed_count')}."
                ),
                full_state=merged,
            )
            return updates

        async def node_10(state: ResearchWorkflowState) -> dict[str, Any]:
            t0 = datetime.now(timezone.utc)
            prev = state.get("workflow_status", "BUILDING_DATASET")
            updates = await self.nodes.agent_10_dataset_builder(state)
            merged = {**state, **updates}
            ds_sum = updates.get("dataset_summary", {})
            await self._log_agent_step(
                request_id=state["request_id"],
                thread_id=thread_id,
                agent_id="AGENT_10",
                agent_name="Dynamic Dataset Builder Agent",
                step_index=9,
                tools_invoked=["DynamicDatasetEngine.build_or_reuse_dataset", "StorageVaultService.store_dataset_exports"],
                input_summary={"validated_records": len(updates.get("validated_records", []))},
                output_summary={
                    "dataset_code": updates.get("dataset_code"),
                    "version_tag": updates.get("dataset_version_number"),
                    "reused_existing": ds_sum.get("reused_existing"),
                    "record_count": ds_sum.get("record_count"),
                },
                started_at=t0,
                from_state=prev,
                to_state=updates["workflow_status"],
                message=(
                    f"Dataset {updates.get('dataset_code')} ({updates.get('dataset_version_number')}) "
                    f"{'reused' if ds_sum.get('reused_existing') else 'constructed'} with {ds_sum.get('record_count')} records."
                ),
                full_state=merged,
            )
            return updates

        async def node_11(state: ResearchWorkflowState) -> dict[str, Any]:
            t0 = datetime.now(timezone.utc)
            prev = state.get("workflow_status", "GENERATING_INSIGHTS")
            updates = await self.nodes.agent_11_research_intelligence(state)
            merged = {**state, **updates}
            await self._log_agent_step(
                request_id=state["request_id"],
                thread_id=thread_id,
                agent_id="AGENT_11",
                agent_name="Scientific Research Intelligence Agent",
                step_index=10,
                tools_invoked=["AIService.answer_query", "EvidenceRetriever.retrieve", "CitationValidator.build_citations"],
                input_summary={"dataset_code": state.get("dataset_code")},
                output_summary={
                    "citations_count": len(updates.get("evidence_citations", [])),
                    "has_sufficient_evidence": updates.get("final_response", {}).get("has_sufficient_evidence"),
                },
                started_at=t0,
                from_state=prev,
                to_state=updates["workflow_status"],
                message=f"Generated evidence-grounded synthesis with {len(updates.get('evidence_citations', []))} verified citations.",
                full_state=merged,
            )
            return updates

        if not start_from_acquisition:
            graph.add_node("agent_02", node_02)
            graph.add_node("agent_03", node_03)
            graph.add_node("agent_04", node_04)
            graph.add_node("agent_05", node_05)
        graph.add_node("agent_06", node_06)
        graph.add_node("agent_07", node_07)
        graph.add_node("agent_08", node_08)
        graph.add_node("agent_09", node_09)
        graph.add_node("agent_10", node_10)
        graph.add_node("agent_11", node_11)

        if not start_from_acquisition:
            graph.add_edge(START, "agent_02")
            graph.add_edge("agent_02", "agent_03")

            def route_after_coverage(state: ResearchWorkflowState) -> str:
                if state.get("coverage_status") == "FULLY_AVAILABLE" and not state.get("force_psi_discovery"):
                    return "agent_10"
                return "agent_04"

            graph.add_conditional_edges(
                "agent_03",
                route_after_coverage,
                {"agent_04": "agent_04", "agent_10": "agent_10"},
            )
            graph.add_edge("agent_04", "agent_05")

            def route_after_selection(state: ResearchWorkflowState) -> str:
                if state.get("workflow_status") == "AWAITING_APPROVAL":
                    return "pause_for_approval"
                return "agent_06"

            graph.add_conditional_edges(
                "agent_05",
                route_after_selection,
                {"pause_for_approval": END, "agent_06": "agent_06"},
            )
        else:
            graph.add_edge(START, "agent_06")

        graph.add_edge("agent_06", "agent_07")
        graph.add_edge("agent_07", "agent_08")
        graph.add_edge("agent_08", "agent_09")
        graph.add_edge("agent_09", "agent_10")
        graph.add_edge("agent_10", "agent_11")
        graph.add_edge("agent_11", END)

        return graph.compile()

    async def execute_request(
        self,
        query: str,
        require_approval: bool = False,
        force_psi_discovery: bool = False,
        existing_request: ResearchRequest | None = None,
        revised_intent: dict[str, Any] | None = None,
    ) -> ResearchRequest:
        """Creates or updates a ResearchRequest and executes the LangGraph multi-agent workflow."""
        if existing_request is None:
            req_row = ResearchRequest(
                user_question=query,
                status="PARSING_INTENT",
                require_approval=require_approval,
                approval_status="PENDING" if require_approval else "NOT_REQUIRED",
            )
            self.db.add(req_row)
            await self.db.commit()
            await self.db.refresh(req_row)
        else:
            req_row = existing_request
            req_row.status = "PARSING_INTENT"
            req_row.require_approval = require_approval
            req_row.approval_status = "PENDING" if require_approval else "NOT_REQUIRED"
            await self.db.commit()

        init_event = WorkflowEvent(
            request_id=req_row.id,
            thread_id=req_row.thread_id,
            agent_id="AGENT_01",
            event_type="WORKFLOW_STARTED",
            from_state="RECEIVED",
            to_state="PARSING_INTENT",
            message="Chief Intelligence Orchestrator initialized multi-agent research workflow.",
            payload={"question": req_row.user_question, "require_approval": req_row.require_approval},
        )
        self.db.add(init_event)
        await self.db.commit()

        initial_state: ResearchWorkflowState = {
            "request_id": req_row.id,
            "user_query": req_row.user_question,
            "research_intent": revised_intent or {},
            "require_approval": req_row.require_approval,
            "force_psi_discovery": force_psi_discovery,
            "approval_status": req_row.approval_status,
            "workflow_status": "PARSING_INTENT",
            "errors": [],
            "warnings": [],
        }

        compiled = self.build_graph(thread_id=req_row.thread_id, start_from_acquisition=False)
        final_state = await compiled.ainvoke(initial_state)

        req_row.status = final_state.get("workflow_status", "READY")
        req_row.research_intent = final_state.get("research_intent")
        cov = final_state.get("existing_investigations")
        if isinstance(cov, dict):
            req_row.existing_data_coverage = cov
        req_row.discovered_investigations = final_state.get("psi_candidates")
        req_row.candidate_files = (
            (final_state.get("selected_files") or []) + (final_state.get("excluded_files") or [])
        )
        req_row.selected_files = final_state.get("selected_files")
        req_row.approval_status = final_state.get("approval_status", req_row.approval_status)
        req_row.acquisition_summary = {
            "jobs": final_state.get("acquisition_jobs", []),
            "assets": final_state.get("acquired_assets", []),
        }
        req_row.validation_summary = final_state.get("validation_report")
        req_row.dataset_id = final_state.get("dataset_id")
        req_row.dataset_version_id = final_state.get("dataset_version_id")
        req_row.indexing_status = "INDEXED" if req_row.status == "READY" else "PENDING"

        final_resp = final_state.get("final_response") or {}
        req_row.final_answer = final_resp.get("answer")
        req_row.final_report = final_resp

        if req_row.status == "AWAITING_APPROVAL":
            total_bytes = sum(int(f.get("file_size_bytes") or 0) for f in (req_row.selected_files or []))
            approval_row = DatasetApproval(
                request_id=req_row.id,
                action_type="FILE_ACQUISITION_PLAN",
                selected_files=req_row.selected_files or [],
                estimated_size_bytes=total_bytes,
                decision="PENDING",
            )
            self.db.add(approval_row)

        await self.db.commit()
        await self.db.refresh(req_row)
        return req_row

    async def approve_and_resume(
        self,
        request_id: str,
        decision: str,
        approved_file_ids: list[str] | None = None,
        decided_by: str = "Lead Researcher",
        reason: str | None = None,
    ) -> ResearchRequest:
        """Handles Human-in-the-Loop approval/rejection/modification and resumes LangGraph from Agent 06."""
        res = await self.db.execute(select(ResearchRequest).where(ResearchRequest.id == request_id))
        req_row = res.scalars().first()
        if not req_row:
            raise ValueError(f"ResearchRequest {request_id} not found.")

        app_res = await self.db.execute(
            select(DatasetApproval).where(DatasetApproval.request_id == request_id)
        )
        approval_row = app_res.scalars().first()

        decision_upper = decision.upper()
        if decision_upper == "REJECT":
            req_row.approval_status = "REJECTED"
            req_row.status = "CANCELLED"
            if approval_row:
                approval_row.decision = "REJECTED"
                approval_row.decided_by = decided_by
                approval_row.reason = reason
                approval_row.decided_at = datetime.now(timezone.utc)
            event_row = WorkflowEvent(
                request_id=req_row.id,
                thread_id=req_row.thread_id,
                agent_id="AGENT_01",
                event_type="HUMAN_APPROVAL_DECISION",
                from_state="AWAITING_APPROVAL",
                to_state="CANCELLED",
                message=f"Researcher rejected proposed file acquisition. Reason: {reason or 'None'}",
                payload={"decision": "REJECT", "decided_by": decided_by},
            )
            self.db.add(event_row)
            await self.db.commit()
            await self.db.refresh(req_row)
            return req_row

        current_selected = list(req_row.selected_files or [])
        if approved_file_ids:
            allowed_set = set(approved_file_ids)
            all_cands = list(req_row.candidate_files or current_selected)
            filtered = [f for f in all_cands if f.get("file_identifier") in allowed_set]
            if filtered:
                current_selected = filtered

        req_row.selected_files = current_selected
        req_row.approval_status = "APPROVED"
        req_row.status = "ACQUIRING_FILES"
        if approval_row:
            approval_row.decision = "APPROVED"
            approval_row.selected_files = current_selected
            approval_row.decided_by = decided_by
            approval_row.reason = reason
            approval_row.decided_at = datetime.now(timezone.utc)

        event_row = WorkflowEvent(
            request_id=req_row.id,
            thread_id=req_row.thread_id,
            agent_id="AGENT_01",
            event_type="HUMAN_APPROVAL_DECISION",
            from_state="AWAITING_APPROVAL",
            to_state="ACQUIRING_FILES",
            message=f"Researcher ({decided_by}) approved {len(current_selected)} files. Resuming workflow at Agent 06.",
            payload={"decision": decision_upper, "approved_count": len(current_selected)},
        )
        self.db.add(event_row)
        await self.db.commit()

        resume_state: ResearchWorkflowState = {
            "request_id": req_row.id,
            "user_query": req_row.user_question,
            "research_intent": req_row.research_intent or {},
            "coverage_status": (req_row.existing_data_coverage or {}).get("classification", "PARTIALLY_AVAILABLE"),
            "psi_candidates": req_row.discovered_investigations or [],
            "selected_files": current_selected,
            "require_approval": req_row.require_approval,
            "approval_status": "APPROVED",
            "approval_notes": reason,
            "workflow_status": "ACQUIRING_FILES",
            "errors": [],
            "warnings": [],
        }

        compiled = self.build_graph(thread_id=req_row.thread_id, start_from_acquisition=True)
        final_state = await compiled.ainvoke(resume_state)

        req_row.status = final_state.get("workflow_status", "READY")
        req_row.acquisition_summary = {
            "jobs": final_state.get("acquisition_jobs", []),
            "assets": final_state.get("acquired_assets", []),
        }
        req_row.validation_summary = final_state.get("validation_report")
        req_row.dataset_id = final_state.get("dataset_id")
        req_row.dataset_version_id = final_state.get("dataset_version_id")
        req_row.indexing_status = "INDEXED" if req_row.status == "READY" else "PENDING"
        final_resp = final_state.get("final_response") or {}
        req_row.final_answer = final_resp.get("answer")
        req_row.final_report = final_resp

        await self.db.commit()
        await self.db.refresh(req_row)
        return req_row
