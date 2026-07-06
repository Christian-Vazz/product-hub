"""
Dashboard endpoints — analytics and reporting (admin only).
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.auth import require_admin
from app.core.database import get_db
from app.models.user import User
from app.schemas.dashboard import (
    DashboardMovementsResponse,
    DashboardSummary,
    LowStockResponse,
)
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def _get_service(db: Session = Depends(get_db)) -> DashboardService:
    return DashboardService(db)


# ─── GET /api/v1/dashboard/summary (Admin only) ─────────────────

@router.get(
    "/summary",
    response_model=DashboardSummary,
    summary="Dashboard summary (admin only)",
    description=(
        "Returns aggregated metrics: total products, stock levels, "
        "low-stock count, movement totals, and total stock value."
    ),
)
def get_summary(
    admin: User = Depends(require_admin),
    service: DashboardService = Depends(_get_service),
) -> DashboardSummary:
    return service.get_summary()


# ─── GET /api/v1/dashboard/movements (Admin only) ───────────────

@router.get(
    "/movements",
    response_model=DashboardMovementsResponse,
    summary="Movement trends (admin only)",
    description="Returns daily movement aggregation for the specified period.",
)
def get_movements(
    days: int = Query(30, ge=1, le=365, description="Number of days to look back"),
    admin: User = Depends(require_admin),
    service: DashboardService = Depends(_get_service),
) -> DashboardMovementsResponse:
    return service.get_movements_by_period(days=days)


# ─── GET /api/v1/dashboard/low-stock (Admin only) ───────────────

@router.get(
    "/low-stock",
    response_model=LowStockResponse,
    summary="Low stock alerts (admin only)",
    description=(
        "Returns products with quantity at or below minimum stock level, "
        "sorted by deficit."
    ),
)
def get_low_stock(
    admin: User = Depends(require_admin),
    service: DashboardService = Depends(_get_service),
) -> LowStockResponse:
    return service.get_low_stock_products()
