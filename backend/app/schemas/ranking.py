from typing import List, Optional
from pydantic import BaseModel, Field


class RankingWeights(BaseModel):
    domain_relevance: float = Field(default=0.30, ge=0.0, le=1.0)
    fuel_compatibility: float = Field(default=0.25, ge=0.0, le=1.0)
    condition_compatibility: float = Field(default=0.20, ge=0.0, le=1.0)
    mission_applicability: float = Field(default=0.15, ge=0.0, le=1.0)
    metadata_quality: float = Field(default=0.10, ge=0.0, le=1.0)


class RankingRequest(BaseModel):
    query: str = Field(..., min_length=3, description="User scientific research question or focus topic")
    target_environment: Optional[str] = Field(
        default=None,
        description="Target space environment (e.g. Spacecraft, Space Station, Lunar Habitat, Lunar Rover, Mars Habitat, Mars Rover)"
    )
    fuel_category: Optional[str] = Field(
        default=None,
        description="Fuel category of interest (e.g. Solid Polymer, Fabric, Hydrocarbon)"
    )
    weights: Optional[RankingWeights] = None


class FactorBreakdown(BaseModel):
    domain_score: float = Field(..., ge=0, le=100)
    fuel_score: float = Field(..., ge=0, le=100)
    condition_score: float = Field(..., ge=0, le=100)
    mission_score: float = Field(..., ge=0, le=100)
    quality_score: float = Field(..., ge=0, le=100)


class RankedInvestigationItem(BaseModel):
    investigation_id: str
    psi_id: str
    acronym: str
    title: str
    research_area: str
    relevance_score: float = Field(..., ge=0, le=100)
    measurement_completeness: float = Field(default=100.0, ge=0, le=100)
    factor_breakdown: FactorBreakdown
    matched_factors: List[str]
    missing_factors: List[str]
    explanation: str
    supporting_evidence_count: int
    doi: Optional[str] = None


class RankingResponse(BaseModel):
    query: str
    target_environment: Optional[str] = None
    applied_weights: RankingWeights
    results: List[RankedInvestigationItem]
    scientific_disclaimer: str = (
        "Relevance scores represent research alignment to the queried topic based on documented "
        "experimental metadata. They DO NOT represent physical fire-risk probabilities, safe operation "
        "thresholds, or certified NASA safety clearances."
    )
