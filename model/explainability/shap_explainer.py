"""
SHAP-based Model Explainability

Provides feature importance and prediction explanations using SHAP values.
"""

import logging
import numpy as np
from typing import Dict, List, Optional
import warnings

logger = logging.getLogger(__name__)

# Try to import SHAP, but make it optional
try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False
    logger.warning("SHAP not installed. Explainability features will use fallback method.")


class SHAPExplainer:
    """
    Provides model explainability using SHAP values.
    Falls back to feature importance if SHAP is not available.
    """
    
    def __init__(self, model, feature_names: List[str], background_data: Optional[np.ndarray] = None):
        """
        Initialize SHAP explainer.
        
        Args:
            model: Trained ML model
            feature_names: List of feature names
            background_data: Background dataset for SHAP (optional)
        """
        self.model = model
        self.feature_names = feature_names
        self.explainer = None
        
        if SHAP_AVAILABLE and background_data is not None:
            try:
                # Use TreeExplainer for tree-based models (faster)
                with warnings.catch_warnings():
                    warnings.simplefilter("ignore")
                    self.explainer = shap.TreeExplainer(model, background_data)
                logger.info("SHAP TreeExplainer initialized")
            except Exception as e:
                logger.warning(f"Failed to initialize SHAP: {e}. Using fallback method.")
                self.explainer = None
    
    def explain_prediction(self, input_data: np.ndarray, prediction: float) -> Dict:
        """
        Generate explanation for a single prediction.
        
        Args:
            input_data: Input features (1D array)
            prediction: Model prediction
            
        Returns:
            Dictionary with explanation details
        """
        if self.explainer is not None and SHAP_AVAILABLE:
            return self._explain_with_shap(input_data, prediction)
        else:
            return self._explain_with_feature_importance(input_data, prediction)
    
    def _explain_with_shap(self, input_data: np.ndarray, prediction: float) -> Dict:
        """Generate explanation using SHAP values."""
        try:
            # Calculate SHAP values
            shap_values = self.explainer.shap_values(input_data.reshape(1, -1))
            
            # Handle different SHAP output formats
            if isinstance(shap_values, list):
                shap_values = shap_values[1]  # For binary classification, use positive class
            
            shap_values = shap_values[0]  # Get first (and only) sample
            
            # Get feature contributions
            feature_contributions = []
            for i, (feature_name, shap_value, feature_value) in enumerate(
                zip(self.feature_names, shap_values, input_data)
            ):
                feature_contributions.append({
                    "feature": feature_name,
                    "value": float(feature_value),
                    "contribution": float(shap_value),
                    "abs_contribution": abs(float(shap_value))
                })
            
            # Sort by absolute contribution
            feature_contributions.sort(key=lambda x: x["abs_contribution"], reverse=True)
            
            # Get top 5 features
            top_features = feature_contributions[:5]
            
            # Generate natural language explanation
            explanation_text = self._generate_explanation_text(top_features, prediction)
            
            return {
                "method": "shap",
                "top_features": top_features,
                "all_features": feature_contributions,
                "explanation": explanation_text,
                "base_value": float(self.explainer.expected_value) if hasattr(self.explainer, 'expected_value') else 0.5
            }
            
        except Exception as e:
            logger.error(f"SHAP explanation failed: {e}")
            return self._explain_with_feature_importance(input_data, prediction)
    
    def _explain_with_feature_importance(self, input_data: np.ndarray, prediction: float) -> Dict:
        """Fallback explanation using feature importance."""
        try:
            # Get feature importance from model
            if hasattr(self.model, 'feature_importances_'):
                importances = self.model.feature_importances_
            else:
                # If no feature importance, use uniform weights
                importances = np.ones(len(self.feature_names)) / len(self.feature_names)
            
            # Calculate contributions (importance * feature value)
            feature_contributions = []
            for i, (feature_name, importance, feature_value) in enumerate(
                zip(self.feature_names, importances, input_data)
            ):
                contribution = importance * feature_value
                feature_contributions.append({
                    "feature": feature_name,
                    "value": float(feature_value),
                    "contribution": float(contribution),
                    "abs_contribution": abs(float(contribution)),
                    "importance": float(importance)
                })
            
            # Sort by absolute contribution
            feature_contributions.sort(key=lambda x: x["abs_contribution"], reverse=True)
            
            # Get top 5 features
            top_features = feature_contributions[:5]
            
            # Generate explanation
            explanation_text = self._generate_explanation_text(top_features, prediction)
            
            return {
                "method": "feature_importance",
                "top_features": top_features,
                "all_features": feature_contributions,
                "explanation": explanation_text,
                "base_value": 0.5
            }
            
        except Exception as e:
            logger.error(f"Feature importance explanation failed: {e}")
            return {
                "method": "none",
                "top_features": [],
                "explanation": "Explanation not available",
                "error": str(e)
            }
    
    def _generate_explanation_text(self, top_features: List[Dict], prediction: float) -> str:
        """Generate natural language explanation from top features."""
        if not top_features:
            return "Unable to generate explanation."
        
        # Determine decision
        if prediction > 0.7:
            decision = "approved"
            reason = "primarily due to"
        elif prediction > 0.4:
            decision = "requires review"
            reason = "influenced by"
        else:
            decision = "rejected"
            reason = "primarily due to"
        
        # Get top positive and negative contributors
        positive_features = [f for f in top_features if f["contribution"] > 0][:2]
        negative_features = [f for f in top_features if f["contribution"] < 0][:2]
        
        explanation_parts = [f"Loan {decision}"]
        
        if positive_features:
            positive_names = [self._format_feature_name(f["feature"]) for f in positive_features]
            explanation_parts.append(f"{reason} {' and '.join(positive_names)}")
        
        if negative_features:
            negative_names = [self._format_feature_name(f["feature"]) for f in negative_features]
            explanation_parts.append(f"However, {' and '.join(negative_names)} raised concerns")
        
        return ". ".join(explanation_parts) + "."
    
    def _format_feature_name(self, feature_name: str) -> str:
        """Format feature name for natural language."""
        # Handle one-hot encoded features
        if "_" in feature_name:
            parts = feature_name.split("_")
            if len(parts) == 2:
                return f"{parts[1].lower()} {parts[0].lower()}"
        
        # Convert snake_case to readable format
        return feature_name.replace("_", " ").lower()
    
    def get_feature_importance_chart(self) -> Dict:
        """Get overall feature importance for visualization."""
        if hasattr(self.model, 'feature_importances_'):
            importances = self.model.feature_importances_
            
            feature_importance = [
                {
                    "feature": name,
                    "importance": float(imp)
                }
                for name, imp in zip(self.feature_names, importances)
            ]
            
            # Sort by importance
            feature_importance.sort(key=lambda x: x["importance"], reverse=True)
            
            return {
                "features": feature_importance[:10],  # Top 10
                "method": "model_feature_importance"
            }
        
        return {"features": [], "method": "none"}
