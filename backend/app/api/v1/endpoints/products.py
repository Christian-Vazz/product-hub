"""
Product endpoints — CRUD operations for products.
GET endpoints are public (for the shop). CUD operations require admin.
"""

from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.auth import require_admin
from app.core.database import get_db
from app.models.user import User
from app.schemas.product import (
    ProductCreate,
    ProductListResponse,
    ProductResponse,
    ProductUpdate,
)
from app.services.product_service import ProductService

router = APIRouter(prefix="/products", tags=["Products"])


def _get_service(db: Session = Depends(get_db)) -> ProductService:
    return ProductService(db)


# ─── POST /api/v1/products (Admin only) ─────────────────────────

@router.post(
    "",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new product (admin only)",
    description="Register a new product in the inventory system. SKU must be unique.",
)
def create_product(
    data: ProductCreate,
    admin: User = Depends(require_admin),
    service: ProductService = Depends(_get_service),
) -> ProductResponse:
    return service.create_product(data)


# ─── GET /api/v1/products (Public — used by shop) ───────────────

@router.get(
    "",
    response_model=ProductListResponse,
    summary="List products",
    description="Retrieve a paginated list of products with optional search and filtering.",
)
def list_products(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by name or SKU"),
    category: Optional[str] = Query(None, description="Filter by category"),
    sort_by: str = Query("created_at", description="Sort field"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$", description="Sort order"),
    service: ProductService = Depends(_get_service),
) -> ProductListResponse:
    return service.list_products(
        page=page,
        size=size,
        search=search,
        category=category,
        sort_by=sort_by,
        sort_order=sort_order,
    )


# ─── GET /api/v1/products/{id} (Public) ─────────────────────────

@router.get(
    "/{product_id}",
    response_model=ProductResponse,
    summary="Get product details",
    description="Retrieve a single product by its ID.",
)
def get_product(
    product_id: int,
    service: ProductService = Depends(_get_service),
) -> ProductResponse:
    return service.get_product(product_id)


# ─── PUT /api/v1/products/{id} (Admin only) ─────────────────────

@router.put(
    "/{product_id}",
    response_model=ProductResponse,
    summary="Update a product (admin only)",
    description="Update one or more fields of an existing product.",
)
def update_product(
    product_id: int,
    data: ProductUpdate,
    admin: User = Depends(require_admin),
    service: ProductService = Depends(_get_service),
) -> ProductResponse:
    return service.update_product(product_id, data)


# ─── DELETE /api/v1/products/{id} (Admin only) ──────────────────

@router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a product (admin only)",
    description="Remove a product from the inventory. All related movements will also be deleted.",
)
def delete_product(
    product_id: int,
    admin: User = Depends(require_admin),
    service: ProductService = Depends(_get_service),
) -> None:
    service.delete_product(product_id)
