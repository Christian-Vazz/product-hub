"""
Custom exception classes and global exception handlers.
Provides structured error responses for the API.
"""

from typing import Any, Dict, Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError
import structlog

logger = structlog.get_logger(__name__)


# ─── Custom Exceptions ──────────────────────────────────────────

class AppException(Exception):
    """Base application exception."""

    def __init__(
        self,
        status_code: int = 500,
        detail: str = "An unexpected error occurred",
        error_code: Optional[str] = None,
        extra: Optional[Dict[str, Any]] = None,
    ) -> None:
        self.status_code = status_code
        self.detail = detail
        self.error_code = error_code or "INTERNAL_ERROR"
        self.extra = extra or {}
        super().__init__(detail)


class NotFoundException(AppException):
    """Raised when a requested resource is not found."""

    def __init__(self, resource: str, resource_id: Any) -> None:
        super().__init__(
            status_code=404,
            detail=f"{resource} with id '{resource_id}' was not found",
            error_code="NOT_FOUND",
            extra={"resource": resource, "resource_id": str(resource_id)},
        )


class ConflictException(AppException):
    """Raised when a conflict occurs (e.g. duplicate SKU)."""

    def __init__(self, detail: str) -> None:
        super().__init__(
            status_code=409,
            detail=detail,
            error_code="CONFLICT",
        )


class BusinessRuleException(AppException):
    """Raised when a business rule is violated."""

    def __init__(self, detail: str) -> None:
        super().__init__(
            status_code=422,
            detail=detail,
            error_code="BUSINESS_RULE_VIOLATION",
        )


class InsufficientStockException(BusinessRuleException):
    """Raised when there is not enough stock for an exit movement."""

    def __init__(self, product_name: str, available: int, requested: int) -> None:
        super().__init__(
            detail=(
                f"Insufficient stock for '{product_name}'. "
                f"Available: {available}, Requested: {requested}"
            ),
        )
        self.error_code = "INSUFFICIENT_STOCK"


# ─── Error Response Schema ──────────────────────────────────────

def _build_error_response(
    status_code: int,
    error_code: str,
    detail: str,
    extra: Optional[Dict[str, Any]] = None,
) -> JSONResponse:
    content: Dict[str, Any] = {
        "success": False,
        "error": {
            "code": error_code,
            "message": detail,
        },
    }
    if extra:
        content["error"]["details"] = extra
    return JSONResponse(status_code=status_code, content=content)


# ─── Exception Handlers ─────────────────────────────────────────

def register_exception_handlers(app: FastAPI) -> None:
    """Register global exception handlers on the FastAPI app."""

    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
        logger.warning(
            "Application error",
            error_code=exc.error_code,
            detail=exc.detail,
            path=str(request.url),
        )
        return _build_error_response(
            status_code=exc.status_code,
            error_code=exc.error_code,
            detail=exc.detail,
            extra=exc.extra,
        )

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
        return _build_error_response(
            status_code=exc.status_code,
            error_code="HTTP_ERROR",
            detail=str(exc.detail),
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        errors = []
        for error in exc.errors():
            errors.append({
                "field": " -> ".join(str(loc) for loc in error["loc"]),
                "message": error["msg"],
                "type": error["type"],
            })
        return _build_error_response(
            status_code=422,
            error_code="VALIDATION_ERROR",
            detail="Request validation failed",
            extra={"errors": errors},
        )

    @app.exception_handler(IntegrityError)
    async def integrity_exception_handler(
        request: Request, exc: IntegrityError
    ) -> JSONResponse:
        logger.error("Database integrity error", error=str(exc.orig))
        return _build_error_response(
            status_code=409,
            error_code="INTEGRITY_ERROR",
            detail="A database constraint was violated. Check for duplicate values.",
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(
        request: Request, exc: Exception
    ) -> JSONResponse:
        logger.critical(
            "Unhandled exception",
            error=str(exc),
            path=str(request.url),
            exc_info=True,
        )
        return _build_error_response(
            status_code=500,
            error_code="INTERNAL_ERROR",
            detail="An unexpected internal error occurred",
        )
