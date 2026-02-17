"""
MongoDB data store for predictions and model metadata.

Handles database operations for storing and retrieving prediction records
and model metadata.
"""

import logging
from datetime import datetime
from typing import Dict, Optional
import time

from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

from schemas import PredictionRecord, ModelMetadata

logger = logging.getLogger(__name__)


class DataStore:
    """
    MongoDB data store for credit risk predictions.
    
    Validates Requirements: 5.1, 5.2, 5.3, 4.1, 1.5, 9.5
    """
    
    def __init__(self, connection_string: str, database_name: str = "credit_risk_db"):
        """
        Initialize MongoDB connection.
        
        Args:
            connection_string: MongoDB connection URI
            database_name: Name of the database to use
        """
        self.connection_string = connection_string
        self.database_name = database_name
        self.client = None
        self.db = None
        self.predictions_collection = None
        self.model_metadata_collection = None
        
        self._connect()
    
    def _connect(self, max_retries: int = 3) -> None:
        """
        Connect to MongoDB with retry logic.
        
        Args:
            max_retries: Maximum number of connection attempts
        """
        for attempt in range(max_retries):
            try:
                self.client = MongoClient(
                    self.connection_string,
                    serverSelectionTimeoutMS=5000
                )
                # Test connection
                self.client.server_info()
                
                self.db = self.client[self.database_name]
                self.predictions_collection = self.db['predictions']
                self.model_metadata_collection = self.db['model_metadata']
                
                # Create indexes
                self._create_indexes()
                
                logger.info(f"Connected to MongoDB: {self.database_name}")
                return
                
            except (ConnectionFailure, ServerSelectionTimeoutError) as e:
                wait_time = 2 ** attempt  # Exponential backoff
                logger.warning(f"Connection attempt {attempt + 1} failed: {e}")
                
                if attempt < max_retries - 1:
                    logger.info(f"Retrying in {wait_time} seconds...")
                    time.sleep(wait_time)
                else:
                    logger.error("Failed to connect to MongoDB after all retries")
                    raise
    
    def _create_indexes(self) -> None:
        """Create database indexes for efficient querying."""
        try:
            # Index on predictions collection
            self.predictions_collection.create_index(
                [("timestamp", DESCENDING)],
                name="timestamp_idx"
            )
            
            # Index on model_metadata collection
            self.model_metadata_collection.create_index(
                [("version", ASCENDING)],
                name="version_idx",
                unique=True
            )
            
            self.model_metadata_collection.create_index(
                [("is_active", ASCENDING)],
                name="is_active_idx"
            )
            
            logger.info("Database indexes created successfully")
            
        except Exception as e:
            logger.warning(f"Failed to create indexes: {e}")
    
    def save_prediction(self, prediction_record: PredictionRecord) -> str:
        """
        Save prediction to database.
        
        Args:
            prediction_record: Prediction record to save
            
        Returns:
            ID of the inserted record
            
        Validates Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6
        """
        try:
            record_dict = {
                "timestamp": prediction_record.timestamp,
                "model_version": prediction_record.model_version,
                "input_data": prediction_record.input_data.model_dump(),
                "approval_probability": prediction_record.approval_probability,
                "risk_category": prediction_record.risk_category,
                "confidence_score": prediction_record.confidence_score,
                "processing_time_ms": prediction_record.processing_time_ms
            }
            
            # Add user_id if provided
            if prediction_record.user_id:
                record_dict["user_id"] = prediction_record.user_id
            
            result = self.predictions_collection.insert_one(record_dict)
            logger.debug(f"Prediction saved with ID: {result.inserted_id}")
            return str(result.inserted_id)
            
        except Exception as e:
            logger.error(f"Failed to save prediction: {e}")
            raise
    
    def save_model_metadata(self, metadata: ModelMetadata) -> None:
        """
        Save model metadata to database.
        
        Args:
            metadata: Model metadata to save
            
        Validates Requirements: 1.5, 7.1, 7.2
        """
        try:
            # Deactivate all existing models
            self.model_metadata_collection.update_many(
                {"is_active": True},
                {"$set": {"is_active": False}}
            )
            
            # Insert new metadata
            metadata_dict = metadata.model_dump()
            self.model_metadata_collection.insert_one(metadata_dict)
            
            logger.info(f"Model metadata saved: {metadata.version}")
            
        except Exception as e:
            logger.error(f"Failed to save model metadata: {e}")
            raise
    
    def get_active_model_version(self) -> Optional[str]:
        """
        Retrieve current active model version.
        
        Returns:
            Active model version or None if not found
            
        Validates Requirements: 7.3
        """
        try:
            result = self.model_metadata_collection.find_one(
                {"is_active": True},
                {"version": 1}
            )
            
            if result:
                return result.get("version")
            return None
            
        except Exception as e:
            logger.error(f"Failed to get active model version: {e}")
            return None
    
    def get_prediction_stats(self) -> Dict:
        """
        Calculate statistics from prediction records.
        
        Returns:
            Dictionary with statistics
            
        Validates Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
        """
        try:
            # Total predictions
            total_predictions = self.predictions_collection.count_documents({})
            
            if total_predictions == 0:
                return {
                    "total_predictions": 0,
                    "risk_distribution": {},
                    "average_approval_probability": 0.0,
                    "average_processing_time_ms": 0.0,
                    "date_range": {"start": None, "end": None}
                }
            
            # Risk distribution
            risk_pipeline = [
                {"$group": {
                    "_id": "$risk_category",
                    "count": {"$sum": 1}
                }}
            ]
            risk_results = list(self.predictions_collection.aggregate(risk_pipeline))
            risk_distribution = {item["_id"]: item["count"] for item in risk_results}
            
            # Average approval probability
            avg_pipeline = [
                {"$group": {
                    "_id": None,
                    "avg_approval": {"$avg": "$approval_probability"},
                    "avg_processing_time": {"$avg": "$processing_time_ms"}
                }}
            ]
            avg_results = list(self.predictions_collection.aggregate(avg_pipeline))
            avg_approval = avg_results[0]["avg_approval"] if avg_results else 0.0
            avg_processing_time = avg_results[0]["avg_processing_time"] if avg_results else 0.0
            
            # Date range
            oldest = self.predictions_collection.find_one(
                {},
                {"timestamp": 1},
                sort=[("timestamp", ASCENDING)]
            )
            newest = self.predictions_collection.find_one(
                {},
                {"timestamp": 1},
                sort=[("timestamp", DESCENDING)]
            )
            
            date_range = {
                "start": oldest["timestamp"] if oldest else None,
                "end": newest["timestamp"] if newest else None
            }
            
            return {
                "total_predictions": total_predictions,
                "risk_distribution": risk_distribution,
                "average_approval_probability": avg_approval,
                "average_processing_time_ms": avg_processing_time,
                "date_range": date_range
            }
            
        except Exception as e:
            logger.error(f"Failed to calculate statistics: {e}")
            raise
    
    def check_connection(self) -> bool:
        """
        Verify database connection is active.
        
        Returns:
            True if connected, False otherwise
        """
        try:
            if self.client is None:
                return False
            self.client.server_info()
            return True
        except Exception as e:
            logger.error(f"Database connection check failed: {e}")
            return False
    
    def close(self) -> None:
        """Close database connection."""
        if self.client:
            self.client.close()
            logger.info("MongoDB connection closed")
