"""
Product Service — business logic for product operations.
"""

import math
from typing import Optional

import structlog
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictException, NotFoundException
from app.models.product import Product
from app.repositories.product_repository import ProductRepository
from app.schemas.product import (
    ProductCreate,
    ProductListResponse,
    ProductResponse,
    ProductUpdate,
)

logger = structlog.get_logger(__name__)


class ProductService:
    """Service layer for product business logic."""

    def __init__(self, db: Session) -> None:
        self._repository = ProductRepository(db)

    def create_product(self, data: ProductCreate) -> ProductResponse:
        """Create a new product, ensuring SKU uniqueness."""
        existing = self._repository.get_by_sku(data.sku)
        if existing:
            raise ConflictException(f"A product with SKU '{data.sku}' already exists")

        product = Product(
            name=data.name,
            description=data.description,
            category=data.category,
            sku=data.sku,
            quantity=data.quantity,
            minimum_stock=data.minimum_stock,
            price=data.price,
            image_url=data.image_url,
        )

        created = self._repository.create(product)
        logger.info("Product created", product_id=created.id, sku=created.sku)
        return self._to_response(created)

    def get_product(self, product_id: int) -> ProductResponse:
        """Retrieve a single product by ID."""
        product = self._repository.get_by_id(product_id)
        if not product:
            raise NotFoundException("Product", product_id)
        return self._to_response(product)

    def list_products(
        self,
        *,
        page: int = 1,
        size: int = 20,
        search: Optional[str] = None,
        category: Optional[str] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
    ) -> ProductListResponse:
        """List products with pagination, search, and filters."""
        items, total = self._repository.get_all(
            page=page,
            size=size,
            search=search,
            category=category,
            sort_by=sort_by,
            sort_order=sort_order,
        )
        total_pages = math.ceil(total / size) if total > 0 else 1

        return ProductListResponse(
            items=[self._to_response(p) for p in items],
            total=total,
            page=page,
            size=size,
            pages=total_pages,
        )

    def update_product(self, product_id: int, data: ProductUpdate) -> ProductResponse:
        """Update product fields (partial update)."""
        product = self._repository.get_by_id(product_id)
        if not product:
            raise NotFoundException("Product", product_id)

        update_data = data.model_dump(exclude_unset=True)

        # Check SKU uniqueness if being updated
        if "sku" in update_data and update_data["sku"] != product.sku:
            existing = self._repository.get_by_sku(update_data["sku"])
            if existing:
                raise ConflictException(
                    f"A product with SKU '{update_data['sku']}' already exists"
                )

        # Apply updates
        for field, value in update_data.items():
            setattr(product, field, value)

        updated = self._repository.update(product)
        logger.info("Product updated", product_id=updated.id)
        return self._to_response(updated)

    def delete_product(self, product_id: int) -> None:
        """Delete a product by ID."""
        product = self._repository.get_by_id(product_id)
        if not product:
            raise NotFoundException("Product", product_id)

        self._repository.delete(product)
        logger.info("Product deleted", product_id=product_id)

    @staticmethod
    def _to_response(product: Product) -> ProductResponse:
        """Convert a Product ORM model to a response schema."""
        return ProductResponse(
            id=product.id,
            name=product.name,
            description=product.description,
            category=product.category,
            sku=product.sku,
            quantity=product.quantity,
            minimum_stock=product.minimum_stock,
            price=product.price,
            image_url=product.image_url,
            is_low_stock=product.quantity <= product.minimum_stock,
            created_at=product.created_at,
            updated_at=product.updated_at,
        )
