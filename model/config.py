"""
Configuration management for ML Credit Risk Model.

Uses Pydantic Settings to load configuration from environment variables.
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # MongoDB Configuration
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DATABASE: str = "credit_risk_db"
    
    # Model Configuration
    MODEL_PATH: str = "model/trained_models/credit_risk_model.joblib"
    MODEL_VERSION: str = "v1.0.0"
    
    # API Configuration
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    API_RELOAD: bool = False
    
    # CORS Configuration
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:8080,http://localhost:5173"
    
    # Logging Configuration
    LOG_LEVEL: str = "INFO"
    
    # Training Configuration
    TRAINING_DATA_PATH: str = "model/data/credit_data.csv"
    TEST_SIZE: float = 0.2
    RANDOM_STATE: int = 42
    MIN_ACCURACY_THRESHOLD: float = 0.95
    
    # Model Algorithm (RandomForest or XGBoost)
    MODEL_ALGORITHM: str = "RandomForest"
    
    # OpenRouter API Configuration (Phase 5 - LLM Observability)
    OPENROUTER_API_KEY: str = ""
    
    # Explainability Configuration
    ENABLE_SHAP: bool = True
    SHAP_SAMPLE_SIZE: int = 100
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()
