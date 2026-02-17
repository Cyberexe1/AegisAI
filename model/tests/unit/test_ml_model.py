"""
Unit tests for ML Model
"""

import pytest
import numpy as np
from ml_model import MLModel


class TestMLModel:
    """Test suite for MLModel class"""
    
    @pytest.fixture
    def model(self):
        """Create model instance for testing"""
        return MLModel()
    
    def test_model_initialization(self, model):
        """Test model initializes correctly"""
        assert model is not None
        assert model.model is None  # Not loaded yet
        assert model.feature_names is not None
    
    def test_preprocess_input(self, model):
        """Test input preprocessing"""
        input_data = {
            "income": 50000,
            "age": 30,
            "loan_amount": 10000,
            "credit_history": "Good",
            "employment_type": "Full-time",
            "existing_debts": 5000
        }
        
        processed = model.preprocess_input(input_data)
        assert processed is not None
        assert isinstance(processed, np.ndarray)
        assert processed.shape[1] == len(model.feature_names)
    
    def test_preprocess_input_validation(self, model):
        """Test input validation in preprocessing"""
        # Missing required field
        with pytest.raises(KeyError):
            model.preprocess_input({"income": 50000})
        
        # Invalid credit history
        invalid_input = {
            "income": 50000,
            "age": 30,
            "loan_amount": 10000,
            "credit_history": "Invalid",
            "employment_type": "Full-time",
            "existing_debts": 5000
        }
        with pytest.raises(ValueError):
            model.preprocess_input(invalid_input)
    
    def test_predict_without_model(self, model):
        """Test prediction fails without loaded model"""
        input_data = {
            "income": 50000,
            "age": 30,
            "loan_amount": 10000,
            "credit_history": "Good",
            "employment_type": "Full-time",
            "existing_debts": 5000
        }
        
        with pytest.raises(ValueError, match="Model not loaded"):
            model.predict(input_data)
    
    @pytest.mark.skipif(
        not pytest.config.getoption("--run-integration"),
        reason="Requires trained model"
    )
    def test_predict_with_model(self, model):
        """Test prediction with loaded model (integration test)"""
        model.load_model("trained_models/credit_risk_model.joblib")
        
        input_data = {
            "income": 50000,
            "age": 30,
            "loan_amount": 10000,
            "credit_history": "Good",
            "employment_type": "Full-time",
            "existing_debts": 5000
        }
        
        result = model.predict(input_data)
        
        # Validate result structure
        assert "risk_score" in result
        assert "risk_category" in result
        assert "confidence" in result
        assert "approval_probability" in result
        
        # Validate value ranges
        assert 0 <= result["risk_score"] <= 100
        assert 0 <= result["confidence"] <= 1
        assert 0 <= result["approval_probability"] <= 1
        assert result["risk_category"] in ["Low", "Medium", "High"]
    
    def test_get_model_version(self, model):
        """Test model version retrieval"""
        version = model.get_model_version()
        assert version is not None
        assert isinstance(version, str)
    
    def test_feature_names(self, model):
        """Test feature names are defined"""
        assert len(model.feature_names) > 0
        expected_features = [
            "income", "age", "loan_amount", "existing_debts",
            "credit_history_Good", "credit_history_Fair", "credit_history_Poor",
            "employment_type_Full-time", "employment_type_Part-time",
            "employment_type_Self-employed", "employment_type_Unemployed"
        ]
        for feature in expected_features:
            assert feature in model.feature_names


def pytest_addoption(parser):
    """Add custom pytest options"""
    parser.addoption(
        "--run-integration",
        action="store_true",
        default=False,
        help="Run integration tests that require trained model"
    )
