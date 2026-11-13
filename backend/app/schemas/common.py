from typing import Generic, List, Optional, TypeVar, Any, Dict
from pydantic import BaseModel, Field
from datetime import datetime, timezone

T = TypeVar("T")


def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)


class APIResponseEnvelope(BaseModel, Generic[T]):
    success: bool = True
    message: str = "Operation completed successfully"
    data: T
    timestamp: datetime = Field(default_factory=get_utc_now)


class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[Dict[str, Any]] = None


class APIErrorResponse(BaseModel):
    success: bool = False
    error: ErrorDetail
    timestamp: datetime = Field(default_factory=get_utc_now)


class PaginationParams(BaseModel):
    page: int = Field(default=1, ge=1, description="Page number")
    page_size: int = Field(default=10, ge=1, le=100, description="Items per page")


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int
