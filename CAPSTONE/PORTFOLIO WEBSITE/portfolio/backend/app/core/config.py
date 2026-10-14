from functools import lru_cache
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str
    jwt_secret_key: str
    allowed_origins: str
    cv_file_path: str = "./static/Everton_Anyiro_CV.pdf"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    @field_validator("database_url", mode="before")
    @classmethod
    def strip_database_url(cls, v: str) -> str:
        """Strip whitespace and normalise asyncpg -> psycopg2 URL."""
        v = str(v).strip()
        v = v.replace("postgresql+asyncpg://", "postgresql://")
        v = v.replace("asyncpg://", "postgresql://")
        return v

    @field_validator("jwt_secret_key", "cv_file_path", "allowed_origins", mode="before")
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        return str(v).strip()

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]