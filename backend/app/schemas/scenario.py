from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ScenarioRequest(BaseModel):
    environment: str = Field(
        ...,
        description="Target environment: Spacecraft, Space Station, Lunar Habitat, Lunar Rover, Mars Habitat, Mars Rover"
    )
    fuel_type: Optional[str] = Field(default=None, description="Material/fuel category of concern")
    oxygen_concentration: Optional[float] = Field(
        default=None, ge=0.0, le=100.0, description="Ambient oxygen volume percentage"
    )
    pressure_value: Optional[float] = Field(default=None, description="Atmospheric pressure value")
    pressure_unit: Optional[str] = Field(default="kPa", description="Pressure unit (kPa, psi, atm)")
    airflow_velocity: Optional[float] = Field(default=None, description="Forced or natural ventilation velocity")
    airflow_unit: Optional[str] = Field(default="cm/s", description="Velocity unit (cm/s, m/s)")
    fire_safety_focus: Optional[str] = Field(
        default=None,
        description="Specific focus: Flammability, Smoke Detection, Suppression, Extinction Limits"
    )


class EvidenceSnippet(BaseModel):
    investigation_acronym: str
    document_title: str
    doi: Optional[str] = None
    page_number: Optional[int] = None
    excerpt: str
    relevance_rationale: str


class ConditionMatchReport(BaseModel):
    parameter: str
    scenario_input: str
    experimental_data_status: str  # Direct Match, Analogous Range, Extrapolated, No Data
    notes: Optional[str] = None


class ScenarioAnalysisResponse(BaseModel):
    scenario_summary: str
    target_environment: str
    gravity_context: str
    relevant_investigations: List[str]
    condition_matches: List[ConditionMatchReport]
    supporting_evidence: List[EvidenceSnippet]
    research_gaps: List[str]
    scientific_limitations: List[str]
    safety_advisory: str = (
        "Microgravity (0g) combustion test data cannot be directly equated to Lunar (0.166g) or Martian (0.38g) "
        "partial-gravity surface conditions without accounting for residual buoyancy dynamics and ambient planetary atmospheric effects."
    )
