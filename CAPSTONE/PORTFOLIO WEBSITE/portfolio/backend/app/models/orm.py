from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, Integer, JSON, String, Text
from app.database import Base


def _utcnow():
    return datetime.now(timezone.utc)


class Project(Base):
    __tablename__ = "projects"
    id          = Column(Integer, primary_key=True, autoincrement=True)
    title       = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    tech_stack  = Column(JSON, nullable=False)
    github_url  = Column(String(500), nullable=True)
    live_url    = Column(String(500), nullable=True)
    image_url   = Column(String(500), nullable=True)
    created_at  = Column(DateTime(timezone=True), nullable=False, default=_utcnow)


class ContactMessage(Base):
    __tablename__ = "contact_messages"
    id         = Column(Integer, primary_key=True, autoincrement=True)
    name       = Column(String(255), nullable=False)
    email      = Column(String(255), nullable=False)
    subject    = Column(String(500), nullable=False)
    message    = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)
    is_read    = Column(Boolean, nullable=False, default=False)


class AdminUser(Base):
    __tablename__ = "admin_users"
    id              = Column(Integer, primary_key=True, autoincrement=True)
    username        = Column(String(100), nullable=False, unique=True)
    email           = Column(String(255), nullable=False, unique=True)
    hashed_password = Column(String(255), nullable=False)


class CVDownloadLog(Base):
    __tablename__ = "cv_download_logs"
    id            = Column(Integer, primary_key=True, autoincrement=True)
    ip_address    = Column(String(45), nullable=False)
    user_agent    = Column(Text, nullable=False)
    downloaded_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)


class SiteSetting(Base):
    __tablename__ = "site_settings"
    id         = Column(Integer, primary_key=True, autoincrement=True)
    key        = Column(String(100), nullable=False, unique=True)
    value      = Column(Text, nullable=True)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)


class Notification(Base):
    __tablename__ = "notifications"
    id         = Column(Integer, primary_key=True, autoincrement=True)
    type       = Column(String(50), nullable=False)
    title      = Column(String(255), nullable=False)
    body       = Column(Text, nullable=True)
    is_read    = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)


class SiteMedia(Base):
    """Stores Google Drive links for capstone videos and CV documents."""
    __tablename__ = "site_media"
    id          = Column(Integer, primary_key=True, autoincrement=True)
    category    = Column(String(50), nullable=False)   # 'capstone_video' | 'cv_document'
    title       = Column(String(255), nullable=False)
    drive_url   = Column(String(1000), nullable=False, default="")
    abstract    = Column(Text, nullable=True, default=None)  # video abstract / description
    thumbnail   = Column(String(1000), nullable=True, default=None)  # /static/igs/thumb_xxx.jpg
    back_images = Column(JSON, nullable=True, default=None)   # list of up to 3 /static/igs/... paths
    order_index = Column(Integer, nullable=False, default=0)
    created_at  = Column(DateTime(timezone=True), nullable=False, default=_utcnow)
