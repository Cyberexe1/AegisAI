# Model Package

This directory contains all model-related components for the ML Credit Risk Prediction system.

## Structure

```
model/
├── __init__.py           # Package initialization
├── schemas.py            # Pydantic data models (API request/response)
├── ml_model.py          # ML model wrapper class
├── data_store.py        # MongoDB data store
├── training.py          # Training pipeline
├── config.py            # Configuration management
├── main.py              # FastAPI server (API entry point)
├── train.py             # Training script (CLI tool)
├── data/                # Training and test data
├── kaggle_dataset/      # Kaggle loan prediction dataset
├── trained_models/      # Saved model files (.joblib)
├── tests/               # Test suites
│   ├── unit/           # Unit tests
│   ├── property/       # Property-based tests
│   └── integration/    # Integration tests
├── src/                 # Additional source files
└── README.md            # This file
```

## Components

### schemas.py
Pydantic models for:
- `CustomerData` - Input validation
- `PredictionResponse` - API response
- `HealthResponse` - Health check response
- `StatsResponse` - Statistics response
- `PredictionRecord` - Database record
- `ModelMetadata` - Model metadata

### ml_model.py
ML model wrapper that:
- Loads trained models from disk
- Generates predictions
- Maps probabilities to risk categories
- Provides feature importance

### data_store.py
MongoDB data store that:
- Saves predictions
- Saves model metadata
- Retrieves active model version
- Calculates statistics

### training.py
Training pipeline that:
- Loads and prepares data
- Trains RandomForest/XGBoost models
- Evaluates model performance
- Serializes models
- Saves metadata

### config.py
Configuration management using Pydantic Settings for:
- MongoDB connection
- Model paths
- API settings
- CORS configuration
- Training parameters

## Usage

```python
from schemas import CustomerData, PredictionResponse
from ml_model import MLModel
from data_store import DataStore
from config import Settings

# Load configuration
config = Settings()

# Initialize components
model = MLModel(config.MODEL_PATH)
data_store = DataStore(config.MONGODB_URI)

# Make prediction
customer = CustomerData(
    income=75000,
    age=35,
    loan_amount=200000,
    credit_history="Good",
    employment_type="Full-time",
    existing_debts=15000
)
prediction = model.predict(customer)
```

## Running the API Server

```bash
cd model
# Ensure .env is configured
python main.py
```

## Training a New Model

```bash
cd model
# Ensure .env is configured
python train.py --algorithm RandomForest
```

## Configuration

The model package uses environment variables for configuration. Copy `.env.example` to `.env` and update as needed:

```bash
cd model
cp .env.example .env
```

Key configuration options:
- `MONGODB_URI` - MongoDB connection string
- `MODEL_PATH` - Path to trained model file
- `API_PORT` - FastAPI server port (default: 8000)
- `MODEL_ALGORITHM` - RandomForest or XGBoost
