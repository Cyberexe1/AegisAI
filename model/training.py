"""
Training pipeline for credit risk prediction model.

Handles data preparation, model training, evaluation, and serialization.
"""

import pandas as pd
import numpy as np
import joblib
import logging
from datetime import datetime
from pathlib import Path
from typing import Tuple, Dict
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from xgboost import XGBClassifier

logger = logging.getLogger(__name__)


def generate_synthetic_data(n_samples: int = 10000, random_state: int = 42) -> pd.DataFrame:
    """
    Generate synthetic credit risk data.
    
    Args:
        n_samples: Number of samples to generate
        random_state: Random seed for reproducibility
        
    Returns:
        DataFrame with synthetic data
        
    Validates Requirements: 10.1
    """
    np.random.seed(random_state)
    
    data = pd.DataFrame({
        'income': np.random.normal(65000, 25000, n_samples).clip(min=20000),
        'age': np.random.randint(21, 65, n_samples),
        'loan_amount': np.random.normal(150000, 75000, n_samples).clip(min=10000),
        'credit_history': np.random.choice(['Good', 'Fair', 'Poor'], n_samples, p=[0.5, 0.3, 0.2]),
        'employment_type': np.random.choice(
            ['Full-time', 'Part-time', 'Self-employed', 'Unemployed'],
            n_samples,
            p=[0.6, 0.2, 0.15, 0.05]
        ),
        'existing_debts': np.random.normal(20000, 15000, n_samples).clip(min=0)
    })
    
    # Create target variable (1 = approved, 0 = rejected)
    # Logic: Good credit + reasonable income + manageable debt = approval
    credit_score_map = {'Good': 750, 'Fair': 650, 'Poor': 550}
    data['credit_score'] = data['credit_history'].map(credit_score_map)
    
    data['approved'] = (
        (data['credit_score'] > 650) &
        (data['income'] > 40000) &
        (data['existing_debts'] < data['income'] * 0.4) &
        (data['loan_amount'] < data['income'] * 4)
    ).astype(int)
    
    data = data.drop('credit_score', axis=1)
    
    logger.info(f"Generated {n_samples} synthetic samples")
    logger.info(f"Approval rate: {data['approved'].mean():.2%}")
    
    return data


def load_data(data_path: str = None, use_synthetic: bool = True, n_samples: int = 10000) -> pd.DataFrame:
    """
    Load training data from CSV or generate synthetic data.
    
    Args:
        data_path: Path to CSV file (optional)
        use_synthetic: Whether to generate synthetic data
        n_samples: Number of synthetic samples to generate
        
    Returns:
        DataFrame with training data
        
    Validates Requirements: 10.1, 10.2
    """
    if use_synthetic or data_path is None:
        return generate_synthetic_data(n_samples=n_samples)
    
    try:
        data = pd.read_csv(data_path)
        logger.info(f"Loaded data from {data_path}: {len(data)} samples")
        return data
    except Exception as e:
        logger.error(f"Failed to load data from {data_path}: {e}")
        logger.info("Falling back to synthetic data generation")
        return generate_synthetic_data(n_samples=n_samples)


