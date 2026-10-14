import os
import sys
from logging.config import fileConfig
from alembic import context
from sqlalchemy import engine_from_config, pool

_HERE = os.path.dirname(os.path.abspath(__file__))
_BACKEND = os.path.normpath(os.path.join(_HERE, '..', '..', 'backend'))
if _BACKEND not in sys.path:
    sys.path.insert(0, _BACKEND)

# Read DATABASE_URL — strip ALL whitespace/newline characters to be safe
_raw_url = os.environ.get("DATABASE_URL", "postgresql://postgres:1234@127.0.0.1:5432/portfolio").strip()
_sync_url = (
    _raw_url
    .replace("postgresql+asyncpg://", "postgresql://")
    .replace("asyncpg://", "postgresql://")
    
)

# Set env var so pydantic-settings in app.database picks up the clean value
os.environ["DATABASE_URL"] = _sync_url
os.environ.setdefault("JWT_SECRET_KEY", "everton-portfolio-secret-key-2024-dekut-bbit")
os.environ.setdefault("ALLOWED_ORIGINS", "http://localhost:5173")
os.environ.setdefault("CV_FILE_PATH", "./static/Everton_Anyiro_CV.pdf")

# Now safe to import ORM models
from app.database import Base   # noqa: E402
import app.models.orm           # noqa: F401

config = context.config
config.set_main_option("sqlalchemy.url", _sync_url)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url, target_metadata=target_metadata,
        literal_binds=True, dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()