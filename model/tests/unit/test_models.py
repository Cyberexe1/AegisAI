"""
Unit tests for Pydantic models.

Tests validation logic for CustomerData and other API models.
"""

import pytest
from datetime import datetime
from pydantic import ValidationError

from model.schemas import (
    CustomerData,
    PredictionResponse,
    HealthResponse,
    StatsResponse,
    PredictionRecord,
    ModelMetadata,
    CreditHistory,
    EmploymentType,
    RiskCategory,
)


class TestCustomerData:
    """Test CustomerData model validation."""

    def test_valid_customer_data(self):
        """Test that valid customer data is accepted."""
        data = CustomerData(
            income=50000.0,
            age=30,
            loan_amount=10000.0,
            credit_history="Good",
            employment_type="Full-time",
            existing_debts=5000.0,
        )
        assert data.income == 50000.0
        assert data.age == 30
        assert data.loan_amount == 10000.0
        assert data.credit_history == "Good"
        assert data.employment_type == "Full-time"
        assert data.existing_debts == 5000.0

    def test_income_must_be_positive(self):
        """Test that income must be greater than 0."""
        with pytest.raises(ValidationError) as exc_info:
            CustomerData(
                income=0,
                age=30,
                loan_amount=10000.0,
                credit_history="Good",
                employment_type="Full-time",
                existing_debts=5000.0,
            )
        assert "income must be greater than 0" in str(exc_info.value)

        with pytest.raises(ValidationError) as exc_info:
            CustomerData(
                income=-1000,
                age=30,
                loan_amount=10000.0,
                credit_history="Good",
                employment_type="Full-time",
                existing_debts=5000.0,
            )
        assert "income must be greater than 0" in str(exc_info.value)

    def test_age_must_be_between_18_and_100(self):
        """Test that age must be between 18 and 100."""
        # Test lower bound
        with pytest.raises(ValidationError) as exc_info:
            CustomerData(
                income=50000.0,
                age=17,
                loan_amount=10000.0,
                credit_history="Good",
                employment_type="Full-time",
                existing_debts=5000.0,
            )
        assert "age must be between 18 and 100" in str(exc_info.value)

        # Test upper bound
        with pytest.raises(ValidationError) as exc_info:
            CustomerData(
                income=50000.0,
                age=101,
                loan_amount=10000.0,
                credit_history="Good",
                employment_type="Full-time",
                existing_debts=5000.0,
            )
        assert "age must be between 18 and 100" in str(exc_info.value)

        # Test valid boundaries
        data_18 = CustomerData(
            income=50000.0,
            age=18,
            loan_amount=10000.0,
            credit_history="Good",
            employment_type="Full-time",
            existing_debts=5000.0,
        )
        assert data_18.age == 18

        data_100 = CustomerData(
            income=50000.0,
            age=100,
            loan_amount=10000.0,
            credit_history="Good",
            employment_type="Full-time",
            existing_debts=5000.0,
        )
        assert data_100.age == 100

    def test_loan_amount_must_be_positive(self):
        """Test that loan_amount must be greater than 0."""
        with pytest.raises(ValidationError) as exc_info:
            CustomerData(
                income=50000.0,
                age=30,
                loan_amount=0,
                credit_history="Good",
                employment_type="Full-time",
                existing_debts=5000.0,
            )
        assert "loan_amount must be greater than 0" in str(exc_info.value)

        with pytest.raises(ValidationError) as exc_info:
            CustomerData(
                income=50000.0,
                age=30,
                loan_amount=-5000,
                credit_history="Good",
                employment_type="Full-time",
                existing_debts=5000.0,
            )
        assert "loan_amount must be greater than 0" in str(exc_info.value)

    def test_existing_debts_must_be_non_negative(self):
        """Test that existing_debts must be >= 0."""
        with pytest.raises(ValidationError) as exc_info:
            CustomerData(
                income=50000.0,
                age=30,
                loan_amount=10000.0,
                credit_history="Good",
                employment_type="Full-time",
                existing_debts=-1000,
            )
        assert "existing_debts must be greater than or equal to 0" in str(exc_info.value)

        # Test that 0 is valid
        data = CustomerData(
            income=50000.0,
            age=30,
            loan_amount=10000.0,
            credit_history="Good",
            employment_type="Full-time",
            existing_debts=0,
        )
        assert data.existing_debts == 0

    def test_credit_history_must_be_valid(self):
        """Test that credit_history must be a valid enum value."""
        # Valid values
        for value in ["Good", "Fair", "Poor"]:
            data = CustomerData(
                income=50000.0,
                age=30,
                loan_amount=10000.0,
                credit_history=value,
                employment_type="Full-time",
                existing_debts=5000.0,
            )
            assert data.credit_history == value

        # Invalid value
        with pytest.raises(ValidationError) as exc_info:
            CustomerData(
                income=50000.0,
                age=30,
                loan_amount=10000.0,
                credit_history="Excellent",
                employment_type="Full-time",
                existing_debts=5000.0,
            )
        assert "credit_history must be one of" in str(exc_info.value)

    def test_employment_type_must_be_valid(self):
        """Test that employment_type must be a valid enum value."""
        # Valid values
        for value in ["Full-time", "Part-time", "Self-employed", "Unemployed"]:
            data = CustomerData(
                income=50000.0,
                age=30,
                loan_amount=10000.0,
                credit_history="Good",
                employment_type=value,
                existing_debts=5000.0,
            )
            assert data.employment_type == value

        # Invalid value
        with pytest.raises(ValidationError) as exc_info:
            CustomerData(
                income=50000.0,
                age=30,
                loan_amount=10000.0,
                credit_history="Good",
                employment_type="Contractor",
                existing_debts=5000.0,
            )
        assert "employment_type must be one of" in str(exc_info.value)


