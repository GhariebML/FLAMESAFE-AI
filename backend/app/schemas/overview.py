from typing import List, Dict
from pydantic import BaseModel


class MetricCard(BaseModel):
    label: str
    value: int
    change_description: str


class DomainDistributionItem(BaseModel):
    domain: str
    investigations_count: int
    runs_count: int


class FuelCategoryItem(BaseModel):
    fuel_category: str
    count: int


class RecentSourceItem(BaseModel):
    id: str
    source_name: str
    investigation_acronym: str
    doi: str
    accessed_at: str


class MissionOverviewResponse(BaseModel):
    total_investigations: int
    total_experimental_runs: int
    total_measurements: int
    total_documents: int
    research_domains: List[DomainDistributionItem]
    fuel_categories: List[FuelCategoryItem]
    investigation_groups: List[str]
    recent_sources: List[RecentSourceItem]
    coverage_summary: Dict[str, str]
