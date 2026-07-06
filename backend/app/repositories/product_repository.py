"""
Product Repository — data access layer for products.
Encapsulates all database queries related to the Product model.
"""

import math
from typing import Optional, Sequence

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.product import Product


class ProductRepository:
    """Repository for Product CRUD operations."""

    def __init__(self, db: Session) -> None:
        self._db = db

    def create(self, product: Product) -> Product:
        """Persist a new product."""
        self._db.add(product)
        self._db.commit()
        self._db.refresh(product)
        return product

    def get_by_id(self, product_id: int) -> Optional[Product]:
        """Retrieve a product by its primary key."""
        return self._db.get(Product, product_id)

    def get_by_sku(self, sku: str) -> Optional[Product]:
        """Retrieve a product by SKU."""
        stmt = select(Product).where(Product.sku == sku)
        return self._db.execute(stmt).scalar_one_or_none()

    def get_all(
        self,
        *,
        page: int = 1,
        size: int = 20,
        search: Optional[str] = None,
        category: Optional[str] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
    ) -> tuple[Sequence[Product], int]:
        """
        List products with pagination, filtering, and sorting.
        Returns (items, total_count).
        """
        stmt = select(Product)
        count_stmt = select(func.count()).select_from(Product)

        # Filters
        if search:
            search_filter = Product.name.ilike(f"%{search}%") | Product.sku.ilike(f"%{search}%")
            stmt = stmt.where(search_filter)
            count_stmt = count_stmt.where(search_filter)

        if category:
            stmt = stmt.where(Product.category == category)
            count_stmt = count_stmt.where(Product.category == category)

        # Sorting
        sort_column = getattr(Product, sort_by, Product.created_at)
        if sort_order.lower() == "asc":
            stmt = stmt.order_by(sort_column.asc())
        else:
            stmt = stmt.order_by(sort_column.desc())

        # Total count
        total = self._db.execute(count_stmt).scalar() or 0

        # Pagination
        offset = (page - 1) * size
        stmt = stmt.offset(offset).limit(size)

        items = self._db.execute(stmt).scalars().all()
        return items, total

    def update(self, product: Product) -> Product:
        """Merge changes to an existing product."""
        self._db.commit()
        self._db.refresh(product)
        return product

    def delete(self, product: Product) -> None:
        """Remove a product from the database."""
        self._db.delete(product)
        self._db.commit()

    def get_low_stock(self) -> Sequence[Product]:
        """Return products whose quantity is at or below minimum_stock."""
        stmt = (
            select(Product)
            .where(Product.quantity <= Product.minimum_stock)
            .order_by((Product.minimum_stock - Product.quantity).desc())
        )
        return self._db.execute(stmt).scalars().all()

    def count_all(self) -> int:
        """Total number of products."""
        stmt = select(func.count()).select_from(Product)
        return self._db.execute(stmt).scalar() or 0

    def total_items_in_stock(self) -> int:
        """Sum of all product quantities."""
        stmt = select(func.coalesce(func.sum(Product.quantity), 0))
        return self._db.execute(stmt).scalar() or 0

    def total_stock_value(self) -> float:
        """Sum of (quantity * price) for all products."""
        stmt = select(
            func.coalesce(func.sum(Product.quantity * Product.price), 0.0)
        )
        return float(self._db.execute(stmt).scalar() or 0.0)

    def count_low_stock(self) -> int:
        """Number of products with stock at or below minimum."""
        stmt = (
            select(func.count())
            .select_from(Product)
            .where(Product.quantity <= Product.minimum_stock)
        )
        return self._db.execute(stmt).scalar() or 0
