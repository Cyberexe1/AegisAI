"""
System Health Monitoring Module

Monitors system resources and API performance.
"""

import psutil
import time
from typing import Dict
from datetime import datetime, timedelta
from pymongo import MongoClient
import logging

logger = logging.getLogger(__name__)


class SystemHealthMonitor:
    """
    Monitors system health metrics including CPU, memory, and API performance.
    """
    
    def __init__(self, mongo_uri: str, database_name: str = "credit_risk_db"):
        """Initialize system health monitor with MongoDB connection."""
        self.client = MongoClient(mongo_uri)
        self.db = self.client[database_name]
        self.health_logs = self.db['system_health']
        self.predictions = self.db['predictions']
        self.start_time = time.time()
        
        logger.info("SystemHealthMonitor initialized")
    
    def get_health_metrics(self) -> Dict:
        """
        Collect comprehensive system health metrics.
        
        Returns:
            Dictionary with health metrics
        """
        try:
            # Get recent predictions for API metrics
            recent_preds = list(self.predictions.find().sort("timestamp", -1).limit(100))
            
            # Calculate API metrics
            if recent_preds:
                response_times = [
                    p.get('processing_time_ms', 0) 
                    for p in recent_preds
                ]
                confidences = [
                    p.get('confidence_score', 0) 
                    for p in recent_preds
                ]
                
                avg_response_time = sum(response_times) / len(response_times) if response_times else 0
                avg_confidence = sum(confidences) / len(confidences) if confidences else 0
            else:
                avg_response_time = 0
                avg_confidence = 0
            
            # System metrics
            cpu_percent = psutil.cpu_percent(interval=0.1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            # Calculate predictions per minute
            one_min_ago = datetime.now() - timedelta(minutes=1)
            recent_count = self.predictions.count_documents({
                "timestamp": {"$gte": one_min_ago}
            })
            
            health = {
                "timestamp": datetime.now(),
                "api_metrics": {
                    "avg_response_time_ms": round(avg_response_time, 2),
                    "avg_confidence": round(avg_confidence, 3),
                    "predictions_last_100": len(recent_preds),
                    "predictions_per_minute": recent_count
                },
                "system_metrics": {
                    "cpu_usage_percent": round(cpu_percent, 2),
                    "memory_usage_mb": round(memory.used / 1024 / 1024, 2),
                    "memory_percent": round(memory.percent, 2),
                    "memory_available_mb": round(memory.available / 1024 / 1024, 2),
                    "disk_usage_percent": round(disk.percent, 2),
                    "disk_free_gb": round(disk.free / 1024 / 1024 / 1024, 2)
                },
                "uptime_seconds": round(time.time() - self.start_time, 2)
            }
            
            # Log to database
            self.health_logs.insert_one(health.copy())
            
            return health
            
        except Exception as e:
            logger.error(f"Error collecting health metrics: {e}")
            return {
                "timestamp": datetime.now(),
                "error": str(e),
                "api_metrics": {},
                "system_metrics": {}
            }
    
    def get_health_history(self, hours: int = 24) -> list:
        """
        Get system health history.
        
        Args:
            hours: Number of hours to look back
            
        Returns:
            List of health log entries
        """
        try:
            cutoff_time = datetime.now() - timedelta(hours=hours)
            
            logs = list(self.health_logs.find({
                "timestamp": {"$gte": cutoff_time}
            }).sort("timestamp", 1))
            
            # Convert ObjectId and datetime for JSON serialization
            for log in logs:
                log['_id'] = str(log['_id'])
                log['timestamp'] = log['timestamp'].isoformat()
            
            return logs
            
        except Exception as e:
            logger.error(f"Error retrieving health history: {e}")
            return []
    
    def check_system_alerts(self) -> Dict:
        """
        Check for system health alerts.
        
        Returns:
            Dictionary with alert status
        """
        try:
            health = self.get_health_metrics()
            alerts = []
            
            # Check CPU usage
            cpu_usage = health['system_metrics'].get('cpu_usage_percent', 0)
            if cpu_usage > 80:
                alerts.append({
                    "type": "cpu",
                    "severity": "high" if cpu_usage > 90 else "medium",
                    "message": f"High CPU usage: {cpu_usage}%"
                })
            
            # Check memory usage
            memory_percent = health['system_metrics'].get('memory_percent', 0)
            if memory_percent > 80:
                alerts.append({
                    "type": "memory",
                    "severity": "high" if memory_percent > 90 else "medium",
                    "message": f"High memory usage: {memory_percent}%"
                })
            
            # Check disk usage
            disk_percent = health['system_metrics'].get('disk_usage_percent', 0)
            if disk_percent > 80:
                alerts.append({
                    "type": "disk",
                    "severity": "high" if disk_percent > 90 else "medium",
                    "message": f"High disk usage: {disk_percent}%"
                })
            
            # Check response time
            avg_response = health['api_metrics'].get('avg_response_time_ms', 0)
            if avg_response > 100:
                alerts.append({
                    "type": "performance",
                    "severity": "medium",
                    "message": f"Slow response time: {avg_response}ms"
                })
            
            return {
                "has_alerts": len(alerts) > 0,
                "alert_count": len(alerts),
                "alerts": alerts,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error checking system alerts: {e}")
            return {
                "has_alerts": False,
                "alert_count": 0,
                "alerts": [],
                "error": str(e)
            }
    
    def close(self):
        """Close MongoDB connection."""
        if self.client:
            self.client.close()
            logger.info("SystemHealthMonitor connection closed")
