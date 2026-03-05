"""Application configuration via environment variables."""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/boqpro"

    # Auth
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiry_days: int = 7

    # Anthropic
    anthropic_api_key: str = ""
    llm_model: str = "claude-sonnet-4-20250514"

    # Server
    port: int = 8000
    storage_path: str = "./uploads"
    max_upload_size: int = 50 * 1024 * 1024  # 50MB

    # CV Models (Phase 4+)
    yolo_model_path: str = "./models/yolov8_floorplan.pt"
    ocr_languages: str = "he,en"

    model_config = {"env_file": ".env", "extra": "ignore"}


@lru_cache()
def get_settings() -> Settings:
    return Settings()
