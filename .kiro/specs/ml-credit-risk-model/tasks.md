# Implementation Plan: ML-Based Credit Risk Prediction Model

## Overview

This implementation plan breaks down the ML-based credit risk prediction system into discrete coding tasks. The system will be built using Python 3.9+, FastAPI, MongoDB, scikit-learn/XGBoost, and pytest/hypothesis for testing. The implementation follows a bottom-up approach: data models → ML model → database layer → API service → training pipeline → integration.

## Tasks

- [x] 1. Set up project structure and dependencies
  - Create directory structure: `src/`, `tests/unit/`, `tests/property/`, `tests/integration/`, `models/`, `data/`
  - Create `requirements.txt` with dependencies: fastapi, uvicorn, pydantic, pymongo, pandas, numpy, scikit-learn, xgboost, joblib, pytest, hypothesis, mongomock
  - Create `pyproject.toml` or `setup.py` for package configuration
  - Create `.env.example` for configuration template
  - _Requirements: All_

- [ ] 2. Implement core data models
  - [x] 2.1 Create Pydantic models for API
    - Implement `CustomerData` model with validation (income > 0, 18 ≤ age ≤ 100, loan_amount > 0, existing_debts ≥ 0)
    - Implement `PredictionResponse` model
    - Implement `HealthResponse` model
    - Implement `StatsResponse` model
    - Add custom validators for credit_history and employment_type enums
    - _Requirements: 2.1, 2.2, 2.3, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  
  - [ ]* 2.2 Write property test for input validation
    - **Property 5: Input Validation Rejection**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7**
    - Use hypothesis to generate invalid customer data and verify 422 responses
  
  - [x] 2.3 Create database models
    - Implement `PredictionRecord` dataclass/model
    - Implement `ModelMetadata` dataclass/model
    - Add serialization methods (to_dict, from_dict)
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.6, 1.5_

- [ ] 3. Implement data store component
  - [ ] 3.1 Create MongoDB data store class
    - Implement `DataStore` class with async MongoDB connection
    - Implement `save_prediction()` method
    - Implement `save_model_metadata()` method
    - Implement `get_active_model_version()` method
    - Implement `get_prediction_stats()` method with aggregation pipeline
    - Implement `check_connection()` method
    - Add connection retry logic with exponential backoff
    - _Requirements: 5.1, 5.2, 5.3, 4.1, 1.5, 9.5_
  
  - [ ] 3.2 Create database indexes
    - Create timestamp index on predictions collection
    - Create version index on model_metadata collection
    - _Requirements: 5.4, 5.5_
  
  - [ ]* 3.3 Write unit tests for data store
    - Test save_prediction with mongomock
    - Test save_model_metadata
    - Test get_active_model_version
    - Test get_prediction_stats aggregation
    - Test connection retry logic
    - _Requirements: 5.2, 5.3, 5.4, 5.5_
  
  - [ ]* 3.4 Write property test for prediction logging
    - **Property 4: Prediction Logging Completeness**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6**
    - Generate random predictions and verify all fields are stored

- [ ] 4. Checkpoint - Ensure data layer tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement ML model component
  - [ ] 5.1 Create ML model wrapper class
    - Implement `MLModel` class
    - Implement `load_model()` method using joblib
    - Implement `predict()` method that returns probability, risk_category, confidence
    - Implement risk category mapping logic (>0.7=Low, 0.3-0.7=Medium, <0.3=High)
    - Implement `get_model_version()` method
    - Implement `get_feature_importance()` method
    - Add error handling for model loading and prediction
    - _Requirements: 1.1, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  
  - [ ]* 5.2 Write property test for valid prediction output
    - **Property 2: Valid Prediction Output Range**
    - **Validates: Requirements 2.1, 2.2, 2.3**
    - Generate random customer data and verify output ranges
  
  - [ ]* 5.3 Write property test for risk category mapping
    - **Property 3: Risk Category Mapping Consistency**
    - **Validates: Requirements 2.4, 2.5, 2.6**
    - Generate random probabilities and verify correct category assignment
  
  - [ ]* 5.4 Write property test for model accepts required features
    - **Property 11: Model Accepts Required Features**
    - **Validates: Requirements 1.1**
    - Generate random valid customer data and verify model processes without errors

