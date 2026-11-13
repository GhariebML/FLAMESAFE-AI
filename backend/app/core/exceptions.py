from typing import Any, Dict, Optional
from fastapi import HTTPException, status


class FlameSafeException(HTTPException):
    def __init__(
        self,
        status_code: int,
        detail: str,
        error_code: str = "FLAMESAFE_ERROR",
        extra: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(status_code=status_code, detail=detail)
        self.error_code = error_code
        self.extra = extra or {}


class InvestigationNotFoundError(FlameSafeException):
    def __init__(self, investigation_id: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Investigation with identifier '{investigation_id}' not found.",
            error_code="INVESTIGATION_NOT_FOUND",
            extra={"investigation_id": investigation_id},
        )


class SourceNotFoundError(FlameSafeException):
    def __init__(self, source_id: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Source record with identifier '{source_id}' not found.",
            error_code="SOURCE_NOT_FOUND",
            extra={"source_id": source_id},
        )


class InsufficientEvidenceError(FlameSafeException):
    def __init__(self, query: str):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Insufficient verified NASA evidence found to answer research query: '{query}'.",
            error_code="INSUFFICIENT_SCIENTIFIC_EVIDENCE",
            extra={"query": query},
        )


class InvalidComparisonError(FlameSafeException):
    def __init__(self, message: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message,
            error_code="INVALID_COMPARISON_PARAMETERS",
        )
