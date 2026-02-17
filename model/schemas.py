"""
Pydantic models for ML Credit Risk Prediction API.

This module defines the data models used for API request/response validation
and database storage.
"""

from datetime import datetime
from enum import Enum
from typing import Dict, Optional

from pydantic import BaseModel, Field, field_validator


class CreditHistory(str, Enum):
    """Valid credit history values."""
    GOOD = "Good"
    FAIR = "Fair"
    POOR = "Poor"


class EmploymentType(str, Enum):
    """Valid employment type values."""
    FULL_TIME = "Full-time"
    PART_TIME = "Part-time"
    SELF_EMPLOYED = "Self-employed"
    UNEMPLOYED = "Unemployed"


class RiskCategory(str, Enum):
    """Risk category classification."""
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


class CustomerData(BaseModel):
    """
    Customer financial data for credit risk prediction.
    
    Validates Requirements: 2.1, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
    """
    income: float = Field(..., description="Annual income in dollars")
    age: int = Field(..., description="Customer age in years")
    loan_amount: float = Field(..., description="Requested loan amount in dollars")
    credit_history: str = Field(..., description="Credit history rating")
    employment_type: str = Field(..., description="Type of employment")
    existing_debts: float = Field(..., description="Total existing debts in dollars")
    user_id: Optional[str] = Field(None, description="User ID for tracking (optional)")

    @field_validator("income")
    @classmethod
    def validate_income(cls, v: float) -> float:
        """Validate that income is positive."""
        if v <= 0:
            raise ValueError("income must be greater than 0")
        return v

    @field_validator("age")
    @classmethod
    def validate_age(cls, v: int) -> int:
        """Validate that age is between 18 and 100."""
        if v < 18 or v > 100:
            raise ValueError("age must be between 18 and 100")
        return v

    @field_validator("loan_amount")
    @classmethod
    def validate_loan_amount(cls, v: float) -> float:
        """Validate that loan amount is positive."""
        if v <= 0:
            raise ValueError("loan_amount must be greater than 0")
        return v

    @field_validator("existing_debts")
    @classmethod
    def validate_existing_debts(cls, v: float) -> float:
        """Validate that existing debts is non-negative."""
        if v < 0:
            raise ValueError("existing_debts must be greater than or equal to 0")
        return v

    @field_validator("credit_history")
    @classmethod
    def validate_credit_history(cls, v: str) -> str:
        """Validate that credit_history is a valid enum value."""
        valid_values = [e.value for e in CreditHistory]
        if v not in valid_values:
            raise ValueError(f"credit_history must be one of {valid_values}")
        return v

    @field_validator("employment_type")
    @classmethod
    def validate_employment_type(cls, v: str) -> str:
        """Validate that employment_type is a valid enum value."""
        valid_values = [e.value for e in EmploymentType]
        if v not in valid_values:
            raise ValueError(f"employment_type must be one of {valid_values}")
        return v


class PredictionResponse(BaseModel):
    """
    Response model for credit risk predictions.
    
    Validates Requirements: 2.1, 2.2, 2.3
    """
    model_config = {"protected_namespaces": ()}
    
    approval_probability: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Probability of loan approval (0.0 to 1.0)"
    )
    risk_category: str = Field(..., description="Risk category: Low, Medium, or High")
    confidence_score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Model confidence in prediction (0.0 to 1.0)"
    )
    model_version: str = Field(..., description="Version of the model used")
    processing_time_ms: float = Field(..., description="Processing time in milliseconds")


class HealthResponse(BaseModel):
    """
    Response model for health check endpoint.
    
    Validates Requirements: 8.1, 8.2, 8.3, 8.4
    """
    model_config = {"protected_namespaces": ()}
    
    status: str = Field(..., description="Service status: healthy or unhealthy")
    model_loaded: bool = Field(..., description="Whether ML model is loaded")
    database_connected: bool = Field(..., description="Whether database connection is active")
    model_version: Optional[str] = Field(None, description="Current active model version")


