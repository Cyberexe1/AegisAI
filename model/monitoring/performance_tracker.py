"""
Performance Tracking Module

Tracks model performance metrics over time and detects degradation.
"""

import numpy as np
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from pymongo import MongoClient
import logging

logger = logging.getLogger(__name__)


class PerformanceTracker:
    """
    Tracks model performance metrics and detects degradation.
    """
    
    def __init__(self, mongo_uri: str, database_name: str = "credit_risk_db"):
        """Initialize performance tracker with MongoDB connection."""
        self.client = MongoClient(mongo_uri)
        self.db = self.client[database_name]
        self.performance_logs = self.db['model_performance']
        self.predictions = self.db['predictions']
        
        logger.info("PerformanceTracker initialized")
    
    def calculate_metrics(
        self,
        y_true: List,
        y_pred: List,
        y_proba: Optional[List] = None
    ) -> Dict:
        """
        Calculate comprehensive performance metrics.
        
        Args:
            y_true: True labels
            y_pred: Predicted labels
            y_proba: Prediction probabilities (optional)
            
        Returns:
            Dictionary of metrics
        """
        try:
            metrics = {
                "accuracy": float(accuracy_score(y_true, y_pred)),
                "precision": float(precision_score(y_true, y_pred, zero_division=0)),
                "recall": float(recall_score(y_true, y_pred, zero_division=0)),
                "f1_score": float(f1_score(y_true, y_pred, zero_division=0))
            }
            
            # Add AUC-ROC if probabilities provided
            if y_proba is not None:
                try:
                    from sklearn.metrics import roc_auc_score
                    metrics["auc_roc"] = float(roc_auc_score(y_true, y_proba))
                except Exception as e:
                    logger.warning(f"Could not calculate AUC-ROC: {e}")
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error calculating metrics: {e}")
            return {}
    
    def log_performance(
        self,
        metrics: Dict,
        sample_size: int,
        model_version: str = "v1.0.0",
        time_window: str = "1h"
    ):
        """
        Log performance metrics to database.
        
        Args:
            metrics: Performance metrics dictionary
            sample_size: Number of samples evaluated
            model_version: Model version identifier
            time_window: Time window for metrics (e.g., "1h", "24h")
        """
        try:
            log_entry = {
                "timestamp": datetime.now(),
                "model_version": model_version,
                "metrics": metrics,
                "sample_size": sample_size,
                "time_window": time_window
            }
            
            self.performance_logs.insert_one(log_entry)
            logger.info(f"Performance logged: {metrics.get('accuracy', 0):.4f} accuracy")
            
        except Exception as e:
            logger.error(f"Failed to log performance: {e}")
    
    def get_performance_trend(self, hours: int = 24) -> List[Dict]:
        """
        Get performance trend over time.
        
        Args:
            hours: Number of hours to look back
            
        Returns:
            List of performance log entries
        """
        try:
            cutoff_time = datetime.now() - timedelta(hours=hours)
            
            logs = list(self.performance_logs.find({
                "timestamp": {"$gte": cutoff_time}
            }).sort("timestamp", 1))
            
            # Convert ObjectId and datetime for JSON serialization
            for log in logs:
                log['_id'] = str(log['_id'])
                log['timestamp'] = log['timestamp'].isoformat()
            
            logger.info(f"Retrieved {len(logs)} performance logs")
            return logs
            
        except Exception as e:
            logger.error(f"Error retrieving performance trend: {e}")
            return []
    
    def check_degradation(
        self,
        baseline_accuracy: float = 0.95,
        threshold: float = 0.05
    ) -> Dict:
        """
        Check if model performance has degraded.
        
        Args:
            baseline_accuracy: Expected baseline accuracy
            threshold: Acceptable drop threshold
            
        Returns:
            Dictionary with degradation status
        """
        try:
            recent_logs = self.get_performance_trend(hours=1)
            
            if not recent_logs:
                return {
                    "degraded": False,
                    "message": "No recent performance data available",
                    "baseline_accuracy": baseline_accuracy
                }
            
            latest_accuracy = recent_logs[-1]['metrics'].get('accuracy', 0)
            drop = baseline_accuracy - latest_accuracy
            
            return {
                "degraded": drop > threshold,
                "baseline_accuracy": baseline_accuracy,
                "current_accuracy": latest_accuracy,
                "drop": drop,
                "drop_percentage": drop * 100,
                "threshold": threshold,
                "timestamp": recent_logs[-1]['timestamp'],
                "message": "Performance degraded" if drop > threshold else "Performance stable"
            }
            
        except Exception as e:
            logger.error(f"Error checking degradation: {e}")
            return {
                "degraded": False,
                "message": f"Error: {str(e)}",
                "baseline_accuracy": baseline_accuracy
            }
    
    def get_average_confidence(self, hours: int = 1) -> float:
        """
        Get average confidence score from recent predictions.
        
        Args:
            hours: Number of hours to look back
            
        Returns:
            Average confidence score
        """
        try:
            cutoff_time = datetime.now() - timedelta(hours=hours)
            
            predictions = list(self.predictions.find({
                "timestamp": {"$gte": cutoff_time}
            }))
            
            if not predictions:
                return 0.0
            
            confidences = [p.get('confidence_score', 0) for p in predictions]
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0
            
            return float(avg_confidence)
            
        except Exception as e:
            logger.error(f"Error calculating average confidence: {e}")
            return 0.0
    
    def get_risk_distribution(self, hours: int = 24) -> Dict:
        """
        Get distribution of risk categories.
        
        Args:
            hours: Number of hours to look back
            
        Returns:
            Dictionary with risk category counts
        """
        try:
            cutoff_time = datetime.now() - timedelta(hours=hours)
            
            pipeline = [
                {"$match": {"timestamp": {"$gte": cutoff_time}}},
                {"$group": {
                    "_id": "$risk_category",
                    "count": {"$sum": 1}
                }}
            ]
            
            results = list(self.predictions.aggregate(pipeline))
            distribution = {item["_id"]: item["count"] for item in results}
            
            return distribution
            
        except Exception as e:
            logger.error(f"Error getting risk distribution: {e}")
            return {}
    
    def close(self):
        """Close MongoDB connection."""
        if self.client:
            self.client.close()
            logger.info("PerformanceTracker connection closed")
