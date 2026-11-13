from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ComparisonRequest(BaseModel):
    investigation_ids: List[str] = Field(
        ..., min_length=2, max_length=5, description="List of 2 to 5 investigation IDs to compare"
    )
    target_parameters: Optional[List[str]] = Field(
        default=None,
        description="Optional list of specific parameters to highlight in comparison"
    )


class ParameterComparisonItem(BaseModel):
    parameter_name: str
    display_name: str
    unit: Optional[str] = None
    values_by_investigation: Dict[str, Any]
    is_compatible_for_direct_diff: bool = True
    notes: Optional[str] = None


class InvestigationComparisonProfile(BaseModel):
    id: str
    psi_id: str
    acronym: str
    title: str
    research_area: str
    gravity_regime: str
    primary_fuel_types: List[str]
    typical_oxygen_range: Optional[str] = None
    typical_pressure_range: Optional[str] = None
    typical_airflow_range: Optional[str] = None
    measurement_capabilities: List[str]
    identified_limitations: List[str]


class ComparisonResponse(BaseModel):
    investigations: List[InvestigationComparisonProfile]
    parameter_matrix: List[ParameterComparisonItem]
    scientific_summary: str
    comparison_limitations: List[str]
