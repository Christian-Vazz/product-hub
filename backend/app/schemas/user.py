"""
Pydantic schemas for Auth and User endpoints.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ─── Auth Request Schemas ────────────────────────────────────────

class RegisterRequest(BaseModel):
    """Schema for user registration."""
    email: EmailStr = Field(..., examples=["user@example.com"])
    password: str = Field(..., min_length=6, max_length=128, examples=["mypassword123"])
    display_name: str = Field(..., min_length=1, max_length=255, examples=["João Silva"])


class LoginRequest(BaseModel):
    """Schema for user login."""
    email: EmailStr = Field(..., examples=["user@example.com"])
    password: str = Field(..., min_length=1, examples=["mypassword123"])


# ─── Auth Response Schemas ───────────────────────────────────────

class UserResponse(BaseModel):
    """Schema for user data in responses."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    display_name: str
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime


class UserPublic(BaseModel):
    """Minimal user info returned in auth responses."""
    id: str  # Frontend expects string IDs
    email: str
    display_name: Optional[str] = None
    role: str = "user"


class AuthResponse(BaseModel):
    """Schema for login/register response."""
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class ProfileResponse(BaseModel):
    """Schema for user profile."""
    display_name: str
    avatar_url: Optional[str] = None
    role: str = "user"


class RolesResponse(BaseModel):
    """Schema for user roles check."""
    is_admin: bool


# ─── Admin User Management ──────────────────────────────────────

class AdminUserUpdate(BaseModel):
    """Schema for admin updating a user."""
    display_name: Optional[str] = Field(None, max_length=255)
    role: Optional[str] = Field(None, pattern="^(admin|user)$")
    is_active: Optional[bool] = None
