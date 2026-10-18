import os
from pydantic_settings import BaseSettings

# Anchor the default SQLite file to the backend/ directory (parent of app/),
# NOT the process's current working directory. Without this, running the
# server from backend/ and a script from the repo root silently creates two
# different database files.
_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
_DEFAULT_SQLITE_PATH = os.path.join(_BACKEND_DIR, "fame_genix.db")


class Settings(BaseSettings):
    APP_NAME: str = "Fame Genix"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    SIMULATION_MODE: bool = os.getenv("SIMULATION_MODE", os.getenv("DEMO_MODE", "true")).lower() == "true"
    DEMO_MODE: bool = SIMULATION_MODE

    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{_DEFAULT_SQLITE_PATH}")

    JWT_SECRET: str = os.getenv("JWT_SECRET", "fame_genix_production_secret_key_32_bytes_long_safe_hs256")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours for development
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    ALLOW_QML: bool = False

    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")
    AI_ENABLED: bool = os.getenv("AI_ENABLED", "true").lower() == "true"
    AI_TIMEOUT_SECONDS: int = int(os.getenv("AI_TIMEOUT_SECONDS", "30"))

    class Config:
        env_file = (
            ".env",
            "backend/.env",
            os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env"),
            os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "backend", ".env")
        )
        extra = "ignore"


settings = Settings()
