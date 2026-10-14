from datetime import datetime
from typing import List, Optional
import re
from pydantic import BaseModel, ConfigDict, EmailStr, field_validator


def _not_whitespace(v: str) -> str:
    if not v or not v.strip():
        raise ValueError("Field must not be blank or whitespace-only")
    return v


# ── Contact ───────────────────────────────────────────────────────────────────
class ContactMessageCreate(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str
    model_config = ConfigDict(extra="forbid")

    @field_validator("name", "subject", "message")
    @classmethod
    def not_whitespace(cls, v: str) -> str:
        return _not_whitespace(v)

class ContactMessageResponse(BaseModel):
    id: int
    name: str
    email: str
    subject: str
    message: str
    created_at: datetime
    is_read: bool
    model_config = ConfigDict(from_attributes=True)

class MessageReadUpdate(BaseModel):
    is_read: bool
    model_config = ConfigDict(extra="forbid")


# ── Project ───────────────────────────────────────────────────────────────────
class ProjectCreate(BaseModel):
    title: str
    description: str
    tech_stack: List[str]
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    image_url: Optional[str] = None
    model_config = ConfigDict(extra="forbid")

    @field_validator("title", "description")
    @classmethod
    def not_whitespace(cls, v: str) -> str:
        return _not_whitespace(v)

    @field_validator("github_url", "live_url")
    @classmethod
    def valid_url(cls, v: Optional[str]) -> Optional[str]:
        if v and v.strip() and not re.match(r"^https?://", v.strip()):
            raise ValueError("Must be a valid http(s) URL")
        return v

class ProjectResponse(BaseModel):
    id: int
    title: str
    description: str
    tech_stack: List[str]
    github_url: Optional[str]
    live_url: Optional[str]
    image_url: Optional[str]
    back_images: Optional[List[str]] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ── Auth ──────────────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    model_config = ConfigDict(extra="forbid")

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        if not re.search(r"[A-Za-z]", v):
            raise ValueError("Password must contain at least one letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one number")
        return v

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
    model_config = ConfigDict(extra="forbid")

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        if not re.search(r"[A-Za-z]", v):
            raise ValueError("Password must contain at least one letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one number")
        return v


# ── CV Download Log ───────────────────────────────────────────────────────────
class CVDownloadLogResponse(BaseModel):
    id: int
    ip_address: str
    user_agent: str
    downloaded_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ── Site Settings ─────────────────────────────────────────────────────────────
class SiteSettingResponse(BaseModel):
    key: str
    value: Optional[str]
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class SiteSettingUpdate(BaseModel):
    value: Optional[str] = None
    model_config = ConfigDict(extra="forbid")

class SocialLinksUpdate(BaseModel):
    github: Optional[str] = None
    linkedin: Optional[str] = None
    facebook: Optional[str] = None
    x: Optional[str] = None
    instagram: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    model_config = ConfigDict(extra="forbid")

class SocialLinksResponse(BaseModel):
    github: Optional[str] = None
    linkedin: Optional[str] = None
    facebook: Optional[str] = None
    x: Optional[str] = None
    instagram: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    photo_url: Optional[str] = None
    cv_path: Optional[str] = None
    profile_back_images: Optional[List[str]] = None


# ── Notifications ─────────────────────────────────────────────────────────────
class NotificationResponse(BaseModel):
    id: int
    type: str
    title: str
    body: Optional[str]
    is_read: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class NotificationReadUpdate(BaseModel):
    is_read: bool
    model_config = ConfigDict(extra="forbid")


# ── Site Media ────────────────────────────────────────────────────────────────
class SiteMediaCreate(BaseModel):
    category: str
    title: str
    drive_url: Optional[str] = ""
    abstract: Optional[str] = None
    order_index: Optional[int] = 0
    model_config = ConfigDict(extra="forbid")

class SiteMediaResponse(BaseModel):
    id: int
    category: str
    title: str
    drive_url: str
    abstract: Optional[str] = None
    thumbnail: Optional[str] = None
    back_images: Optional[List[str]] = None
    order_index: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class SiteMediaUpdate(BaseModel):
    title: Optional[str] = None
    drive_url: Optional[str] = None
    abstract: Optional[str] = None
    order_index: Optional[int] = None
    model_config = ConfigDict(extra="forbid")
