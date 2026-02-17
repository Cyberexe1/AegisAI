# Requirements Document

## Introduction

This document specifies the requirements for an ML-based credit risk prediction system that evaluates loan approval risk using supervised machine learning. The system will accept customer financial data, predict loan approval probability, categorize risk levels, and provide confidence scores through a REST API. All predictions will be logged to MongoDB for tracking and analysis.

## Glossary

- **Credit_Risk_System**: The complete ML-based loan risk prediction application
- **ML_Model**: The trained machine learning classifier (RandomForest or XGBoost)
- **Prediction_Service**: The FastAPI service that serves predictions
- **Data_Store**: MongoDB database storing predictions and model metadata
- **Risk_Category**: Classification of loan risk as Low, Medium, or High
- **Approval_Probability**: Numerical score between 0 and 1 indicating likelihood of loan approval
- **Confidence_Score**: Model's confidence in its prediction (0-1)
- **Customer_Data**: Input features including income, age, loan_amount, credit_history, employment_type, existing_debts
- **Model_Metadata**: Information about model version, training date, accuracy metrics
- **Prediction_Record**: Logged prediction with timestamp, input data, output, and processing time

## Requirements

### Requirement 1: Model Training and Evaluation

**User Story:** As a data scientist, I want to train a classification model on customer financial data, so that I can predict loan approval risk with high accuracy.

#### Acceptance Criteria

1. THE ML_Model SHALL accept Customer_Data with features: income, age, loan_amount, credit_history, employment_type, existing_debts
2. WHEN training is complete, THE ML_Model SHALL achieve accuracy greater than or equal to 95%
3. THE ML_Model SHALL use RandomForest or XGBoost algorithms
4. WHEN the model is trained, THE Credit_Risk_System SHALL serialize the model using Joblib or Pickle
5. THE Credit_Risk_System SHALL store Model_Metadata including version, training date, and accuracy metrics in the Data_Store

### Requirement 2: Prediction Generation

**User Story:** As a loan officer, I want to submit customer financial data and receive risk predictions, so that I can make informed lending decisions.

#### Acceptance Criteria

1. WHEN Customer_Data is provided, THE ML_Model SHALL generate an Approval_Probability between 0 and 1
2. WHEN Customer_Data is provided, THE ML_Model SHALL assign a Risk_Category of Low, Medium, or High
3. WHEN Customer_Data is provided, THE ML_Model SHALL generate a Confidence_Score between 0 and 1
4. WHERE Approval_Probability is greater than 0.7, THE Credit_Risk_System SHALL assign Risk_Category as Low
5. WHERE Approval_Probability is between 0.3 and 0.7, THE Credit_Risk_System SHALL assign Risk_Category as Medium
6. WHERE Approval_Probability is less than 0.3, THE Credit_Risk_System SHALL assign Risk_Category as High

### Requirement 3: REST API Endpoints

**User Story:** As a frontend developer, I want to interact with the prediction service through REST API endpoints, so that I can integrate credit risk predictions into the application.

#### Acceptance Criteria

1. THE Prediction_Service SHALL expose a root endpoint at "/" that returns service information
2. THE Prediction_Service SHALL expose a prediction endpoint at "/predict" that accepts Customer_Data
3. THE Prediction_Service SHALL expose a health check endpoint at "/health" that returns service status
4. THE Prediction_Service SHALL expose a statistics endpoint at "/stats" that returns prediction statistics
5. WHEN a request is received at "/predict", THE Prediction_Service SHALL respond within 100 milliseconds
6. THE Prediction_Service SHALL enable CORS for frontend integration
7. THE Prediction_Service SHALL use Pydantic models for request and response validation

### Requirement 4: Prediction Logging

**User Story:** As a system administrator, I want all predictions logged to the database, so that I can track model usage and performance over time.

#### Acceptance Criteria

1. WHEN a prediction is generated, THE Credit_Risk_System SHALL create a Prediction_Record in the Data_Store
2. THE Prediction_Record SHALL include the input Customer_Data
3. THE Prediction_Record SHALL include the output Approval_Probability, Risk_Category, and Confidence_Score
4. THE Prediction_Record SHALL include a timestamp of when the prediction was made
5. THE Prediction_Record SHALL include the processing time in milliseconds
6. THE Prediction_Record SHALL include the model version used for the prediction

### Requirement 5: Data Storage

**User Story:** As a system architect, I want predictions and model metadata stored in MongoDB, so that we have persistent storage with flexible schema support.

#### Acceptance Criteria

1. THE Data_Store SHALL use MongoDB as the database system
2. THE Data_Store SHALL maintain a "predictions" collection for Prediction_Records
3. THE Data_Store SHALL maintain a "model_metadata" collection for Model_Metadata
4. WHEN a Prediction_Record is stored, THE Data_Store SHALL index it by timestamp for efficient querying
5. WHEN Model_Metadata is stored, THE Data_Store SHALL index it by version number

### Requirement 6: Input Validation

**User Story:** As a developer, I want input data validated before prediction, so that the model receives properly formatted data and errors are caught early.

#### Acceptance Criteria

1. WHEN Customer_Data is received, THE Prediction_Service SHALL validate that income is a positive number
2. WHEN Customer_Data is received, THE Prediction_Service SHALL validate that age is between 18 and 100
3. WHEN Customer_Data is received, THE Prediction_Service SHALL validate that loan_amount is a positive number
4. WHEN Customer_Data is received, THE Prediction_Service SHALL validate that credit_history is a valid value
5. WHEN Customer_Data is received, THE Prediction_Service SHALL validate that employment_type is a valid value
6. WHEN Customer_Data is received, THE Prediction_Service SHALL validate that existing_debts is a non-negative number
7. IF validation fails, THEN THE Prediction_Service SHALL return a descriptive error message with HTTP 422 status

### Requirement 7: Model Versioning

**User Story:** As a data scientist, I want model versions tracked, so that I can manage model updates and rollbacks.

#### Acceptance Criteria

1. WHEN a new model is trained, THE Credit_Risk_System SHALL assign it a unique version identifier
2. THE Credit_Risk_System SHALL store the current active model version in Model_Metadata
3. WHEN loading a model for predictions, THE Credit_Risk_System SHALL load the model matching the active version
4. THE Credit_Risk_System SHALL maintain historical Model_Metadata for all previous versions

### Requirement 8: Health Monitoring

**User Story:** As a DevOps engineer, I want health check endpoints, so that I can monitor service availability and model readiness.

#### Acceptance Criteria

1. WHEN the "/health" endpoint is called, THE Prediction_Service SHALL return HTTP 200 if the service is operational
2. WHEN the "/health" endpoint is called, THE Prediction_Service SHALL verify that the ML_Model is loaded
3. WHEN the "/health" endpoint is called, THE Prediction_Service SHALL verify that the Data_Store connection is active
4. IF the ML_Model is not loaded or Data_Store is unavailable, THEN THE Prediction_Service SHALL return HTTP 503

### Requirement 9: Statistics and Monitoring

**User Story:** As a business analyst, I want to view prediction statistics, so that I can understand model usage patterns and risk distribution.

#### Acceptance Criteria

1. WHEN the "/stats" endpoint is called, THE Prediction_Service SHALL return the total number of predictions made
2. WHEN the "/stats" endpoint is called, THE Prediction_Service SHALL return the distribution of Risk_Categories
3. WHEN the "/stats" endpoint is called, THE Prediction_Service SHALL return the average Approval_Probability
4. WHEN the "/stats" endpoint is called, THE Prediction_Service SHALL return the average processing time
5. THE Prediction_Service SHALL calculate statistics from Prediction_Records in th