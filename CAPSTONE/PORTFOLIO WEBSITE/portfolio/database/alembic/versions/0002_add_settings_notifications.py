"""Add site_settings and notifications tables

Revision ID: 0002
Revises: 0001
Create Date: 2025-01-02 00:00:00.000000
"""
from datetime import datetime, timezone
from alembic import op
import sqlalchemy as sa

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None

DEFAULT_SETTINGS = [
    {"key": "github",    "value": "https://github.com/evertonanyiro",      "updated_at": datetime.now(timezone.utc)},
    {"key": "linkedin",  "value": "https://linkedin.com/in/evertonanyiro", "updated_at": datetime.now(timezone.utc)},
    {"key": "facebook",  "value": "https://facebook.com/evertonanyiro",    "updated_at": datetime.now(timezone.utc)},
    {"key": "x",         "value": "https://x.com/evertonanyiro",           "updated_at": datetime.now(timezone.utc)},
    {"key": "instagram", "value": "https://instagram.com/evertonanyiro",   "updated_at": datetime.now(timezone.utc)},
    {"key": "whatsapp",  "value": "https://wa.me/254700000000",            "updated_at": datetime.now(timezone.utc)},
    {"key": "email",     "value": "everton.anyiro@gmail.com",              "updated_at": datetime.now(timezone.utc)},
    {"key": "phone",     "value": "+254 700 000 000",                      "updated_at": datetime.now(timezone.utc)},
    {"key": "photo_url", "value": "",                                      "updated_at": datetime.now(timezone.utc)},
    {"key": "cv_path",   "value": "./static/Everton_Anyiro_CV.pdf",        "updated_at": datetime.now(timezone.utc)},
]


def upgrade() -> None:
    settings_table = op.create_table(
        "site_settings",
        sa.Column("id",         sa.Integer(),                   primary_key=True, autoincrement=True),
        sa.Column("key",        sa.String(length=100),          nullable=False),
        sa.Column("value",      sa.Text(),                      nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True),     nullable=False),
        sa.UniqueConstraint("key"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "notifications",
        sa.Column("id",         sa.Integer(),               primary_key=True, autoincrement=True),
        sa.Column("type",       sa.String(length=50),       nullable=False),
        sa.Column("title",      sa.String(length=255),      nullable=False),
        sa.Column("body",       sa.Text(),                  nullable=True),
        sa.Column("is_read",    sa.Boolean(),               nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.bulk_insert(settings_table, DEFAULT_SETTINGS)


def downgrade() -> None:
    op.drop_table("notifications")
    op.drop_table("site_settings")
