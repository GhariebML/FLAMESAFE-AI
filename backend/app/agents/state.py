"""Typed state contract for the 11-Agent Scientific Data Intelligence Workflow."""

from typing import Any, TypedDict


class ResearchWorkflowState(TypedDict, total=False):
    request_id: str
    user_query: str
    research_intent: dict[str, Any]
    coverage_status: str
    existing_investigations: list[dict[str, Any]]
    existing_datasets: list[dict[str, Any]]
    psi_candidates: list[dict[str, Any]]
    selected_files: list[dict[str, Any]]
    excluded_files: list[dict[str, Any]]
    require_approval: bool
    force_psi_discovery: bool
    approval_status: str
    approval_notes: str | None
    acquisition_jobs: list[dict[str, Any]]
    acquired_assets: list[dict[str, Any]]
    extracted_records: list[dict[str, Any]]
    mapped_records: list[dict[str, Any]]
    validated_records: list[dict[str, Any]]
    validation_report: dict[str, Any]
    dataset_id: str | None
    dataset_code: str | None
    dataset_version_id: str | None
    dataset_version_number: str | None
    dataset_summary: dict[str, Any]
    evidence_citations: list[dict[str, Any]]
    final_response: dict[str, Any]
    workflow_status: str
    agent_runs_log: list[dict[str, Any]]
    errors: list[str]
    warnings: list[str]
