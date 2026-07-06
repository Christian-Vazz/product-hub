"""
API v1 router — aggregates all endpoint routers under /api/v1.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import admin, auth, dashboard, orders, products, stock_movements, users

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(products.router)
api_router.include_router(stock_movements.router)
api_router.include_router(dashboard.router)
api_router.include_router(orders.router)
api_router.include_router(admin.router)
