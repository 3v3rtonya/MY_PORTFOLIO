"""Add abstract column to site_media

Revision ID: 0005
Revises: 0004
Create Date: 2026-10-14 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = "0005"
down_revision = "0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "site_media",
        sa.Column("abstract", sa.Text(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("site_media", "abstract")
