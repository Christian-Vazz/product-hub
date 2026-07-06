"""
Pydantic schemas for Dashboard endpoints.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class DashboardSummary(BaseModel):
    """Aggregated dashboard summary data."""

    total_products: int
    total_items_in_stock: int
    total_low_stock_products: int
    total_entries: int
    total_exits: int
    total_adjustments: int
    total_stock_value: float


class MovementSummary(BaseModel):
    """Movement data for a specific period."""

    date: str
    entries: int
    exits: int
    adjustments: int


class DashboardMovementsResponse(BaseModel):
    """Response for dashboard movements over time."""

    movements: list[MovementSummary]
    period_start: Optional[str] = None
    period_end: Optional[str] = None


class LowStockProduct(BaseModel):
    """Product with stock below minimum threshold."""

    id: int
    name: str
    sku: str
    category: str
    quantity: int
    minimum_stock: int
    deficit: int


class LowStockResponse(BaseModel):
    """Response for low stock products."""

    items: list[LowStockProduct]
    total: int
