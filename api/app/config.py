from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://goodnews:goodnews@localhost/goodnews"
    anthropic_api_key: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()

BASE_DIR = Path(__file__).parent.parent
SCORER_CRITERIA_PATH = BASE_DIR / "scorer_criteria.md"
CRAWLER_SOURCES_PATH = BASE_DIR / "config" / "crawler_sources.yaml"