def preprocess_data(data: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
    """
    Preprocess data for model training.
    
    Args:
        data: Raw data DataFrame
        
    Returns:
        Tuple of (features DataFrame, target Series)
        
    Validates Requirements: 10.2, 10.3, 10.4, 10.5
    """
    # Check for required features
    required_features = ['income', 'age', 'loan_amount', 'credit_history', 'employment_type', 'existing_debts']
    missing_features = [f for f in required_features if f not in data.columns]
    
    if missing_features:
        raise ValueError(f"Missing required features: {missing_features}")
    
    # Handle missing values
    data = data.fillna({
        'income': data['income'].median(),
        'age': data['age'].median(),
        'loan_amount': data['loan_amount'].median(),
        'existing_debts': data['existing_debts'].median(),
        'credit_history': 'Fair',
        'employment_type': 'Full-time'
    })
    
    # Encode categorical features
    credit_history_map = {'Good': 2, 'Fair': 1, 'Poor': 0}
    employment_type_map = {
        'Full-time': 3,
        'Part-time': 2,
        'Self-employed': 1,
        'Unemployed': 0
    }
    
    data['credit_history_encoded'] = data['credit_history'].map(credit_history_map)
    data['employment_type_encoded'] = data['employment_type'].map(employment_type_map)
    
    # Select features
    feature_cols = ['income', 'age', 'loan_amount', 'credit_history_encoded', 
                    'employment_type_encoded', 'existing_debts']
    X = data[feature_cols]
    y = data['approved']
    
    logger.info(f"Preprocessed data: {len(X)} samples, {len(feature_cols)} features")
    
    return X, y


def train_model(
    X_train: pd.DataFrame,
    y_train: pd.Series,
    algorithm: str = "RandomForest",
    **kwargs
) -> object:
    """
    Train ML model.
    
    Args:
        X_train: Training features
        y_train: Training labels
        algorithm: "RandomForest" or "XGBoost"
        **kwargs: Additional hyperparameters
        
    Returns:
        Trained model
        
    Validates Requirements: 1.2, 1.3
    """
    logger.info(f"Training {algorithm} model...")
    
    if algorithm == "RandomForest":
        model = RandomForestClassifier(
            n_estimators=kwargs.get('n_estimators', 100),
            max_depth=kwargs.get('max_depth', 10),
            min_samples_split=kwargs.get('min_samples_split', 5),
            random_state=kwargs.get('random_state', 42),
            n_jobs=-1
        )
    elif algorithm == "XGBoost":
        model = XGBClassifier(
            n_estimators=kwargs.get('n_estimators', 100),
            max_depth=kwargs.get('max_depth', 6),
            learning_rate=kwargs.get('learning_rate', 0.1),
            random_state=kwargs.get('random_state', 42),
            n_jobs=-1
        )
    else:
        raise ValueError(f"Unknown algorithm: {algorithm}")
    
    model.fit(X_train, y_train)
    logger.info("Model training completed")
    
    return model


def evaluate_model(model: object, X_test: pd.DataFrame, y_test: pd.Series) -> Dict[str, float]:
    """
    Evaluate model performance.
    
    Args:
        model: Trained model
        X_test: Test features
        y_test: Test labels
        
    Returns:
        Dictionary of evaluation metrics
        
    Validates Requirements: 1.2
    """
    y_pred = model.predict(X_test)
    
    metrics = {
        'accuracy': accuracy_score(y_test, y_pred),
        'precision': precision_score(y_test, y_pred, zero_division=0),
        'recall': recall_score(y_test, y_pred, zero_division=0),
        'f1_score': f1_score(y_test, y_pred, zero_division=0)
    }
    
    logger.info("=== MODEL PERFORMANCE ===")
    logger.info(f"Accuracy:  {metrics['accuracy']:.4f}")
    logger.info(f"Precision: {metrics['precision']:.4f}")
    logger.info(f"Recall:    {metrics['recall']:.4f}")
    logger.info(f"F1 Score:  {metrics['f1_score']:.4f}")
    
    return metrics


def serialize_model(model: object, output_path: str) -> None:
    """
    Save model to disk using joblib.
    
    Args:
        model: Trained model
        output_path: Path to save model
        
    Validates Requirements: 1.4
    """
    output_file = Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    joblib.dump(model, output_path)
    logger.info(f"Model saved to {output_path}")


def train_and_save_model(
    data_path: str = None,
    output_dir: str = "model/trained_models",
    algorithm: str = "RandomForest",
    test_size: float = 0.2,
    random_state: int = 42,
    min_accuracy: float = 0.95
) -> Tuple[object, Dict[str, float], str]:
    """
    Complete training pipeline.
    
    Args:
        data_path: Path to training data CSV (None for synthetic)
        output_dir: Directory to save model
        algorithm: "RandomForest" or "XGBoost"
        test_size: Proportion of data for testing
        random_state: Random seed
        min_accuracy: Minimum required accuracy
        
    Returns:
        Tuple of (model, metrics, model_path)
        
    Raises:
        ValueError: If accuracy is below threshold
    """
    # Load and preprocess data
    data = load_data(data_path, use_synthetic=(data_path is None))
    X, y = preprocess_data(data)
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )
    
    logger.info(f"Train size: {len(X_train)}, Test size: {len(X_test)}")
    
    # Train model
    model = train_model(X_train, y_train, algorithm=algorithm, random_state=random_state)
    
    # Evaluate model
    metrics = evaluate_model(model, X_test, y_test)
    
    # Check accuracy threshold
    if metrics['accuracy'] < min_accuracy:
        logger.warning(f"Model accuracy {metrics['accuracy']:.4f} is below threshold {min_accuracy}")
        logger.warning("Consider hyperparameter tuning or data quality review")
    
    # Generate version and save model
    version = f"v{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    model_filename = f"credit_risk_model_{version}.joblib"
    model_path = Path(output_dir) / model_filename
    
    serialize_model(model, str(model_path))
    
    # Get feature importance
    feature_names = ['income', 'age', 'loan_amount', 'credit_history_encoded',
                     'employment_type_encoded', 'existing_debts']
    feature_importance = dict(zip(feature_names, model.feature_importances_.tolist()))
    
    logger.info(f"Model version: {version}")
    logger.info("Training pipeline completed successfully")
    
    return model, metrics, str(model_path), version, feature_importance
