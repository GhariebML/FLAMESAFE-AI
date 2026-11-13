from pydantic import BaseModel, Field


class RankingWeights(BaseModel):
    domain_relevance: float = Field(default=0.30, ge=0.0, le=1.0)
    fuel_compatibility: float = Field(default=0.25, ge=0.0, le=1.0)
    condition_compatibility: float = Field(default=0.20, ge=0.0, le=1.0)
    mission_applicability: float = Field(default=0.15, ge=0.0, le=1.0)
    metadata_quality: float = Field(default=0.10, ge=0.0, le=1.0)

    def normalized(self) -> "RankingWeights":
        """Normalizes weights so their sum equals 1.0."""
        total = (
            self.domain_relevance
            + self.fuel_compatibility
            + self.condition_compatibility
            + self.mission_applicability
            + self.metadata_quality
        )
        if total <= 0:
            return RankingWeights()
        return RankingWeights(
            domain_relevance=round(self.domain_relevance / total, 4),
            fuel_compatibility=round(self.fuel_compatibility / total, 4),
            condition_compatibility=round(self.condition_compatibility / total, 4),
            mission_applicability=round(self.mission_applicability / total, 4),
            metadata_quality=round(self.metadata_quality / total, 4),
        )


class RankingRequest(BaseModel):
    query: str = Field(..., min_length=3, description="User scientific research question or focus topic")
    target_environment: str | None = Field(
        default=None,
        description="Target space environment (e.g. Spacecraft, Lunar Habitat, Mars Habitat)",
    )
    fuel_category: str | None = Field(
        default=None,
        description="Fuel category of interest (e.g. Solid Polymer, Fabric, Hydrocarbon)",
    )
    weights: RankingWeights | None = None


class FactorBreakdown(BaseModel):
    domain_score: float = Field(..., ge=0, le=100)
    fuel_score: float = Field(..., ge=0, le=100)
    condition_score: float = Field(..., ge=0, le=100)
    mission_score: float = Field(..., ge=0, le=100)
    quality_score: float = Field(..., ge=0, le=100)
    # Optional weighted point contribution breakdown: contribution_i = w_i * score_i
    domain_weighted: float | None = None
    fuel_weighted: float | None = None
    condition_weighted: float | None = None
    mission_weighted: float | None = None
    quality_weighted: float | None = None


class RankedInvestigationItem(BaseModel):
    investigation_id: str
    psi_id: str
    acronym: str
    title: str
    research_area: str
    relevance_score: float = Field(..., ge=0, le=100)
    measurement_completeness: float = Field(default=100.0, ge=0, le=100)
    factor_breakdown: FactorBreakdown
    matched_factors: list[str]
    missing_factors: list[str]
    explanation: str
    supporting_evidence_count: int
    doi: str | None = None


class RankingResponse(BaseModel):
    query: str
    target_environment: str | None = None
    applied_weights: RankingWeights
    results: list[RankedInvestigationItem]
    detailed_summary: str | None = None
    scientific_disclaimer: str = (
        "Relevance scores represent research alignment to the queried topic based on documented "
        "experimental metadata. They DO NOT represent physical fire-risk probabilities, safe operation "
        "thresholds, or certified NASA safety clearances."
    )
