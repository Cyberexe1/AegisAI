# Design Document: ML-Based Credit Risk Prediction Model

## Overview

The ML-Based Credit Risk Prediction Model is a supervised learning system that evaluates loan approval risk using customer financial data. The system consists of three main components: a machine learning model (RandomForest or XGBoost), a FastAPI REST service, and MongoDB for data persistence.

The architecture follows a layered approach:
- **Presentation Layer**: FastAPI REST endpoints with CORS support
- **Business Logic Layer**: ML model inference, risk categorization, validation
- **Data Layer**: MongoDB for predictions and model metadata storage

Key design decisions:
- **RandomForest/XGBoost**: Chosen for their strong performance on tabular data and built-in feature importance
- **FastAPI**: Selected for async support, automatic OpenAPI documentation, and Pydantic integration
- **MongoDB**: Provides flexible schema for predictions and easy aggregation for statistics
- **Joblib/Pickle**: Standard serialization for scikit-learn models

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Applications                      │
│                  (Frontend, Mobile, etc.)                    │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI Service                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   / (root)   │  │   /predict   │  │   /health    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐                                           │
│  │   /stats     │         CORS Middleware                   │
│  └──────────────┘         Pydantic Validation               │
└────────────────────────┬───────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Business Logic Layer                        │
│  ┌────────────────────────────────────────────────────┐    │
│  │           ML Model (RandomForest/XGBoost)          │    │
│  │  - Load serialized model (Joblib/Pickle)          │    │
│  │  - Generate predictions (probability, category)    │    │
│  │  - Calculate confidence scores                     │    │
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Risk Categorization Logic             │    │
│  │  - Map probabilities to Low/Medium/High            │    │
│  └────────────────────────────────────────────────────┘    │
└────────────────────────┬───────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer (MongoDB)                      │
│  ┌────────────────────────┐  ┌────────────────────────┐    │
│  │  predictions collection │  │ model_metadata collection│  │
│  │  - input data          │  │ - version              │    │
│  │  - predictions         │  │ - training_date        │    │
│  │  - timestamp           │  │ - accuracy             │    │
│  │  - processing_time     │  │ - algorithm            │    │
│  │  - model_version       │  │ - feature_names        │    │
│  └────────────────────────┘  └────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  Training Pipeline (Offline)                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │   Load     │→ │   Train    │→ │  Evaluate  │           │
│  │   Data     │  │   Model    │  │  (>95%)    │           │
│  └────────────┘  └────────────┘  └────────────┘           │
│                         │                                    │
│                         ▼                                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Serialize Model (Joblib/Pickle)                   │    │
│  │  Save Model Metadata to MongoDB                    │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. ML Model Component

**Responsibilities:**
- Load trained model from disk
- Generate predictions from customer data
- Provide probability scores and confidence metrics

**Interface:**
```python
class MLModel:
    def load_model(model_path: str) -> None:
        """Load serialized model from disk"""
        
    def predict(customer_data: CustomerData) -> ModelPrediction:
        """
        Generate prediction for customer data
        Returns: ModelPrediction with probability, risk_category, confidence
        """
        
    def get_model_version() -> str:
        """Return current model version"""
        
    def get_feature_importance() -> dict[str, float]:
        """Return feature importance scores"""
```

### 2. Prediction Service Component

**Responsibilities:**
- Handle HTTP requests
- Validate input data
- Coordinate between ML model and data store
- Log predictions
- Calculate and return statistics

**Interface:**
```python
class PredictionService:
    def __init__(ml_model: MLModel, data_store: DataStore):
        """Initialize service with model and database"""
        
    async def predict(customer_data: CustomerData) -> PredictionResponse:
        """
        Process prediction request
        - Validate input
        - Get prediction from model
        - Log to database
        - Return response
        """
        
    async def get_health() -> HealthResponse:
        """Check service and dependencies health"""
        
    async def get_stats() -> StatsResponse:
        """Calculate and return prediction statistics"""
```

### 3. Data Store Component

