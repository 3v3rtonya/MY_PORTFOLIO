"""Add site_media table

Revision ID: 0004
Revises: 0003
Create Date: 2025-01-04 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime, timezone

revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None

_NOW = datetime.now(timezone.utc)

SEED_DATA = [
    {"category": "capstone_video", "title": "Project Demo - Part 1", "drive_url": "", "order_index": 0, "created_at": _NOW},
    {"category": "capstone_video", "title": "Project Demo - Part 2", "drive_url": "", "order_index": 1, "created_at": _NOW},
    {"category": "capstone_video", "title": "Project Demo - Part 3", "drive_url": "", "order_index": 2, "created_at": _NOW},
    {"category": "cv_document", "title": "Everton Anyiro - Full CV", "drive_url": "", "order_index": 0, "created_at": _NOW},
    {"category": "cv_document", "title": "Technical Resume", "drive_url": "", "order_index": 1, "created_at": _NOW},
    {"category": "cv_document", "title": "Academic Transcript", "drive_url": "", "order_index": 2, "created_at": _NOW},
]


def upgrade() -> None:
    media_table = op.create_table(
        "site_media",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("category", sa.String(length=50), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("drive_url", sa.String(length=1000), nullable=False, server_default=""),
        sa.Column("order_index", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.bulk_insert(media_table, SEED_DATA)


def downgrade() -> None:
    op.drop_table("site_media")
