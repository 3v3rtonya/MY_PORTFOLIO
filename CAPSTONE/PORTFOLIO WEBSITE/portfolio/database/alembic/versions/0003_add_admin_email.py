"""Add email column to admin_users

Revision ID: 0003
Revises: 0002
Create Date: 2025-01-03 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add email column (nullable first so existing rows dont fail)
    op.add_column(
        "admin_users",
        sa.Column("email", sa.String(length=255), nullable=True),
    )
    # Backfill existing admin row with a placeholder email
    op.execute("UPDATE admin_users SET email = 'admin@portfolio.local' WHERE email IS NULL")
    # Now enforce NOT NULL + UNIQUE
    op.alter_column("admin_users", "email", nullable=False)
    op.create_unique_constraint("uq_admin_users_email", "admin_users", ["email"])


def downgrade() -> None:
    op.drop_constraint("uq_admin_users_email", "admin_users", type_="unique")
    op.drop_column("admin_users", "email")