**Responsibilities:**
- Connect to MongoDB
- Store prediction records
- Store and retrieve model metadata
- Query statistics

**Interface:**
```python
class DataStore:
    def __init__(connection_string: str):
        """Initialize MongoDB connection"""
        
    async def save_prediction(prediction_record: PredictionRecord) -> str:
        """Save prediction to database, return record ID"""
        
    async def save_model_metadata(metadata: ModelMetadata) -> None:
        """Save model metadata"""
        
    async def get_active_model_version() -> str:
        """Retrieve current active model version"""
        
    async def get_prediction_stats() -> dict:
        """Calculate statistics from prediction records"""
        
    async def check_connection() -> bool:
        """Verify database connection is active"""
```

### 4. Training Pipeline Component

**Responsibilities:**
- Load and prepare training data
- Train ML model
- Evaluate model performance
- Serialize trained model
- Store model metadata

**Interface:**
```python
class TrainingPipeline:
    def load_data(data_source: str) -> tuple[DataFrame, DataFrame]:
        """Load and split data into train/test sets"""
        
    def preprocess_data(data: DataFrame) -> DataFrame:
        """Handle missing values, encode categoricals"""
        
    def train_model(X_train: DataFrame, y_train: Series) -> MLModel:
        """Train RandomForest or XGBoost model"""
        
    def evaluate_model(model: MLModel, X_test: DataFrame, y_test: Series) -> dict:
        """Evaluate model and return metrics (accuracy, precision, recall, F1)"""
        
    def serialize_model(model: MLModel, path: str) -> None:
        """Save model to disk using Joblib/Pickle"""
        
    def save_metadata(model: MLModel, metrics: dict, data_store: DataStore) -> None:
        """Store model metadata in database"""
```

## Data Models

### CustomerData (Input)
```python
class CustomerData(BaseModel):
    income: float  # Annual income (positive)
    age: int  # Age in years (18-100)
    loan_amount: float  # Requested loan amount (positive)
    credit_history: str  # e.g., "Good", "Fair", "Poor"
    employment_type: str  # e.g., "Full-time", "Part-time", "Self-employed", "Unemployed"
    existing_debts: float  # Total existing debts (non-negative)
```

### PredictionResponse (Output)
```python
class PredictionResponse(BaseModel):
    approval_probability: float  # 0.0 to 1.0
    risk_category: str  # "Low", "Medium", "High"
    confidence_score: float  # 0.0 to 1.0
    model_version: str
    processing_time_ms: float
```

### PredictionRecord (Database)
```python
class PredictionRecord(BaseModel):
    id: str  # MongoDB ObjectId
    timestamp: datetime
    input_data: CustomerData
    approval_probability: float
    risk_category: str
    confidence_score: float
    model_version: str
    processing_time_ms: float
```

### ModelMetadata (Database)
```python
class ModelMetadata(BaseModel):
    version: str  # e.g., "v1.0.0"
    training_date: datetime
    algorithm: str  # "RandomForest" or "XGBoost"
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    feature_names: list[str]
    feature_importance: dict[str, float]
    is_active: bool
```

### HealthResponse
```python
class HealthResponse(BaseModel):
    status: str  # "healthy" or "unhealthy"
    model_loaded: bool
    database_connected: bool
    model_version: str
```

