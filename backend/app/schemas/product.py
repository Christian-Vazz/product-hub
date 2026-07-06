"""
Pydantic schemas (DTOs) for Product endpoints.
Handles input validation and output serialization.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


# ─── Request Schemas ─────────────────────────────────────────────

class ProductCreate(BaseModel):
    """Schema for creating a new product."""

    name: str = Field(..., min_length=1, max_length=255, examples=["Arduino Uno R3"])
    description: Optional[str] = Field(None, max_length=2000, examples=["Microcontroller board"])
    category: str = Field(..., min_length=1, max_length=50, examples=["Periféricos"])
    sku: str = Field(..., min_length=1, max_length=100, examples=["ARD-UNO-R3-001"])
    quantity: int = Field(0, ge=0, examples=[50])
    minimum_stock: int = Field(0, ge=0, examples=[10])
    price: float = Field(..., ge=0, examples=[45.90])
    image_url: Optional[str] = Field(None, examples=["https://example.com/image.png"])

    @field_validator("name", "sku")
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        return v.strip()

    @field_validator("sku")
    @classmethod
    def sku_uppercase(cls, v: str) -> str:
        return v.upper()


class ProductUpdate(BaseModel):
    """Schema for updating an existing product (partial update)."""

    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    category: Optional[str] = Field(None, max_length=50)
    sku: Optional[str] = Field(None, min_length=1, max_length=100)
    minimum_stock: Optional[int] = Field(None, ge=0)
    price: Optional[float] = Field(None, ge=0)
    image_url: Optional[str] = Field(None)

    @field_validator("name", "sku", mode="before")
    @classmethod
    def strip_whitespace(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            return v.strip()
        return v

    @field_validator("sku", mode="before")
    @classmethod
    def sku_uppercase(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            return v.upper()
        return v


# ─── Response Schemas ────────────────────────────────────────────

class ProductResponse(BaseModel):
    """Schema for product response."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: Optional[str]
    category: str
    sku: str
    quantity: int
    minimum_stock: int
    price: float
    image_url: Optional[str] = None
    is_low_stock: bool = False
    created_at: datetime
    updated_at: datetime

    @field_validator("is_low_stock", mode="before")
    @classmethod
    def compute_low_stock(cls, v: bool, info) -> bool:
        data = info.data
        if "quantity" in data and "minimum_stock" in data:
            return data["quantity"] <= data["minimum_stock"]
        return v


class ProductListResponse(BaseModel):
    """Paginated product list response."""

    items: list[ProductResponse]
    total: int
    page: int
    size: int
    pages: int