class TestPredictionResponse:
    """Test PredictionResponse model."""

    def test_valid_prediction_response(self):
        """Test that valid prediction response is accepted."""
        response = PredictionResponse(
            approval_probability=0.85,
            risk_category="Low",
            confidence_score=0.92,
            model_version="v1.0.0",
            processing_time_ms=45.5,
        )
        assert response.approval_probability == 0.85
        assert response.risk_category == "Low"
        assert response.confidence_score == 0.92
        assert response.model_version == "v1.0.0"
        assert response.processing_time_ms == 45.5

    def test_approval_probability_range(self):
        """Test that approval_probability must be between 0 and 1."""
        # Valid boundaries
        response_0 = PredictionResponse(
            approval_probability=0.0,
            risk_category="High",
            confidence_score=0.9,
            model_version="v1.0.0",
            processing_time_ms=45.5,
        )
        assert response_0.approval_probability == 0.0

        response_1 = PredictionResponse(
            approval_probability=1.0,
            risk_category="Low",
            confidence_score=0.9,
            model_version="v1.0.0",
            processing_time_ms=45.5,
        )
        assert response_1.approval_probability == 1.0

        # Invalid values
        with pytest.raises(ValidationError):
            PredictionResponse(
                approval_probability=-0.1,
                risk_category="High",
                confidence_score=0.9,
                model_version="v1.0.0",
                processing_time_ms=45.5,
            )

        with pytest.raises(ValidationError):
            PredictionResponse(
                approval_probability=1.1,
                risk_category="Low",
                confidence_score=0.9,
                model_version="v1.0.0",
                processing_time_ms=45.5,
            )

    def test_confidence_score_range(self):
        """Test that confidence_score must be between 0 and 1."""
        # Valid boundaries
        response_0 = PredictionResponse(
            approval_probability=0.5,
            risk_category="Medium",
            confidence_score=0.0,
            model_version="v1.0.0",
            processing_time_ms=45.5,
        )
        assert response_0.confidence_score == 0.0

        response_1 = PredictionResponse(
            approval_probability=0.5,
            risk_category="Medium",
            confidence_score=1.0,
            model_version="v1.0.0",
            processing_time_ms=45.5,
        )
        assert response_1.confidence_score == 1.0

        # Invalid values
        with pytest.raises(ValidationError):
            PredictionResponse(
                approval_probability=0.5,
                risk_category="Medium",
                confidence_score=-0.1,
                model_version="v1.0.0",
                processing_time_ms=45.5,
            )

        with pytest.raises(ValidationError):
            PredictionResponse(
                approval_probability=0.5,
                risk_category="Medium",
                confidence_score=1.1,
                model_version="v1.0.0",
                processing_time_ms=45.5,
            )