### StatsResponse
```python
class StatsResponse(BaseModel):
    total_predictions: int
    risk_distribution: dict[str, int]  # {"Low": 100, "Medium": 50, "High": 25}
    average_approval_probability: float
    average_processing_time_ms: float
    date_range: dict[str, datetime]  # {"start": ..., "end": ...}
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.


### Property 1: Model Serialization Round-Trip

*For any* trained ML model, serializing it to disk and then deserializing it should produce a model that generates equivalent predictions for the same input data.

**Validates: Requirements 1.4**

### Property 2: Valid Prediction Output Range

*For any* valid customer data input, the prediction output must satisfy all of the following:
- Approval probability is between 0.0 and 1.0 (inclusive)
- Risk category is one of "Low", "Medium", or "High"
- Confidence score is between 0.0 and 1.0 (inclusive)

**Validates: Requirements 2.1, 2.2, 2.3**

### Property 3: Risk Category Mapping Consistency

*For any* approval probability value:
- If probability > 0.7, then risk category must be "Low"
- If 0.3 ≤ probability ≤ 0.7, then risk category must be "Medium"
- If probability < 0.3, then risk category must be "High"

**Validates: Requirements 2.4, 2.5, 2.6**

### Property 4: Prediction Logging Completeness

*For any* prediction request, the stored prediction record in the database must contain all of the following fields:
- Input customer data (all six features)
- Approval probability
- Risk category
- Confidence score
- Timestamp
- Processing time in milliseconds
- Model version

**Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6**

### Property 5: Input Validation Rejection

*For any* customer data with invalid values, the prediction service must reject the request with HTTP 422 status and a descriptive error message. Invalid values include:
- Negative income
- Age outside range [18, 100]
- Negative loan amount
- Invalid credit_history value
- Invalid employment_type value
- Negative existing_debts

**Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7**

### Property 6: Model Version Uniqueness

*For any* two different trained models, they must be assigned different version identifiers.

**Validates: Requirements 7.1**

### Property 7: Historical Metadata Preservation

*For any* sequence of model training operations, all previously stored model metadata records must remain in the database (no deletion of historical records).

**Validates: Requirements 7.4**

### Property 8: Model Metadata Completeness

*For any* model metadata record stored in the database, it must contain all required fields: version, training_date, algorithm, accuracy, precision, recall, f1_score, feature_names, feature_importance, and is_active.

**Validates: Requirements 1.5**

### Property 9: Feature Presence Validation

*For any* dataset loaded for training, if any required features (income, age, loan_amount, credit_history, employment_type, existing_debts) are missing, the system must detect and report the missing features.

**Validates: Requirements 10.2**

### Property 10: Missing Value Handling

*For any* training dataset containing missing values, the preprocessing pipeline must handle them without raising errors and produce a complete dataset ready for training.

**Validates: Requirements 10.3**

### Property 11: Model Accepts Required Features

*For any* customer data containing all six required features (income, age, loan_amount, credit_history, employment_type, existing_debts), the model must process it and return a prediction without errors.

**Validates: Requirements 1.1**

### Property 12: Response Time Performance

*For any* valid prediction request, the service must respond within 100 milliseconds.

**Validates: Requirements 3.5**

## Error Handling

### Input Validation Errors

**Scenario**: Invalid customer data is submitted to /predict endpoint

**Handling**:
- Pydantic validation catches type mismatches and missing fields
- Custom validators check range constraints (age 18-100, positive values)
- Return HTTP 422 with detailed error message indicating which field(s) failed validation
- Example response:
```json
{
  "detail": [
    {
      "loc": ["body", "age"],
      "msg": "age must be between 18 and 100",
      "type": "value_error"
    }
  ]
}
```

### Model Loading Errors

**Scenario**: Model file is missing or corrupted

**Handling**:
- Catch FileNotFoundError or pickle/joblib deserialization errors during startup
- Log error with details
- Set model_loaded flag to False
- Health endpoint returns HTTP 503 with error details
- Prediction endpoint returns HTTP 503 with message "Model not available"

### Database Connection Errors

**Scenario**: MongoDB is unavailable or connection fails

**Handling**:
- Catch pymongo connection errors
- Retry connection with exponential backoff (3 attempts)
- If all retries fail, set database_connected flag to False
- Health endpoint returns HTTP 503
- Prediction endpoint can still return predictions but logs warning about failed database write
- Stats endpoint returns HTTP 503 if database is unavailable

### Prediction Errors

**Scenario**: Model raises exception during prediction

**Handling**:
- Catch all exceptions during model.predict()
- Log full stack trace with input data (sanitized)
- Return HTTP 500 with generic error message
- Do not expose internal model details to client

### Training Pipeline Errors

**Scenario**: Model training fails to meet accuracy threshold

**Handling**:
- If accuracy < 95%, log warning with actual accuracy
- Do not save model or update metadata
- Raise exception with message indicating training failure
- Suggest hyperparameter tuning or data quality review

**Scenario**: Data loading or preprocessing fails

**Handling**:
- Catch file I/O errors, parsing errors, missing column errors
- Log detailed error message
- Raise exception with actionable message (e.g., "Missing required column: income")

## Testing Strategy

### Dual Testing Approach

The testing strategy employs both unit tests and property-based tests to ensure comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, error conditions, and integration points
- **Property-based tests**: Verify universal properties across randomly generated inputs

Both approaches are complementary and necessary. Unit tests catch concrete bugs and verify specific behaviors, while property-based tests verify general correctness across a wide input space.

### Property-Based Testing

**Library**: Use `hypothesis` for Python property-based testing

**Configuration**:
- Each property test must run minimum 100 iterations
- Each test must include a comment tag referencing the design property
- Tag format: `# Feature: ml-credit-risk-model, Property {number}: {property_text}`