- [ ] 6. Implement training pipeline
  - [ ] 6.1 Create data preparation module
    - Implement `load_data()` function supporting synthetic generation and CSV loading
    - Implement synthetic data generator with realistic distributions
    - Implement `preprocess_data()` function for missing value handling
    - Implement categorical encoding (LabelEncoder or OneHotEncoder)
    - Implement train/test split (80/20)
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [ ] 6.2 Create model training script
    - Implement `train_model()` function with RandomForest and XGBoost options
    - Implement hyperparameter tuning (GridSearchCV or RandomizedSearchCV)
    - Implement `evaluate_model()` function calculating accuracy, precision, recall, F1
    - Add logic to verify accuracy ≥ 95%
    - Implement `serialize_model()` function using joblib
    - Implement `save_metadata()` function to store model info in MongoDB
    - Generate unique version identifier (timestamp-based or semantic versioning)
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 7.1, 7.2_
  
  - [ ]* 6.3 Write unit tests for training pipeline
    - Test synthetic data generation produces valid data
    - Test data loading from CSV
    - Test preprocessing handles missing values
    - Test categorical encoding
    - Test train/test split ratios
    - Test model achieves ≥95% accuracy on test data
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 1.2_
  
  - [ ]* 6.4 Write property test for model serialization
    - **Property 1: Model Serialization Round-Trip**
    - **Validates: Requirements 1.4**
    - Train model, serialize, deserialize, verify equivalent predictions
  
  - [ ]* 6.5 Write property test for feature presence validation
    - **Property 9: Feature Presence Validation**
    - **Validates: Requirements 10.2**
    - Generate datasets with missing features and verify detection
  
  - [ ]* 6.6 Write property test for missing value handling
    - **Property 10: Missing Value Handling**
    - **Validates: Requirements 10.3**
    - Generate datasets with missing values and verify preprocessing succeeds

- [ ] 7. Checkpoint - Ensure training pipeline works
  - Run training script to generate initial model
  - Verify model file is created and metadata is stored
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement FastAPI prediction service
  - [ ] 8.1 Create FastAPI application and endpoints
    - Initialize FastAPI app with CORS middleware
    - Implement GET "/" endpoint returning service info
    - Implement POST "/predict" endpoint
    - Implement GET "/health" endpoint with model and database checks
    - Implement GET "/stats" endpoint
    - Add startup event to load model and connect to database
    - Add shutdown event to close database connection
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6, 8.1, 8.2, 8.3, 9.1, 9.2, 9.3, 9.4_
  
  - [ ] 8.2 Implement prediction endpoint logic
    - Validate input using Pydantic CustomerData model
    - Call MLModel.predict()
    - Measure processing time
    - Create PredictionRecord with timestamp and metadata
    - Save prediction to database (with error handling)
    - Return PredictionResponse
    - Add error handling for model errors, database errors
    - _Requirements: 2.1, 2.2, 2.3, 3.5, 4.1, 6.7_
  
  - [ ] 8.3 Implement health endpoint logic
    - Check if model is loaded
    - Check database connection using DataStore.check_connection()
    - Return 200 if healthy, 503 if unhealthy
    - Include model version in response
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  
  - [ ] 8.4 Implement stats endpoint logic
    - Call DataStore.get_prediction_stats()
    - Calculate total predictions, risk distribution, averages
    - Return StatsResponse
    - Handle database unavailable error (return 503)
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  
  - [ ]* 8.5 Write unit tests for API endpoints
    - Test GET / returns service information
    - Test POST /predict with valid data returns 200
    - Test POST /predict with invalid data returns 422
    - Test GET /health returns 200 when healthy
    - Test GET /health returns 503 when model not loaded
    - Test GET /health returns 503 when database unavailable
    - Test GET /stats returns all required fields
    - Test CORS headers are present
    - Mock MLModel and DataStore for isolation
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6, 6.7, 8.1, 8.2, 8.3, 8.4, 9.1, 9.2, 9.3, 9.4_
  
  - [ ]* 8.6 Write property test for response time
    - **Property 12: Response Time Performance**
    - **Validates: Requirements 3.5**
    - Generate random valid requests and measure response time <100ms

