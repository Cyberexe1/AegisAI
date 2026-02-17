"""
Training script for credit risk prediction model.

CLI tool to train and save ML models.
"""

import argparse
import logging
from datetime import datetime
from pathlib import Path

from training import train_and_save_model
from config import settings
from data_store import DataStore
from schemas import ModelMetadata

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def main():
    """Main training function."""
    parser = argparse.ArgumentParser(description="Train credit risk prediction model")
    parser.add_argument(
        "--data",
        type=str,
        default=None,
        help="Path to training data CSV (default: generate synthetic data)"
    )
    parser.add_argument(
        "--algorithm",
        type=str,
        choices=["RandomForest", "XGBoost"],
        default=settings.MODEL_ALGORITHM,
        help="ML algorithm to use"
    )
    parser.add_argument(
        "--output",
        type=str,
        default="model/trained_models",
        help="Output directory for trained model"
    )
    parser.add_argument(
        "--test-size",
        type=float,
        default=settings.TEST_SIZE,
        help="Proportion of data for testing"
    )
    parser.add_argument(
        "--min-accuracy",
        type=float,
        default=settings.MIN_ACCURACY_THRESHOLD,
        help="Minimum required accuracy"
    )
    parser.add_argument(
        "--no-db",
        action="store_true",
        help="Skip saving metadata to database"
    )
    
    args = parser.parse_args()
    
    logger.info("=" * 60)
    logger.info("CREDIT RISK MODEL TRAINING")
    logger.info("=" * 60)
    logger.info(f"Algorithm: {args.algorithm}")
    logger.info(f"Data source: {'Synthetic' if args.data is None else args.data}")
    logger.info(f"Output directory: {args.output}")
    logger.info(f"Test size: {args.test_size}")
    logger.info(f"Min accuracy threshold: {args.min_accuracy}")
    logger.info("=" * 60)
    
    try:
        # Train model
        model, metrics, model_path, version, feature_importance = train_and_save_model(
            data_path=args.data,
            output_dir=args.output,
            algorithm=args.algorithm,
            test_size=args.test_size,
            random_state=settings.RANDOM_STATE,
            min_accuracy=args.min_accuracy
        )
        
        logger.info("=" * 60)
        logger.info("TRAINING COMPLETED SUCCESSFULLY")
        logger.info("=" * 60)
        logger.info(f"Model saved: {model_path}")
        logger.info(f"Model version: {version}")
        logger.info(f"Accuracy: {metrics['accuracy']:.4f}")
        
        # Save metadata to database
        if not args.no_db:
            try:
                logger.info("Saving metadata to database...")
                data_store = DataStore(settings.MONGODB_URI, settings.MONGODB_DATABASE)
                
                metadata = ModelMetadata(
                    version=version,
                    training_date=datetime.now(),
                    algorithm=args.algorithm,
                    accuracy=metrics['accuracy'],
                    precision=metrics['precision'],
                    recall=metrics['recall'],
                    f1_score=metrics['f1_score'],
                    feature_names=list(feature_importance.keys()),
                    feature_importance=feature_importance,
                    is_active=True
                )
                
                data_store.save_model_metadata(metadata)
                data_store.close()
                
                logger.info("Metadata saved to database")
                
            except Exception as e:
                logger.warning(f"Failed to save metadata to database: {e}")
                logger.warning("Model is trained but metadata not saved")
        
        logger.info("=" * 60)
        logger.info("NEXT STEPS:")
        logger.info(f"1. Update MODEL_PATH in .env to: {model_path}")
        logger.info("2. Start the API server: python main.py")
        logger.info("3. Test the API: curl http://localhost:8000/health")
        logger.info("=" * 60)
        
    except Exception as e:
        logger.error(f"Training failed: {e}", exc_info=True)
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main())
