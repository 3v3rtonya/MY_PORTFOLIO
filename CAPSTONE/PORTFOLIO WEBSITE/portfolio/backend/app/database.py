import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase, Session

# Read and strip DATABASE_URL — strip removes any trailing whitespace/newlines
# that can sneak in from .env files
_raw_url = os.environ.get(
    "DATABASE_URL",
    "postgresql://postgres:1234@127.0.0.1:5432/portfolio"
).strip()

DATABASE_URL = (
    _raw_url
    .replace("postgresql+asyncpg://", "postgresql://")
    .replace("asyncpg://", "postgresql://")
    .strip()
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True, echo=False)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """FastAPI dependency - yields a sync Session."""
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()