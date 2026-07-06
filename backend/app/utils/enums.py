"""
Enumerations used throughout the application.
"""

from enum import Enum


class MovementType(str, Enum):
    """Types of stock movements."""
    ENTRY = "ENTRY"
    EXIT = "EXIT"
    ADJUSTMENT = "ADJUSTMENT"


class ProductCategory(str, Enum):
    """Product categories."""
    ELECTRONICS = "ELECTRONICS"
    CLOTHING = "CLOTHING"
    FOOD = "FOOD"
    BEVERAGES = "BEVERAGES"
    FURNITURE = "FURNITURE"
    TOOLS = "TOOLS"
    RAW_MATERIAL = "RAW_MATERIAL"
    PACKAGING = "PACKAGING"
    OFFICE_SUPPLIES = "OFFICE_SUPPLIES"
    CLEANING = "CLEANING"
    OTHER = "OTHER"