class StatsResponse(BaseModel):
    """
    Response model for statistics endpoint.
    
    Validates Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
    """
    total_predictions: int = Field(..., description="Total number of predictions made")
    risk_distribution: Dict[str, int] = Field(
        ...,
        description="Distribution of risk categories"
    )
    average_approval_probability: float = Field(
        ...,
        description="Average approval probability across all predictions"
    )
    average_processing_time_ms: float = Field(
        ...,
        description="Average processing time in milliseconds"
    )
    date_range: Dict[str, datetime] = Field(
        ...,
        description="Date range of predictions (start and end)"
    )


class PredictionRecord(BaseModel):
    """
    Database model for storing prediction records.

    Validates Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6
    """
    model_config = {"protected_namespaces": ()}

    id: Optional[str] = Field(None, description="MongoDB ObjectId")
    timestamp: datetime = Field(..., description="When the prediction was made")
    input_data: CustomerData = Field(..., description="Input customer data")
    approval_probability: float = Field(..., description="Predicted approval probability")
    risk_category: str = Field(..., description="Assigned risk category")
    confidence_score: float = Field(..., description="Model confidence score")
    model_version: str = Field(..., description="Model version used for prediction")
    processing_time_ms: float = Field(..., description="Processing time in milliseconds")
    user_id: Optional[str] = Field(None, description="User ID for tracking")

    def to_dict(self) -> Dict:
        """
        Convert PredictionRecord to dictionary for MongoDB storage.

        Returns:
            Dictionary representation with datetime objects for MongoDB.
        """
        result = {
            "timestamp": self.timestamp,
            "input_data": self.input_data.model_dump(),
            "approval_probability": self.approval_probability,
            "risk_category": self.risk_category,
            "confidence_score": self.confidence_score,
            "model_version": self.model_version,
            "processing_time_ms": self.processing_time_ms
        }
        if self.user_id:
            result["user_id"] = self.user_id
        return result

    @classmethod
    def from_dict(cls, data: Dict) -> "PredictionRecord":
        """
        Create PredictionRecord from MongoDB document.

        Args:
            data: Dictionary from MongoDB (may include _id field)

        Returns:
            PredictionRecord instance
        """
        # Convert MongoDB _id to string id if present
        record_data = data.copy()
        if "_id" in record_data:
            record_data["id"] = str(record_data.pop("_id"))

        # Convert input_data dict to CustomerData object
        if "input_data" in record_data and isinstance(record_data["input_data"], dict):
            record_data["input_data"] = CustomerData(**record_data["input_data"])

        return cls(**record_data)



class ModelMetadata(BaseModel):
    """
    Database model for storing model metadata.

    Validates Requirements: 1.5, 7.1, 7.2, 7.3, 7.4
    """
    version: str = Field(..., description="Model version identifier")
    training_date: datetime = Field(..., description="When the model was trained")
    algorithm: str = Field(..., description="Algorithm used (RandomForest or XGBoost)")
    accuracy: float = Field(..., description="Model accuracy on test set")
    precision: float = Field(..., description="Model precision score")
    recall: float = Field(..., description="Model recall score")
    f1_score: float = Field(..., description="Model F1 score")
    feature_names: list[str] = Field(..., description="List of feature names")
    feature_importance: Dict[str, float] = Field(..., description="Feature importance scores")
    is_active: bool = Field(..., description="Whether this is the active model version")

    def to_dict(self) -> Dict:
        """
        Convert ModelMetadata to dictionary for MongoDB storage.

        Returns:
            Dictionary representation with datetime objects for MongoDB.
        """
        return {
            "version": self.version,
            "training_date": self.training_date,
            "algorithm": self.algorithm,
            "accuracy": self.accuracy,
            "precision": self.precision,
            "recall": self.recall,
            "f1_score": self.f1_score,
            "feature_names": self.feature_names,
            "feature_importance": self.feature_importance,
            "is_active": self.is_active
        }

    @classmethod
    def from_dict(cls, data: Dict) -> "ModelMetadata":
        """
        Create ModelMetadata from MongoDB document.

        Args:
            data: Dictionary from MongoDB (may include _id field)

        Returns:
            ModelMetadata instance
        """
        # Remove MongoDB _id field if present (not part of our model)
        record_data = data.copy()
        record_data.pop("_id", None)

        return cls(**record_data)

