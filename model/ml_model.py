"""
ML Model wrapper for credit risk prediction.

Handles model loading, prediction, and risk categorization.
"""

import joblib
import logging
from pathlib import Path
from typing import Dict, Tuple
import numpy as np

from schemas import CustomerData, RiskCategory

logger = logging.getLogger(__name__)


class MLModel:
    """
    Wrapper class for ML credit risk prediction model.
    
    Validates Requirements: 1.1, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
    """
    
    def __init__(self, model_path: str = None):
        """Initialize ML model wrapper."""
        self.model = None
        self.label_encoder = None
        self.model_version = None
        self.feature_names = [
            'income', 'age', 'loan_amount', 'credit_history_encoded',
            'employment_type_encoded', 'existing_debts'
        ]
        
        if model_path:
            self.load_model(model_path)
    
    def load_model(self, model_path: str) -> None:
        """
        Load serialized model from disk.
        
        Args:
            model_path: Path to the model file
            
        Raises:
            FileNotFoundError: If model file doesn't exist
            Exception: If model loading fails
        """
        try:
            model_file = Path(model_path)
            if not model_file.exists():
                raise FileNotFoundError(f"Model file not found: {model_path}")
            
            self.model = joblib.load(model_path)
            
            # Try to load label encoder if it exists
            encoder_path = model_file.parent / "label_encoder.joblib"
            if encoder_path.exists():
                self.label_encoder = joblib.load(encoder_path)
            
            # Extract version from path or metadata
            self.model_version = model_file.stem.split('_')[-1] if '_' in model_file.stem else "v1.0.0"
            
            logger.info(f"Model loaded successfully: {model_path}")
            logger.info(f"Model version: {self.model_version}")
            
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise
    
    def predict(self, customer_data: CustomerData) -> Tuple[float, str, float]:
        """
        Generate prediction for customer data.
        
        Args:
            customer_data: Customer financial data
            
        Returns:
            Tuple of (approval_probability, risk_category, confidence_score)
            
        Raises:
            ValueError: If model is not loaded
            Exception: If prediction fails
        """
        if self.model is None:
            raise ValueError("Model not loaded. Call load_model() first.")
        
        try:
            # Encode categorical features
            credit_history_map = {"Good": 2, "Fair": 1, "Poor": 0}
            employment_type_map = {
                "Full-time": 3,
                "Part-time": 2,
                "Self-employed": 1,
                "Unemployed": 0
            }
            
            credit_encoded = credit_history_map.get(customer_data.credit_history, 1)
            employment_encoded = employment_type_map.get(customer_data.employment_type, 0)
            
            # Prepare features array
            features = np.array([[
                customer_data.income,
                customer_data.age,
                customer_data.loan_amount,
                credit_encoded,
                employment_encoded,
                customer_data.existing_debts
            ]])
            
            # Get prediction probabilities
            prediction_proba = self.model.predict_proba(features)[0]
            
            # Calculate metrics
            # prediction_proba[0] = probability of rejection (class 0)
            # prediction_proba[1] = probability of approval (class 1)
            approval_probability = float(prediction_proba[1])
            confidence_score = float(max(prediction_proba))
            
            # Determine risk category based on approval probability
            risk_category = self._map_risk_category(approval_probability)
            
            return approval_probability, risk_category, confidence_score
            
        except Exception as e:
            logger.error(f"Prediction failed: {e}")
            raise
    
    def _map_risk_category(self, approval_probability: float) -> str:
        """
        Map approval probability to risk category.
        
        Requirements 2.4, 2.5, 2.6:
        - If probability > 0.7, then risk category = "Low"
        - If 0.3 ≤ probability ≤ 0.7, then risk category = "Medium"
        - If probability < 0.3, then risk category = "High"
        
        Args:
            approval_probability: Probability of loan approval (0-1)
            
        Returns:
            Risk category: "Low", "Medium", or "High"
        """
        if approval_probability > 0.7:
            return RiskCategory.LOW.value
        elif approval_probability >= 0.3:
            return RiskCategory.MEDIUM.value
        else:
            return RiskCategory.HIGH.value
    
    def get_model_version(self) -> str:
        """Return current model version."""
        return self.model_version or "unknown"
    
    def get_feature_importance(self) -> Dict[str, float]:
        """
        Return feature importance scores.
        
        Returns:
            Dictionary mapping feature names to importance scores
        """
        if self.model is None:
            return {}
        
        try:
            if hasattr(self.model, 'feature_importances_'):
                importances = self.model.feature_importances_
                return dict(zip(self.feature_names, importances.tolist()))
            else:
                logger.warning("Model does not have feature_importances_ attribute")
                return {}
        except Exception as e:
            logger.error(f"Failed to get feature importance: {e}")
            return {}
    
    def is_loaded(self) -> bool:
        """Check if model is loaded."""
        return self.model is not None