class TestHealthResponse:
    """Test HealthResponse model."""

    def test_valid_health_response(self):
        """Test that valid health response is accepted."""
        response = HealthResponse(
            status="healthy",
            model_loaded=True,
            database_connected=True,
            model_version="v1.0.0",
        )
        assert response.status == "healthy"
        assert response.model_loaded is True
        assert response.database_connected is True
        assert response.model_version == "v1.0.0"

    def test_health_response_without_model_version(self):
        """Test that model_version is optional."""
        response = HealthResponse(
            status="unhealthy",
            model_loaded=False,
            database_connected=True,
        )
        assert response.status == "unhealthy"
        assert response.model_loaded is False
        assert response.model_version is None


class TestStatsResponse:
    """Test StatsResponse model."""

    def test_valid_stats_response(self):
        """Test that valid stats response is accepted."""
        response = StatsResponse(
            total_predictions=100,
            risk_distribution={"Low": 50, "Medium": 30, "High": 20},
            average_approval_probability=0.65,
            average_processing_time_ms=42.3,
            date_range={
                "start": datetime(2024, 1, 1),
                "end": datetime(2024, 1, 31),
            },
        )
        assert response.total_predictions == 100
        assert response.risk_distribution == {"Low": 50, "Medium": 30, "High": 20}
        assert response.average_approval_probability == 0.65
        assert response.average_processing_time_ms == 42.3