**Property Test Coverage**:
1. **Property 1**: Model serialization round-trip
2. **Property 2**: Valid prediction output range
3. **Property 3**: Risk category mapping consistency
4. **Property 4**: Prediction logging completeness
5. **Property 5**: Input validation rejection
6. **Property 6**: Model version uniqueness
7. **Property 7**: Historical metadata preservation
8. **Property 8**: Model metadata completeness
9. **Property 9**: Feature presence validation
10. **Property 10**: Missing value handling
11. **Property 11**: Model accepts required features
12. **Property 12**: Response time performance

Each correctness property listed above must be implemented as a single property-based test.

### Unit Testing

**Framework**: pytest

**Unit Test Coverage**:

1. **API Endpoint Tests** (specific examples):
   - Test GET / returns service information
   - Test POST /predict with valid data returns 200
   - Test GET /health returns 200 when healthy
   - Test GET /health returns 503 when model not loaded
   - Test GET /health returns 503 when database unavailable
   - Test GET /stats returns all required fields
   - Test CORS headers are present in responses

2. **Database Tests** (specific examples):
   - Test predictions collection exists
   - Test model_metadata collection exists
   - Test timestamp index exists on predictions
   - Test version index exists on model_metadata

3. **Training Pipeline Tests** (specific examples):
   - Test model achieves ≥95% accuracy on test set
   - Test data can be loaded from synthetic source
   - Test data can be loaded from Kaggle dataset
   - Test data is split into train/test sets
   - Test categorical features are encoded
   - Test active model version is stored correctly
   - Test correct model version is loaded for predictions

4. **Edge Cases**:
   - Test health check when model not loaded (503 response)
   - Test empty dataset handling
   - Test dataset with all missing values
   - Test prediction with boundary values (age=18, age=100)

5. **Integration Tests**:
   - Test end-to-end prediction flow (API → Model → Database)
   - Test model loading on service startup
   - Test database connection on service startup

### Test Organization

```
tests/
├── unit/
│   ├── test_ml_model.py
│   ├── test_prediction_service.py
│   ├── test_data_store.py
│   └── test_training_pipeline.py
├── property/
│   ├── test_properties_model.py
│   ├── test_properties_api.py
│   ├── test_properties_validation.py
│   └── test_properties_database.py
├── integration/
│   └── test_end_to_end.py
└── conftest.py  # Shared fixtures
```

### Mocking Strategy

- Mock MongoDB in unit tests using `mongomock` or `pytest-mongo`
- Mock ML model in API tests to isolate service logic
- Use real model in integration tests
- Use in-memory database for integration tests

### Performance Testing

- Measure response time for /predict endpoint (target: <100ms)
- Test with concurrent requests to verify scalability
- Profile model inference time separately from API overhead

### Continuous Integration

- Run all unit tests on every commit
- Run property tests (100 iterations each) on every commit
- Run integration tests on pull requests
- Measure and track test coverage (target: >90%)