- [ ] 9. Implement model versioning logic
  - [ ] 9.1 Add version management to training pipeline
    - Implement version generation (e.g., v1.0.0, v1.0.1)
    - Set is_active=True for new model, is_active=False for old models
    - Store all model metadata (don't delete old versions)
    - _Requirements: 7.1, 7.2, 7.4_
  
  - [ ] 9.2 Add version loading to ML model component
    - Query database for active model version on startup
    - Load model file matching active version
    - Log loaded model version
    - _Requirements: 7.3_
  
  - [ ]* 9.3 Write property test for version uniqueness
    - **Property 6: Model Version Uniqueness**
    - **Validates: Requirements 7.1**
    - Generate multiple models and verify unique versions
  
  - [ ]* 9.4 Write property test for historical metadata preservation
    - **Property 7: Historical Metadata Preservation**
    - **Validates: Requirements 7.4**
    - Train multiple models and verify all metadata records remain
  
  - [ ]* 9.5 Write unit tests for version management
    - Test active model version is stored correctly
    - Test correct model version is loaded for predictions
    - Test old models are marked inactive
    - _Requirements: 7.2, 7.3_

- [ ] 10. Checkpoint - Ensure API and versioning work
  - Start FastAPI server locally
  - Test all endpoints manually or with curl
  - Verify predictions are logged to MongoDB
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Add configuration and environment management
  - [ ] 11.1 Create configuration module
    - Implement config loading from environment variables
    - Add settings for: MongoDB URI, model path, API host/port, CORS origins
    - Use pydantic BaseSettings for validation
    - Create `.env.example` with all required variables
  
  - [ ] 11.2 Update components to use configuration
    - Update DataStore to use config for MongoDB URI
    - Update MLModel to use config for model path
    - Update FastAPI app to use config for CORS origins

- [ ] 12. Write integration tests
  - [ ]* 12.1 Create end-to-end integration test
    - Start test MongoDB instance
    - Load test model
    - Initialize FastAPI test client
    - Test complete flow: POST /predict → verify database record → GET /stats
    - Test health endpoint with real dependencies
    - _Requirements: All_
  
  - [ ]* 12.2 Write property test for model metadata completeness
    - **Property 8: Model Metadata Completeness**
    - **Validates: Requirements 1.5**
    - Generate random metadata and verify all required fields are stored

- [ ] 13. Create documentation and scripts
  - [ ] 13.1 Create training script
    - Create `train.py` CLI script to train and save model
    - Add arguments for data source, algorithm choice, output path
    - Add logging for training progress and metrics
  
  - [ ] 13.2 Create API startup script
    - Create `main.py` to run FastAPI with uvicorn
    - Add logging configuration
    - Add graceful shutdown handling
  
  - [ ] 13.3 Create README
    - Document installation steps
    - Document how to train model
    - Document how to start API server
    - Document API endpoints with examples
    - Document environment variables
  
  - [ ] 13.4 Create Docker configuration (optional)
    - Create Dockerfile for API service
    - Create docker-compose.yml with API and MongoDB
    - Document Docker deployment

- [ ] 14. Final checkpoint - Run all tests and verify system
  - Run full test suite: `pytest tests/`
  - Verify all property tests pass (100 iterations each)
  - Verify test coverage >90%
  - Train a fresh model and verify ≥95% accuracy
  - Start API server and test all endpoints
  - Verify predictions are logged to MongoDB
  - Verify stats endpoint returns correct data
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests use hypothesis library with minimum 100 iterations
- Unit tests use pytest with mongomock for database isolation
- Integration tests use real MongoDB (test instance) and real model
- Model training should be done before starting the API service
- MongoDB must be running before starting the API service
- Environment variables must be configured before running any component
