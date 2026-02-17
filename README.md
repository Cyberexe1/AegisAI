# ML-Based Credit Risk Prediction Model

✅ **Phase 1: COMPLETED** - Model trained with 99.05% accuracy

An ML-based credit risk prediction system that evaluates loan approval risk using supervised machine learning. The system accepts customer financial data, predicts loan approval probability, categorizes risk levels, and provides confidence scores through a REST API.

## Project Structure

```
.
├── model/                 # ML Model package (ALL model-related files)
│   ├── schemas.py        # Pydantic data models
│   ├── ml_model.py       # ML model wrapper
│   ├── data_store.py     # MongoDB data store
│   ├── training.py       # Training pipeline
│   ├── config.py         # Configuration management
│   ├── main.py           # FastAPI server
│   ├── train.py          # Training script
│   ├── data/             # Training data
│   ├── kaggle_dataset/   # Kaggle loan dataset
│   ├── trained_models/   # Saved model files
│   └── tests/            # Test suites
├── Backend/              # Node.js backend
├── Frontend/             # React frontend
├── requirements.txt      # Python dependencies
├── pyproject.toml        # Package configuration
└── .env.example          # Environment variables template
```

## Installation

1. Clone the repository
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Copy `.env.example` to `model/.env` and configure:
   ```bash
   cd model
   cp .env.example .env
   cd ..
   ```

5. Ensure MongoDB is running locally or update `MONGODB_URI` in `model/.env`

## Quick Start

### Training a Model

```bash
cd model
python train.py
```

### Starting the API Server

```bash
cd model
python main.py
```

The API will be available at `http://localhost:8000`

## API Endpoints

- `GET /` - Service information
- `POST /predict` - Generate credit risk prediction
- `GET /health` - Health check
- `GET /stats` - Prediction statistics

## Testing

Run all tests:
```bash
pytest tests/
```

Run specific test suites:
```bash
pytest tests/unit/          # Unit tests
pytest tests/property/      # Property-based tests
pytest tests/integration/   # Integration tests
```

## Environment Variables

See `.env.example` for all available configuration options.

## Requirements

- Python 3.9+
- MongoDB 4.0+
- 2GB RAM minimum
- 1GB disk space for models and data

## License

Proprietary
