"""
Drift Detection Module

Detects data drift using statistical tests:
- Kolmogorov-Smirnov (KS) test
- Population Stability Index (PSI)
"""

import numpy as np
import pandas as pd
from scipy.stats import ks_2samp
from typing import Dict, Tuple, Optional
from datetime import datetime, timedelta
from pymongo import MongoClient
import logging

logger = logging.getLogger(__name__)


class DriftDetector:
    """
    Detects data drift in model inputs using statistical tests.
    """
    
    def __init__(self, mongo_uri: str, database_name: str = "credit_risk_db"):
        """Initialize drift detector with MongoDB connection."""
        self.client = MongoClient(mongo_uri)
        self.db = self.client[database_name]
        self.drift_logs = self.db['drift_logs']
        self.predictions = self.db['predictions']
        
        logger.info("DriftDetector initialized")
    
    def calculate_psi(self, expected: np.ndarray, actual: np.ndarray, bins: int = 10) -> float:
        """
        Calculate Population Stability Index (PSI).
        
        PSI Interpretation:
        - PSI < 0.1: No significant change
        - PSI 0.1-0.2: Moderate change
        - PSI > 0.2: Significant change (drift detected)
        
        Args:
            expected: Training/baseline data
            actual: Current/production data
            bins: Number of bins for histogram
            
        Returns:
            PSI score
        """
        try:
            # Create bins based on expected data
            breakpoints = np.percentile(expected, np.linspace(0, 100, bins + 1))
            breakpoints = np.unique(breakpoints)
            
            if len(breakpoints) < 2:
                logger.warning("Not enough unique values for PSI calculation")
                return 0.0
            
            # Calculate distributions
            expected_percents = np.histogram(expected, bins=breakpoints)[0] / len(expected)
            actual_percents = np.histogram(actual, bins=breakpoints)[0] / len(actual)
            
            # Avoid division by zero
            expected_percents = np.where(expected_percents == 0, 0.0001, expected_percents)
            actual_percents = np.where(actual_percents == 0, 0.0001, actual_percents)
            
            # Calculate PSI
            psi = np.sum((actual_percents - expected_percents) * np.log(actual_percents / expected_percents))
            
            return float(abs(psi))
            
        except Exception as e:
            logger.error(f"Error calculating PSI: {e}")
            return 0.0
    
    def ks_test(
        self,
        training_data: np.ndarray,
        current_data: np.ndarray,
        alpha: float = 0.05
    ) -> Tuple[bool, float, float]:
        """
        Kolmogorov-Smirnov test for distribution drift.
        
        Args:
            training_data: Baseline distribution
            current_data: Current distribution
            alpha: Significance level (default: 0.05)
            
        Returns:
            Tuple of (drift_detected, statistic, p_value)
        """
        try:
            statistic, p_value = ks_2samp(training_data, current_data)
            drift_detected = p_value < alpha
            return drift_detected, float(statistic), float(p_value)
        except Exception as e:
            logger.error(f"Error in KS test: {e}")
            return False, 0.0, 1.0
    
    def check_drift(
        self,
        feature_name: str,
        training_data: np.ndarray,
        current_data: np.ndarray,
        alpha: float = 0.05
    ) -> Dict:
        """
        Check drift for a specific feature using multiple tests.
        
        Args:
            feature_name: Name of the feature
            training_data: Baseline data
            current_data: Current data
            alpha: Significance level
            
        Returns:
            Dictionary with drift detection results
        """
        # KS Test
        drift_detected, ks_stat, p_value = self.ks_test(training_data, current_data, alpha)
        
        # PSI
        psi_score = self.calculate_psi(training_data, current_data)
        
        # Statistical comparison
        comparison = {
            "training_mean": float(np.mean(training_data)),
            "current_mean": float(np.mean(current_data)),
            "training_std": float(np.std(training_data)),
            "current_std": float(np.std(current_data)),
            "mean_difference_percent": float(
                abs(np.mean(current_data) - np.mean(training_data)) / 
                (np.mean(training_data) + 1e-10) * 100
            )
        }
        
        # Determine drift severity
        if psi_score > 0.2 or (drift_detected and ks_stat > 0.3):
            severity = "high"
        elif psi_score > 0.1 or drift_detected:
            severity = "moderate"
        else:
            severity = "low"
        
        # Convert all numpy types to Python native types for JSON serialization
        result = {
            "feature": feature_name,
            "drift_detected": bool(drift_detected or psi_score > 0.2),  # Convert to Python bool
            "severity": severity,
            "ks_statistic": float(ks_stat),
            "p_value": float(p_value),
            "psi_score": float(psi_score),
            "distribution_comparison": comparison,
            "threshold": float(alpha),
            "test_type": "ks_test_and_psi",
            "timestamp": datetime.now()
        }
        
        # Log to MongoDB
        try:
            self.drift_logs.insert_one(result.copy())
            logger.info(f"Drift check logged for feature: {feature_name}")
        except Exception as e:
            logger.error(f"Failed to log drift result: {e}")
        
        return result
    
    def get_recent_predictions_df(self, hours: int = 1) -> pd.DataFrame:
        """
        Get recent predictions as DataFrame.
        
        Args:
            hours: Number of hours to look back
            
        Returns:
            DataFrame with recent prediction inputs
        """
        try:
            cutoff_time = datetime.now() - timedelta(hours=hours)
            
            predictions = list(self.predictions.find({
                "timestamp": {"$gte": cutoff_time}
            }))
            
            if not predictions:
                logger.warning(f"No predictions found in last {hours} hours")
                return pd.DataFrame()
            
            # Extract input features
            data = []
            for pred in predictions:
                input_data = pred.get('input_data', {})
                if input_data:
                    data.append(input_data)
            
            df = pd.DataFrame(data)
            logger.info(f"Retrieved {len(df)} recent predictions")
            return df
            
        except Exception as e:
            logger.error(f"Error retrieving recent predictions: {e}")
            return pd.DataFrame()
    
    def get_drift_history(self, hours: int = 24) -> list:
        """
        Get drift detection history.
        
        Args:
            hours: Number of hours to look back
            
        Returns:
            List of drift detection results
        """
        try:
            cutoff_time = datetime.now() - timedelta(hours=hours)
            
            logs = list(self.drift_logs.find({
                "timestamp": {"$gte": cutoff_time}
            }).sort("timestamp", -1))
            
            # Convert ObjectId and datetime for JSON serialization
            for log in logs:
                log['_id'] = str(log['_id'])
                log['timestamp'] = log['timestamp'].isoformat()
            
            return logs
            
        except Exception as e:
            logger.error(f"Error retrieving drift history: {e}")
            return []
    
    def close(self):
        """Close MongoDB connection."""
        if self.client:
            self.client.close()
            logger.info("DriftDetector connection closed")