class TestPredictionRecord:
    """Test PredictionRecord model."""

    def test_valid_prediction_record(self):
        """Test that valid prediction record is accepted."""
        customer_data = CustomerData(
            income=50000.0,
            age=30,
            loan_amount=10000.0,
            credit_history="Good",
            employment_type="Full-time",
            existing_debts=5000.0,
        )
        record = PredictionRecord(
            timestamp=datetime.now(),
            input_data=customer_data,
            approval_probability=0.85,
            risk_category="Low",
            confidence_score=0.92,
            model_version="v1.0.0",
            processing_time_ms=45.5,
        )
        assert record.input_data == customer_data
        assert record.approval_probability == 0.85

    def test_to_dict_serialization(self):
        """Test that PredictionRecord can be serialized to dict for MongoDB."""
        customer_data = CustomerData(
            income=50000.0,
            age=30,
            loan_amount=10000.0,
            credit_history="Good",
            employment_type="Full-time",
            existing_debts=5000.0,
        )
        timestamp = datetime(2024, 1, 15, 10, 30, 0)
        record = PredictionRecord(
            timestamp=timestamp,
            input_data=customer_data,
            approval_probability=0.85,
            risk_category="Low",
            confidence_score=0.92,
            model_version="v1.0.0",
            processing_time_ms=45.5,
        )
        
        result = record.to_dict()
        
        assert result["timestamp"] == timestamp
        assert result["approval_probability"] == 0.85
        assert result["risk_category"] == "Low"
        assert result["confidence_score"] == 0.92
        assert result["model_version"] == "v1.0.0"
        assert result["processing_time_ms"] == 45.5
        assert isinstance(result["input_data"], dict)
        assert result["input_data"]["income"] == 50000.0
        assert result["input_data"]["age"] == 30

    def test_from_dict_deserialization(self):
        """Test that PredictionRecord can be deserialized from MongoDB dict."""
        timestamp = datetime(2024, 1, 15, 10, 30, 0)
        data = {
            "_id": "507f1f77bcf86cd799439011",
            "timestamp": timestamp,
            "input_data": {
                "income": 50000.0,
                "age": 30,
                "loan_amount": 10000.0,
                "credit_history": "Good",
                "employment_type": "Full-time",
                "existing_debts": 5000.0,
            },
            "approval_probability": 0.85,
            "risk_category": "Low",
            "confidence_score": 0.92,
            "model_version": "v1.0.0",
            "processing_time_ms": 45.5,
        }
        
        record = PredictionRecord.from_dict(data)
        
        assert record.id == "507f1f77bcf86cd799439011"
        assert record.timestamp == timestamp
        assert isinstance(record.input_data, CustomerData)
        assert record.input_data.income == 50000.0
        assert record.input_data.age == 30
        assert record.approval_probability == 0.85
        assert record.risk_category == "Low"
        assert record.confidence_score == 0.92
        assert record.model_version == "v1.0.0"
        assert record.processing_time_ms == 45.5

    def test_round_trip_serialization(self):
        """Test that PredictionRecord can be serialized and deserialized."""
        customer_data = CustomerData(
            income=75000.0,
            age=45,
            loan_amount=25000.0,
            credit_history="Fair",
            employment_type="Self-employed",
            existing_debts=10000.0,
        )
        timestamp = datetime(2024, 2, 20, 14, 15, 30)
        original = PredictionRecord(
            timestamp=timestamp,
            input_data=customer_data,
            approval_probability=0.62,
            risk_category="Medium",
            confidence_score=0.88,
            model_version="v1.2.0",
            processing_time_ms=52.3,
        )
        
        # Serialize to dict
        data_dict = original.to_dict()
        # Add MongoDB _id
        data_dict["_id"] = "507f1f77bcf86cd799439012"
        
        # Deserialize back
        restored = PredictionRecord.from_dict(data_dict)
        
        assert restored.timestamp == original.timestamp
        assert restored.input_data.income == original.input_data.income
        assert restored.input_data.age == original.input_data.age
        assert restored.input_data.loan_amount == original.input_data.loan_amount
        assert restored.approval_probability == original.approval_probability
        assert restored.risk_category == original.risk_category
        assert restored.confidence_score == original.confidence_score
        assert restored.model_version == original.model_version
        assert restored.processing_time_ms == original.processing_time_ms


