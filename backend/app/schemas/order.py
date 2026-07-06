"""
Pydantic schemas for Order endpoints.
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


# ─── Request Schemas ─────────────────────────────────────────────

class OrderCreateRequest(BaseModel):
    """Schema for creating an order."""
    total: float = Field(..., ge=0)
    status: str = Field("pending", examples=["pending", "confirmed"])


class OrderItemCreateRequest(BaseModel):
    """Schema for creating an order item."""
    product_id: int = Field(..., gt=0)
    product_name: str = Field(..., min_length=1)
    quantity: int = Field(..., gt=0)
    unit_price: float = Field(..., ge=0)


# ─── Response Schemas ────────────────────────────────────────────

class OrderItemResponse(BaseModel):
    """Schema for order item response."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    product_name: str
    quantity: int
    unit_price: float


class OrderResponse(BaseModel):
    """Schema for order response."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    total: float
    status: str
    created_at: datetime
    items: List[OrderItemResponse] = []
