"""
Pydantic schemas (DTOs) for StockMovement endpoints.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


# ─── Request Schemas ─────────────────────────────────────────────

class StockMovementCreate(BaseModel):
    """Schema for creating a new stock movement."""

    model_config = ConfigDict(extra="ignore")  # Ignore extra fields like product_name

    product_id: int = Field(..., gt=0, examples=[1])
    movement_type: str = Field(..., examples=["ENTRY"])
    quantity: int = Field(..., gt=0, examples=[25])
    user_responsible: str = Field(
        ..., min_length=1, max_length=255, examples=["admin@company.com"]
    )
    observation: Optional[str] = Field(
        None, max_length=1000, examples=["Received from supplier"]
    )

    @field_validator("user_responsible")
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        return v.strip()

    @field_validator("movement_type")
    @classmethod
    def normalize_movement_type(cls, v: str) -> str:
        """Normalize movement type values from frontend to backend format."""
        mapping = {
            "IN": "ENTRY",
            "OUT": "EXIT",
            "ADJUSTMENT": "ADJUSTMENT",
            "ENTRY": "ENTRY",
            "EXIT": "EXIT",
        }
        normalized = mapping.get(v.upper(), v.upper())
        return normalized


# ─── Response Schemas ────────────────────────────────────────────

class StockMovementResponse(BaseModel):
    """Schema for stock movement response."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    movement_type: str
    quantity: int
    user_responsible: str
    observation: Optional[str]
    created_at: datetime
    product_name: Optional[str] = None


class StockMovementListResponse(BaseModel):
    """Paginated stock movement list response."""

    items: list[StockMovementResponse]
    total: int
    page: int
    size: int
    pages: int
