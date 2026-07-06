"""
Dashboard Service — aggregated analytics for the inventory system.
"""

from typing import Optional

import structlog
from sqlalchemy.orm import Session

from app.repositories.product_repository import ProductRepository
from app.repositories.stock_movement_repository import StockMovementRepository
from app.schemas.dashboard import (
    DashboardMovementsResponse,
    DashboardSummary,
    LowStockProduct,
    LowStockResponse,
    MovementSummary,
)
from app.utils.enums import MovementType

logger = structlog.get_logger(__name__)


class DashboardService:
    """Service layer for dashboard analytics."""

    def __init__(self, db: Session) -> None:
        self._product_repo = ProductRepository(db)
        self._movement_repo = StockMovementRepository(db)

    def get_summary(self) -> DashboardSummary:
        """Build the aggregated dashboard summary."""
        return DashboardSummary(
            total_products=self._product_repo.count_all(),
            total_items_in_stock=self._product_repo.total_items_in_stock(),
            total_low_stock_products=self._product_repo.count_low_stock(),
            total_entries=self._movement_repo.count_by_type(MovementType.ENTRY),
            total_exits=self._movement_repo.count_by_type(MovementType.EXIT),
            total_adjustments=self._movement_repo.count_by_type(MovementType.ADJUSTMENT),
            total_stock_value=self._product_repo.total_stock_value(),
        )

    def get_movements_by_period(self, days: int = 30) -> DashboardMovementsResponse:
        """Get movement aggregation by date for the given period."""
        raw = self._movement_repo.get_movements_by_period(days=days)

        movements = [
            MovementSummary(
                date=item["date"],
                entries=item["entries"],
                exits=item["exits"],
                adjustments=item["adjustments"],
            )
            for item in raw
        ]

        period_start = movements[0].date if movements else None
        period_end = movements[-1].date if movements else None

        return DashboardMovementsResponse(
            movements=movements,
            period_start=period_start,
            period_end=period_end,
        )

    def get_low_stock_products(self) -> LowStockResponse:
        """Get all products with stock at or below minimum threshold."""
        products = self._product_repo.get_low_stock()

        items = [
            LowStockProduct(
                id=p.id,
                name=p.name,
                sku=p.sku,
                category=p.category,
                quantity=p.quantity,
                minimum_stock=p.minimum_stock,
                deficit=p.minimum_stock - p.quantity,
            )
            for p in products
        ]

        return LowStockResponse(items=items, total=len(items))