class TestModelMetadata:
    """Test ModelMetadata model."""

    def test_valid_model_metadata(self):
        """Test that valid model metadata is accepted."""
        metadata = ModelMetadata(
            version="v1.0.0",
            training_date=datetime.now(),
            algorithm="RandomForest",
            accuracy=0.96,
            precision=0.95,
            recall=0.94,
            f1_score=0.945,
            feature_names=["income", "age", "loan_amount", "credit_history", "employment_type", "existing_debts"],
            feature_importance={"income": 0.3, "age": 0.15, "loan_amount": 0.25},
            is_active=True,
        )
        assert metadata.version == "v1.0.0"
        assert metadata.algorithm == "RandomForest"
        assert metadata.accuracy == 0.96
        assert metadata.is_active is True

    def test_to_dict_serialization(self):
        """Test that ModelMetadata can be serialized to dict for MongoDB."""
        training_date = datetime(2024, 1, 10, 8, 0, 0)
        metadata = ModelMetadata(
            version="v1.0.0",
            training_date=training_date,
            algorithm="RandomForest",
            accuracy=0.96,
            precision=0.95,
            recall=0.94,
            f1_score=0.945,
            feature_names=["income", "age", "loan_amount"],
            feature_importance={"income": 0.5, "age": 0.3, "loan_amount": 0.2},
            is_active=True,
        )
        
        result = metadata.to_dict()
        
        assert result["version"] == "v1.0.0"
        assert result["training_date"] == training_date
        assert result["algorithm"] == "RandomForest"
        assert result["accuracy"] == 0.96
        assert result["precision"] == 0.95
        assert result["recall"] == 0.94
        assert result["f1_score"] == 0.945
        assert result["feature_names"] == ["income", "age", "loan_amount"]
        assert result["feature_importance"] == {"income": 0.5, "age": 0.3, "loan_amount": 0.2}
        assert result["is_active"] is True

    def test_from_dict_deserialization(self):
        """Test that ModelMetadata can be deserialized from MongoDB dict."""
        training_date = datetime(2024, 1, 10, 8, 0, 0)
        data = {
            "_id": "507f1f77bcf86cd799439013",
            "version": "v1.0.0",
            "training_date": training_date,
            "algorithm": "XGBoost",
            "accuracy": 0.97,
            "precision": 0.96,
            "recall": 0.95,
            "f1_score": 0.955,
            "feature_names": ["income", "age", "loan_amount", "credit_history"],
            "feature_importance": {"income": 0.4, "age": 0.2, "loan_amount": 0.3, "credit_history": 0.1},
            "is_active": False,
        }
        
        metadata = ModelMetadata.from_dict(data)
        
        assert metadata.version == "v1.0.0"
        assert metadata.training_date == training_date
        assert metadata.algorithm == "XGBoost"
        assert metadata.accuracy == 0.97
        assert metadata.precision == 0.96
        assert metadata.recall == 0.95
        assert metadata.f1_score == 0.955
        assert metadata.feature_names == ["income", "age", "loan_amount", "credit_history"]
        assert metadata.feature_importance == {"income": 0.4, "age": 0.2, "loan_amount": 0.3, "credit_history": 0.1}
        assert metadata.is_active is False

    def test_round_trip_serialization(self):
        """Test that ModelMetadata can be serialized and deserialized."""
        training_date = datetime(2024, 3, 5, 12, 30, 45)
        original = ModelMetadata(
            version="v2.1.0",
            training_date=training_date,
            algorithm="RandomForest",
            accuracy=0.98,
            precision=0.97,
            recall=0.96,
            f1_score=0.965,
            feature_names=["income", "age", "loan_amount", "credit_history", "employment_type", "existing_debts"],
            feature_importance={
                "income": 0.25,
                "age": 0.15,
                "loan_amount": 0.20,
                "credit_history": 0.18,
                "employment_type": 0.12,
                "existing_debts": 0.10,
            },
            is_active=True,
        )
        
        # Serialize to dict
        data_dict = original.to_dict()
        # Add MongoDB _id
        data_dict["_id"] = "507f1f77bcf86cd799439014"
        
        # Deserialize back
        restored = ModelMetadata.from_dict(data_dict)
        
        assert restored.version == original.version
        assert restored.training_date == original.training_date
        assert restored.algorithm == original.algorithm
        assert restored.accuracy == original.accuracy
        assert restored.precision == original.precision
        assert restored.recall == original.recall
        assert restored.f1_score == original.f1_score
        assert restored.feature_names == original.feature_names
        assert restored.feature_importance == original.feature_importance
        assert restored.is_active == original.is_active


class TestEnums:
    """Test enum definitions."""

    def test_credit_history_enum(self):
        """Test CreditHistory enum values."""
        assert CreditHistory.GOOD.value == "Good"
        assert CreditHistory.FAIR.value == "Fair"
        assert CreditHistory.POOR.value == "Poor"

    def test_employment_type_enum(self):
        """Test EmploymentType enum values."""
        assert EmploymentType.FULL_TIME.value == "Full-time"
        assert EmploymentType.PART_TIME.value == "Part-time"
        assert EmploymentType.SELF_EMPLOYED.value == "Self-employed"
        assert EmploymentType.UNEMPLOYED.value == "Unemployed"

    def test_risk_category_enum(self):
        """Test RiskCategory enum values."""
        assert RiskCategory.LOW.value == "Low"
        assert RiskCategory.MEDIUM.value == "Medium"
        assert RiskCategory.HIGH.value == "High"
