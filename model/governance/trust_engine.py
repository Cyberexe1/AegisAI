"""
Trust Engine Module

Calculates trust scores based on monitoring signals and determines
appropriate governance actions and autonomy levels.
"""

import numpy as np
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from pymongo import MongoClient
import logging

logger = logging.getLogger(__name__)


class TrustEngine:
    """
    Trust scoring and governance decision engine.
    
    Calculates trust scores based on:
    - Data drift severity
    - Model performance degradation
    - Bias metrics
    - Manual override frequency
    """
    
    def __init__(self, mongo_uri: str, database_name: str = "credit_risk_db"):
        """Initialize trust engine with MongoDB connection."""
        self.client = MongoClient(mongo_uri)
        self.db = self.client[database_name]
        
        # Collections
        self.trust_scores = self.db['trust_scores']
        self.governance_logs = self.db['governance_logs']
        self.incidents = self.db['incidents']
        self.drift_logs = self.db['drift_logs']
        self.performance_logs = self.db['model_performance']
        self.predictions = self.db['predictions']
        
        # Load thresholds
        self.thresholds = self._load_thresholds()
        
        logger.info("TrustEngine initialized")
    
    def _load_thresholds(self) -> Dict:
        """Load governance thresholds from configuration."""
        return {
            "drift": {
                "low": 0.1,
                "moderate": 0.2,
                "high": 0.3
            },
            "accuracy_drop": {
                "acceptable": 0.02,
                "concerning": 0.05,
                "critical": 0.10
            },
            "trust_levels": {
                "autonomous": 80,
                "human_on_loop": 60,
                "approval_required": 40,
                "kill_switch": 0
            },
            "weights": {
                "drift_penalty": 30,
                "accuracy_penalty": 25,
                "bias_penalty": 20,
                "override_penalty": 10
            }
        }
    
    def calculate_trust_score(self) -> Dict:
        """
        Calculate trust score based on multiple factors.
        
        Formula: Trust = 100 - (Drift × 30) - (Accuracy Drop × 25) - (Bias × 20) - (Overrides × 10)
        
        Returns:
            Dictionary with trust score, autonomy level, and governance actions
        """
        try:
            # Get latest metrics
            drift_severity = self._get_drift_severity()
            accuracy_drop = self._get_accuracy_drop()
            bias_score = self._get_bias_score()
            manual_overrides = self._get_recent_overrides()
            
            # Calculate penalties
            drift_penalty = self._calculate_drift_penalty(drift_severity)
            accuracy_penalty = self._calculate_accuracy_penalty(accuracy_drop)
            bias_penalty = bias_score * self.thresholds['weights']['bias_penalty']
            override_penalty = manual_overrides * self.thresholds['weights']['override_penalty']
            
            # Calculate trust score
            trust_score = 100 - drift_penalty - accuracy_penalty - bias_penalty - override_penalty
            trust_score = max(0, min(100, trust_score))  # Clamp to [0, 100]
            
            # Determine autonomy level
            autonomy_level = self._determine_autonomy_level(trust_score)
            
            # Check for alerts
            alerts = self._check_alerts(drift_severity, accuracy_drop, trust_score)
            
            # Determine governance action
            governance_action = self._determine_governance_action(trust_score, alerts)
            
            # Get contributing metrics for transparency
            contributing_metrics = self._get_contributing_metrics()
            
            result = {
                "timestamp": datetime.now(),
                "trust_score": round(trust_score, 2),
                "autonomy_level": autonomy_level,
                "risk_factors": {
                    "drift_score": round(drift_penalty, 2),
                    "accuracy_drop": round(accuracy_penalty, 2),
                    "bias_score": round(bias_penalty, 2),
                    "manual_overrides": round(override_penalty, 2)
                },
                "contributing_metrics": {
                    "drift_severity": drift_severity,
                    "accuracy_drop_percent": round(accuracy_drop * 100, 2),
                    "bias_score": round(bias_score, 3),
                    "manual_overrides_count": manual_overrides,
                    **contributing_metrics
                },
                "alerts_triggered": alerts,
                "governance_action": governance_action,
                "explanation": self._generate_explanation(
                    trust_score, autonomy_level, drift_severity, accuracy_drop, alerts
                )
            }
            
            # Log to database
            self.trust_scores.insert_one(result.copy())
            logger.info(f"Trust score calculated: {trust_score:.2f} ({autonomy_level})")
            
            # Log governance action if needed
            if governance_action != "none":
                self._log_governance_event(result)
            
            return result
            
        except Exception as e:
            logger.error(f"Error calculating trust score: {e}")
            return {
                "timestamp": datetime.now(),
                "trust_score": 0,
                "autonomy_level": "kill_switch",
                "error": str(e),
                "governance_action": "kill_switch"
            }
    
    def _get_drift_severity(self) -> str:
        """Get latest drift severity from drift logs."""
        try:
            recent_drift = self.drift_logs.find_one(sort=[("timestamp", -1)])
            
            if not recent_drift:
                return "low"
            
            psi_score = recent_drift.get('psi_score', 0)
            
            if psi_score > self.thresholds['drift']['high']:
                return "high"
            elif psi_score > self.thresholds['drift']['moderate']:
                return "moderate"
            else:
                return "low"
        except Exception as e:
            logger.error(f"Error getting drift severity: {e}")
            return "low"
    
    def _get_accuracy_drop(self) -> float:
        """Calculate accuracy drop from baseline."""
        try:
            baseline_accuracy = 0.95  # From training
            
            recent_perf = self.performance_logs.find_one(sort=[("timestamp", -1)])
            
            if not recent_perf:
                return 0.0
            
            current_accuracy = recent_perf.get('metrics', {}).get('accuracy', baseline_accuracy)
            drop = max(0, baseline_accuracy - current_accuracy)
            
            return drop
        except Exception as e:
            logger.error(f"Error calculating accuracy drop: {e}")
            return 0.0
    
    def _get_bias_score(self) -> float:
        """
        Calculate bias score.
        
        In a production system, this would calculate fairness metrics like:
        - Demographic parity
        - Equal opportunity
        - Equalized odds
        
        For now, returns a simulated low bias score.
        """
        try:
            # Placeholder: In production, calculate actual fairness metrics
            # from prediction data grouped by protected attributes
            return 0.15
        except Exception as e:
            logger.error(f"Error calculating bias score: {e}")
            return 0.5  # Conservative estimate
    
    def _get_recent_overrides(self) -> int:
        """Count manual overrides in last 24 hours."""
        try:
            cutoff = datetime.now() - timedelta(hours=24)
            count = self.governance_logs.count_documents({
                "timestamp": {"$gte": cutoff},
                "event_type": "manual_override"
            })
            return count
        except Exception as e:
            logger.error(f"Error counting overrides: {e}")
            return 0
    
    def _calculate_drift_penalty(self, severity: str) -> float:
        """Calculate penalty from drift severity."""
        penalties = {
            "low": 5,
            "moderate": 15,
            "high": 30
        }
        return penalties.get(severity, 0)
    
    def _calculate_accuracy_penalty(self, drop: float) -> float:
        """Calculate penalty from accuracy drop."""
        if drop < self.thresholds['accuracy_drop']['acceptable']:
            return 0
        elif drop < self.thresholds['accuracy_drop']['concerning']:
            return 10
        elif drop < self.thresholds['accuracy_drop']['critical']:
            return 20
        else:
            return 25
    
    def _determine_autonomy_level(self, trust_score: float) -> str:
        """Determine autonomy level based on trust score."""
        thresholds = self.thresholds['trust_levels']
        
        if trust_score >= thresholds['autonomous']:
            return "fully_autonomous"
        elif trust_score >= thresholds['human_on_loop']:
            return "human-on-loop"
        elif trust_score >= thresholds['approval_required']:
            return "approval_required"
        else:
            return "kill_switch"
    
    def _check_alerts(
        self,
        drift_severity: str,
        accuracy_drop: float,
        trust_score: float
    ) -> List[str]:
        """Check for alert conditions."""
        alerts = []
        
        # Drift alerts
        if drift_severity == "high":
            alerts.append("critical_drift")
        elif drift_severity == "moderate":
            alerts.append("moderate_drift")
        
        # Accuracy alerts
        if accuracy_drop > self.thresholds['accuracy_drop']['critical']:
            alerts.append("critical_accuracy_drop")
        elif accuracy_drop > self.thresholds['accuracy_drop']['concerning']:
            alerts.append("accuracy_degradation")
        
        # Trust score alerts
        if trust_score < self.thresholds['trust_levels']['approval_required']:
            alerts.append("low_trust_score")
        elif trust_score < self.thresholds['trust_levels']['human_on_loop']:
            alerts.append("very_low_trust_score")
        
        return alerts
    
    def _determine_governance_action(self, trust_score: float, alerts: List[str]) -> str:
        """Determine what governance action to take."""
        if "critical_drift" in alerts or "critical_accuracy_drop" in alerts:
            return "kill_switch"
        elif trust_score < self.thresholds['trust_levels']['approval_required']:
            return "require_approval"
        elif trust_score < self.thresholds['trust_levels']['human_on_loop']:
            return "human_review"
        else:
            return "none"
    
    def _get_contributing_metrics(self) -> Dict:
        """Get additional metrics for transparency."""
        try:
            # Get recent prediction stats
            recent_count = self.predictions.count_documents({
                "timestamp": {"$gte": datetime.now() - timedelta(hours=1)}
            })
            
            # Get average confidence
            pipeline = [
                {"$match": {"timestamp": {"$gte": datetime.now() - timedelta(hours=1)}}},
                {"$group": {"_id": None, "avg_confidence": {"$avg": "$confidence_score"}}}
            ]
            result = list(self.predictions.aggregate(pipeline))
            avg_confidence = result[0]['avg_confidence'] if result else 0.0
            
            return {
                "predictions_last_hour": recent_count,
                "avg_confidence": round(avg_confidence, 3)
            }
        except Exception as e:
            logger.error(f"Error getting contributing metrics: {e}")
            return {}
    
    def _generate_explanation(
        self,
        trust_score: float,
        autonomy_level: str,
        drift_severity: str,
        accuracy_drop: float,
        alerts: List[str]
    ) -> str:
        """Generate human-readable explanation of trust score."""
        explanations = []
        
        # Trust level explanation
        if trust_score >= 80:
            explanations.append("Model is operating within normal parameters.")
        elif trust_score >= 60:
            explanations.append("Model performance is acceptable but requires monitoring.")
        elif trust_score >= 40:
            explanations.append("Model performance has degraded. Human approval required for high-risk decisions.")
        else:
            explanations.append("Model performance is critically low. Manual review required.")
        
        # Drift explanation
        if drift_severity == "high":
            explanations.append("Critical data drift detected - input distribution has changed significantly.")
        elif drift_severity == "moderate":
            explanations.append("Moderate data drift detected - input distribution is shifting.")
        
        # Accuracy explanation
        if accuracy_drop > 0.05:
            explanations.append(f"Model accuracy has dropped by {accuracy_drop*100:.1f}%.")
        
        # Alert explanation
        if alerts:
            explanations.append(f"Active alerts: {', '.join(alerts)}.")
        
        return " ".join(explanations)
    
    def _log_governance_event(self, trust_result: Dict):
        """Log governance event when autonomy level changes."""
        try:
            # Get previous trust score
            previous_scores = list(
                self.trust_scores.find().sort("timestamp", -1).limit(2)
            )
            
            if len(previous_scores) > 1:
                previous_level = previous_scores[1].get('autonomy_level')
                new_level = trust_result['autonomy_level']
                
                if previous_level != new_level:
                    event = {
                        "timestamp": datetime.now(),
                        "event_type": "autonomy_change",
                        "previous_level": previous_level,
                        "new_level": new_level,
                        "trigger_reason": ", ".join(trust_result['alerts_triggered']),
                        "trust_score": trust_result['trust_score'],
                        "trust_score_change": trust_result['trust_score'] - previous_scores[1].get('trust_score', 0),
                        "governance_action": trust_result['governance_action']
                    }
                    self.governance_logs.insert_one(event)
                    logger.warning(f"Autonomy level changed: {previous_level} -> {new_level}")
        except Exception as e:
            logger.error(f"Error logging governance event: {e}")
    
    def get_trust_history(self, hours: int = 24) -> List[Dict]:
        """
        Get trust score history.
        
        Args:
            hours: Number of hours to look back
            
        Returns:
            List of trust score entries
        """
        try:
            cutoff = datetime.now() - timedelta(hours=hours)
            
            history = list(self.trust_scores.find({
                "timestamp": {"$gte": cutoff}
            }).sort("timestamp", 1))
            
            # Convert ObjectId and datetime for JSON serialization
            for entry in history:
                entry['_id'] = str(entry['_id'])
                entry['timestamp'] = entry['timestamp'].isoformat()
            
            return history
        except Exception as e:
            logger.error(f"Error retrieving trust history: {e}")
            return []
    
    def get_incidents(self, status: str = "all", limit: int = 50) -> List[Dict]:
        """
        Get governance incidents.
        
        Args:
            status: Filter by status ("all", "open", "resolved")
            limit: Maximum number of incidents to return
            
        Returns:
            List of incident records
        """
        try:
            query = {} if status == "all" else {"status": status}
            
            incidents = list(
                self.incidents.find(query)
                .sort("detected_at", -1)
                .limit(limit)
            )
            
            # Convert ObjectId and datetime for JSON serialization
            for incident in incidents:
                incident['_id'] = str(incident['_id'])
                incident['detected_at'] = incident['detected_at'].isoformat()
                if incident.get('resolved_at'):
                    incident['resolved_at'] = incident['resolved_at'].isoformat()
            
            return incidents
        except Exception as e:
            logger.error(f"Error retrieving incidents: {e}")
            return []
    
    def simulate_drift_incident(self) -> Dict:
        """
        Simulate a drift incident for demo purposes.
        
        Creates a fake high drift event and calculates resulting trust score.
        
        Returns:
            Dictionary with incident and trust result
        """
        try:
            # Create fake high drift log
            fake_drift = {
                "timestamp": datetime.now(),
                "feature": "income",
                "psi_score": 0.35,  # High drift
                "ks_statistic": 0.45,
                "p_value": 0.001,
                "drift_detected": True,
                "severity": "high",
                "distribution_comparison": {
                    "training_mean": 65000,
                    "current_mean": 95000,
                    "mean_difference_percent": 46.2
                },
                "test_type": "simulated"
            }
            self.drift_logs.insert_one(fake_drift)
            logger.info("Simulated drift incident created")
            
            # Recalculate trust
            trust_result = self.calculate_trust_score()
            
            # Create incident record
            incident = {
                "incident_id": f"INC-{datetime.now().strftime('%Y%m%d%H%M%S')}",
                "severity": "high",
                "type": "data_drift",
                "detected_at": datetime.now(),
                "resolved_at": None,
                "status": "open",
                "description": "Income feature drift PSI > 0.3 (simulated)",
                "affected_features": ["income"],
                "actions_taken": [
                    "reduced_autonomy",
                    "notification_sent",
                    "trust_score_recalculated"
                ],
                "resolution_notes": None,
                "trust_score_at_detection": trust_result['trust_score'],
                "autonomy_level": trust_result['autonomy_level']
            }
            self.incidents.insert_one(incident)
            logger.warning(f"Incident created: {incident['incident_id']}")
            
            return {
                "incident": incident,
                "trust_result": trust_result
            }
        except Exception as e:
            logger.error(f"Error simulating incident: {e}")
            return {
                "error": str(e),
                "incident": None,
                "trust_result": None
            }
    
    def resolve_incident(self, incident_id: str, resolution_notes: str) -> Dict:
        """
        Resolve an incident.
        
        Args:
            incident_id: Incident ID to resolve
            resolution_notes: Notes about the resolution
            
        Returns:
            Updated incident record
        """
        try:
            result = self.incidents.update_one(
                {"incident_id": incident_id},
                {
                    "$set": {
                        "status": "resolved",
                        "resolved_at": datetime.now(),
                        "resolution_notes": resolution_notes
                    }
                }
            )
            
            if result.modified_count > 0:
                logger.info(f"Incident resolved: {incident_id}")
                incident = self.incidents.find_one({"incident_id": incident_id})
                incident['_id'] = str(incident['_id'])
                incident['detected_at'] = incident['detected_at'].isoformat()
                incident['resolved_at'] = incident['resolved_at'].isoformat()
                return incident
            else:
                return {"error": "Incident not found"}
        except Exception as e:
            logger.error(f"Error resolving incident: {e}")
            return {"error": str(e)}
    
    def close(self):
        """Close MongoDB connection."""
        if self.client:
            self.client.close()
            logger.info("TrustEngine connection closed")
