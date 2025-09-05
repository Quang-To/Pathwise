from typing import List, ClassVar, Dict, Any
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from dotenv import load_dotenv

load_dotenv()

class CourseraSettings(BaseSettings):
    URI: str = Field(..., alias="URI_COURSERA")
    TARGET: str = "full"
    LIMIT: int = 100
    MAX_RETRIES: int = 3
    FIELD: List[str] = [
        "id", "name", "description", "slug", "language", "level",
        "photoUrl", "workload", "partnerIds", "domainTypes"
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )

class GenerateSettings(BaseSettings):
    KEY_GEN_1: str
    GEMINI_GENERATE_MODEL: str = "gemini-1.5-flash"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="GEN_",
        extra="ignore"
    )

class EmbeddingSettings(BaseSettings):
    KEY_EMBEDDING_1: str
    KEY_EMBEDDING_2: str
    KEY_EMBEDDING_3: str
    KEY_EMBEDDING_4: str
    GEMINI_EMBED_MODEL: str = "text-embedding-004"

    EMBEDDING_CONFIG: ClassVar[Dict[str, Any]] = {
        "task_type": "semantic_similarity",
        "output_dimensionality": 768,
        "max_retries": 5,
        "retry_delay_base": 2,
        "max_retry_delay": 60,
        "batch_size": 32,
        "max_workers": 4
    }

    model_config = SettingsConfigDict(
        env_prefix="EM_",
        env_file=".env",
        extra="ignore"
    )

class DataBase(BaseSettings):
    ENDPOINT: str
    PORT: int = 5432
    USER: str
    PASSWORD: str
    DATABASE: str

    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="RDS_",
        extra="ignore"
    )

class Milvus(BaseSettings):
    HOST: str
    PORT: str

    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="MIL_",
        extra="ignore"
    )

class Recommendation(BaseSettings):
    UPPER_THRESHOLD: float = 0.95
    LOWER_THRESHOLD: float = 0.75
    STEP_THRESHOLD: float = 0.05

class Settings(BaseSettings):
    coursera: CourseraSettings = CourseraSettings()
    embedding: EmbeddingSettings = EmbeddingSettings()
    database: DataBase = DataBase()
    milvus: Milvus = Milvus()
    generate: GenerateSettings = GenerateSettings()
    recommendation: Recommendation = Recommendation()

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )