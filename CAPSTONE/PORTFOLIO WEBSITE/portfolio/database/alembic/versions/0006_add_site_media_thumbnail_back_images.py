"""Add thumbnail and back_images columns to site_media

Revision ID: 0006
Revises: 0005
Create Date: 2026-10-14 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0006"
down_revision = "0005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "site_media",
        sa.Column("thumbnail", sa.String(length=1000), nullable=True),
    )
    op.add_column(
        "site_media",
        sa.Column("back_images", sa.JSON(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("site_media", "back_images")
    op.drop_column("site_media", "thumbnail")
