"""Initial schema — all four tables + seed projects

Revision ID: 0001
Revises:
Create Date: 2025-01-01 00:00:00.000000
"""
from datetime import datetime, timezone

import sqlalchemy as sa
from alembic import op

# ── Revision identifiers ──────────────────────────────────────────────────────
revision = "0001"
down_revision = None
branch_labels = None
depends_on = None

_NOW = datetime.now(timezone.utc)

# ── Seed data ─────────────────────────────────────────────────────────────────
SEED_PROJECTS = [
    {
        "title": "Sarova Panafric Inventory & Sales Management System",
        "description": (
            "Real-time hotel inventory and sales management system solving operational "
            "inefficiencies at hospitality venues like Sarova Panafric. Manages stock "
            "levels, sales tracking, and comprehensive reporting for hotel operations."
        ),
        "tech_stack": ["HTML", "React", "Tailwind CSS", "Python", "MySQL"],
        "github_url": None,
        "live_url": None,
        "image_url": None,
        "created_at": _NOW,
    },
    {
        "title": "Mt. Kenya Running Club Platform",
        "description": (
            "Full-featured platform for an outdoor activities club organizing hikes, "
            "bike rides, charity events, and Mt. Kenya expeditions. Includes an online "
            "merchandise store and annual membership registration with fee processing."
        ),
        "tech_stack": ["HTML", "React.js", "Tailwind CSS", "Python", "Flask"],
        "github_url": None,
        "live_url": None,
        "image_url": None,
        "created_at": _NOW,
    },
    {
        "title": "DeKUT InteLog",
        "description": (
            "University industrial attachment management system that digitizes the manual "
            "paper-based logbook process. Enables lecturers real-time visibility into "
            "student attachment activities, replacing paper logbooks with a digital-first "
            "workflow. Supports both industrial and internal attachments."
        ),
        "tech_stack": ["HTML", "React", "Tailwind CSS", "Python", "PostgreSQL"],
        "github_url": None,
        "live_url": None,
        "image_url": None,
        "created_at": _NOW,
    },
]


def upgrade() -> None:
    # ── projects ──────────────────────────────────────────────────────────────
    projects_table = op.create_table(
        "projects",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("tech_stack", sa.JSON(), nullable=False),
        sa.Column("github_url", sa.String(length=500), nullable=True),
        sa.Column("live_url", sa.String(length=500), nullable=True),
        sa.Column("image_url", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    # ── contact_messages ──────────────────────────────────────────────────────
    op.create_table(
        "contact_messages",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("subject", sa.String(length=500), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column(
            "is_read",
            sa.Boolean(),
            nullable=False,
            server_default="false",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    # ── admin_users ───────────────────────────────────────────────────────────
    op.create_table(
        "admin_users",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("username", sa.String(length=100), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("username"),
    )

    # ── cv_download_logs ──────────────────────────────────────────────────────
    op.create_table(
        "cv_download_logs",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("ip_address", sa.String(length=45), nullable=False),
        sa.Column("user_agent", sa.Text(), nullable=False),
        sa.Column("downloaded_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    # ── Seed the three required projects ──────────────────────────────────────
    op.bulk_insert(projects_table, SEED_PROJECTS)


def downgrade() -> None:
    op.drop_table("cv_download_logs")
    op.drop_table("admin_users")
    op.drop_table("contact_messages")
    op.drop_table("projects")
