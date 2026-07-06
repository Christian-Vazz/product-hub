"""
Stock Movement endpoints — create and query stock movements.
Creating movements requires authentication. Listing is available for authenticated users.
"""

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.stock_movement import (
    StockMovementCreate,
    StockMovementListResponse,
    StockMovementResponse,
)
from app.services.stock_service import StockService

router = APIRouter(prefix="/stock-movements", tags=["Stock Movements"])


def _get_service(db: Session = Depends(get_db)) -> StockService:
    return StockService(db)


# ─── POST /api/v1/stock-movements (Authenticated) ───────────────

@router.post(
    "",
    response_model=StockMovementResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a stock movement",
    description=(
        "Register a new stock movement (ENTRY, EXIT, or ADJUSTMENT). "
        "The product's quantity is updated automatically."
    ),
)
def create_movement(
    data: StockMovementCreate,
    current_user: User = Depends(get_current_user),
    service: StockService = Depends(_get_service),
) -> StockMovementResponse:
    return service.create_movement(data)


# ─── GET /api/v1/stock-movements (Authenticated) ────────────────

@router.get(
    "",
    response_model=StockMovementListResponse,
    summary="List stock movements",
    description="Retrieve a paginated list of stock movements with optional filters.",
)
def list_movements(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Items per page"),
    product_id: Optional[int] = Query(None, description="Filter by product ID"),
    movement_type: Optional[str] = Query(None, description="Filter by movement type"),
    date_from: Optional[date] = Query(None, description="Start date (inclusive)"),
    date_to: Optional[date] = Query(None, description="End date (inclusive)"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$", description="Sort order"),
    current_user: User = Depends(get_current_user),
    service: StockService = Depends(_get_service),
) -> StockMovementListResponse:
    return service.list_movements(
        page=page,
        size=size,
        product_id=product_id,
        movement_type=movement_type,
        date_from=date_from,
        date_to=date_to,
        sort_order=sort_order,
    )


# ─── GET /api/v1/stock-movements/{id} (Authenticated) ───────────

@router.get(
    "/{movement_id}",
    response_model=StockMovementResponse,
    summary="Get movement details",
    description="Retrieve a single stock movement by its ID.",
)
def get_movement(
    movement_id: int,
    current_user: User = Depends(get_current_user),
    service: StockService = Depends(_get_service),
) -> StockMovementResponse:
    return service.get_movement(movement_id)
