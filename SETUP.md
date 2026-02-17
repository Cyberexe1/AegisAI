# AegisAI - Complete Setup Guide

## Project Overview

AegisAI is an enterprise-grade AI Governance Control Platform for credit risk assessment with real-time adaptive trust and explainable risk intelligence. The system includes ML model monitoring, drift detection, trust scoring, LLM observability, and a complete user/admin dashboard.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      AegisAI Platform                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Frontend   │  │   Backend    │  │  Model API   │    │
│  │  React + TS  │  │  Node.js +   │  │  Python +    │    │
│  │  Port: 5173  │  │  Express     │  │  FastAPI     │    │
│  │              │  │  Port: 5000  │  │  Port: 8000  │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                 │                  │             │
│         └─────────────────┴──────────────────┘             │
│                           │                                │
│                  ┌────────▼────────┐                       │
│                  │    MongoDB      │                       │
│                  │  Port: 27017    │                       │
│                  └─────────────────┘                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

### Required Software

1. **Node.js** (v16 or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version`

2. **Python** (v3.8 or higher)
   - Download: https://www.python.org/
   - Verify: `python --version` or `python3 --version`

3. **MongoDB** (v4.4 or higher)
   - Download: https://www.mongodb.com/try/download/community
   - Verify: `mongod --version`

4. **Git**
   - Download: https://git-scm.com/
   - Verify: `git --version`

### Optional Tools

- **MongoDB Compass** (GUI for MongoDB)
- **Postman** (API testing)
- **VS Code** (Recommended IDE)

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd aegisai-platform
```

### 2. Setup MongoDB

#### Option A: Local MongoDB
```bash
# Start MongoDB service
# Windows:
net start MongoDB

# macOS:
brew services start mongodb-community

# Linux:
sudo systemctl start mongod
```

#### Option B: MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Update `.env` files with connection string

### 3. Setup Model API (Python/FastAPI)

```bash
# Navigate to model directory
cd model

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r ../requirements.txt

# Create .env file
copy .env.example .env  # Windows
cp .env.example .env    # macOS/Linux

# Edit .env file with your settings
# Required variables:
# - MONGODB_URI=mongodb://localhost:27017
# - MONGODB_DATABASE=credit_risk_db
# - OPENROUTER_API_KEY=your_api_key_here
# - MODEL_PATH=trained_models/credit_risk_model_v20260217_145858.joblib

# Train the model (first time only)
python train.py

# Start the Model API
python main.py
```

**Expected Output**:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 4. Setup Backend (Node.js/Express)

```bash
# Open new terminal
# Navigate to Backend directory
cd Backend

# Install dependencies
npm install

# Create .env file
copy .env.example .env  # Windows
cp .env.example .env    # macOS/Linux

# Edit .env file with your settings
# Required variables:
# - PORT=5000
# - MONGODB_URI=mongodb://localhost:27017
# - MONGODB_DATABASE=credit_risk_db
# - MODEL_API_URL=http://localhost:8000

# Start the Backend server
npm start
```

**Expected Output**:
```
Server running on port 5000
Connected to MongoDB
```

### 5. Setup Frontend (React/TypeScript)

```bash
# Open new terminal
# Navigate to Frontend directory
cd Frontend

# Install dependencies
npm install

# Create .env file
copy .env.example .env  # Windows
cp .env.example .env    # macOS/Linux

# Edit .env file with your settings
# Required variables:
# - VITE_API_URL=http://localhost:8000
# - VITE_BACKEND_URL=http://localhost:5000

# Start the Frontend development server
npm run dev
```

**Expected Output**:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 6. Seed Sample Data (Optional)

```bash
# Navigate to model directory
cd model

# Run seed script
python seed_user_loans.py
```

**Expected Output**:
```
✓ Seeded 9 loans for demo-user-001
✓ Seeded 9 loans for user@aegisai.com
✓ Total: 18 loans created
```

## Quick Start Script

### Windows (start-all.bat)
```batch
@echo off
echo Starting AegisAI Platform...

start "MongoDB" mongod
timeout /t 3

start "Model API" cmd /k "cd model && python main.py"
timeout /t 5

start "Backend" cmd /k "cd Backend && npm start"
timeout /t 3

start "Frontend" cmd /k "cd Frontend && npm run dev"

echo All services started!
echo Frontend: http://localhost:5173
echo Backend: http://localhost:5000
echo Model API: http://localhost:8000
```

### macOS/Linux (start-all.sh)
```bash
#!/bin/bash
echo "Starting AegisAI Platform..."

# Start MongoDB (if not running)
brew services start mongodb-community

# Start Model API
cd model
python main.py &
sleep 5

# Start Backend
cd ../Backend
npm start &
sleep 3

# Start Frontend
cd ../Frontend
npm run dev

echo "All services started!"
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:5000"
echo "Model API: http://localhost:8000"
```

## Environment Variables

### Model API (.env)
```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=credit_risk_db

# Model Configuration
MODEL_PATH=trained_models/credit_risk_model_v20260217_145858.joblib
MODEL_VERSION=v1.0

# OpenRouter API (for LLM features)
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here

# Server Configuration
HOST=0.0.0.0
PORT=8000
LOG_LEVEL=INFO

# CORS Configuration
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Backend (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=credit_risk_db

# Model API Configuration
MODEL_API_URL=http://localhost:8000

# CORS Configuration
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend (.env)
```env
# API Configuration
VITE_API_URL=http://localhost:8000
VITE_BACKEND_URL=http://localhost:5000

# App Configuration
VITE_APP_NAME=AegisAI
VITE_APP_VERSION=1.0.0
```

## Default Credentials

### Admin User
- **Email**: `vikastiwari1045@gmail.com`
- **Password**: `Vikas123@`
- **Dashboard**: `/dashboard` (Admin Control Panel)

### Regular User
- **Email**: `user@aegisai.com`
- **Password**: `user123@`
- **Dashboard**: `/user-dashboard` (User Portal)

## Accessing the Application

### 1. Open Browser
Navigate to: `http://localhost:5173`

### 2. Login
Use one of the default credentials above

### 3. Explore Features

#### Admin Dashboard (`/dashboard`)
- Model Health Monitoring
- Risk & Trust Scores
- Governance Logs
- LLM Observability
- Drift Detection
- System Settings

#### User Dashboard (`/user-dashboard`)
- Loan Overview
- My Loans
- Apply for Loan
- Profile Management

## Project Structure

```
aegisai-platform/
├── Frontend/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── layouts/         # Layout components
│   │   ├── services/        # API services
│   │   ├── context/         # React context
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   └── package.json
│
├── Backend/                  # Node.js + Express backend
│   ├── routes/              # API routes
│   │   ├── loans.js         # Loan management
│   │   ├── stats.js         # Statistics
│   │   ├── history.js       # History
│   │   └── predict.js       # Predictions
│   ├── middleware/          # Express middleware
│   ├── db/                  # Database utilities
│   └── server.js            # Main server file
│
├── model/                    # Python + FastAPI ML API
│   ├── monitoring/          # Monitoring modules
│   │   ├── drift_detector.py
│   │   ├── performance_tracker.py
│   │   └── system_health.py
│   ├── governance/          # Governance modules
│   │   └── trust_engine.py
│   ├── llm/                 # LLM integration
│   │   └── openrouter_service.py
│   ├── explainability/      # SHAP explainability
│   │   └── shap_explainer.py
│   ├── config/              # Configuration files
│   ├── trained_models/      # Trained ML models
│   ├── kaggle_dataset/      # Training data
│   ├── main.py              # FastAPI application
│   ├── ml_model.py          # ML model wrapper
│   ├── train.py             # Model training script
│   ├── schemas.py           # Pydantic schemas
│   └── data_store.py        # Database operations
│
├── requirements.txt          # Python dependencies
├── README.md                # Project documentation
├── SETUP.md                 # This file
└── start-all.bat            # Quick start script
```

## API Endpoints

### Model API (Port 8000)

#### Prediction
- `POST /predict` - Make loan prediction
- `GET /stats` - Get prediction statistics
- `GET /health` - Health check

#### Monitoring
- `GET /monitoring/drift` - Get drift detection results
- `GET /monitoring/performance` - Get performance metrics
- `GET /monitoring/health` - Get system health
- `GET /monitoring/dashboard` - Get monitoring dashboard data

#### Governance
- `GET /governance/trust` - Get current trust score
- `GET /governance/history` - Get trust score history
- `GET /governance/incidents` - Get governance incidents
- `POST /governance/simulate-incident` - Simulate incident

#### LLM
- `POST /llm/query` - Query LLM
- `GET /llm/metrics` - Get LLM metrics
- `GET /llm/interactions` - Get LLM interactions
- `GET /llm/alerts` - Get LLM alerts

#### Simulation
- `POST /simulation/drift` - Simulate drift
- `POST /simulation/bias` - Simulate bias
- `POST /simulation/accuracy-drop` - Simulate accuracy drop
- `POST /simulation/reset` - Reset simulation
- `GET /simulation/status` - Get simulation status

### Backend API (Port 5000)

#### Loans
- `GET /api/loans/user/:userId` - Get user loans
- `GET /api/loans/recent` - Get recent loans
- `GET /api/loans/:loanId` - Get loan details

## Troubleshooting

### MongoDB Connection Issues
**Problem**: Cannot connect to MongoDB

**Solutions**:
1. Verify MongoDB is running: `mongod --version`
2. Check connection string in `.env` files
3. Try connecting with MongoDB Compass
4. Check firewall settings

### Port Already in Use
**Problem**: Port 5173, 5000, or 8000 already in use

**Solutions**:
1. Find process using port: `netstat -ano | findstr :5173`
2. Kill process: `taskkill /PID <pid> /F`
3. Or change port in `.env` files

### Python Dependencies Issues
**Problem**: Module not found errors

**Solutions**:
1. Activate virtual environment
2. Reinstall dependencies: `pip install -r requirements.txt`
3. Check Python version: `python --version`

### Model Not Found
**Problem**: Model file not found error

**Solutions**:
1. Train model: `python train.py`
2. Check MODEL_PATH in `.env`
3. Verify file exists in `trained_models/` directory

### Frontend Build Issues
**Problem**: npm install fails

**Solutions**:
1. Clear npm cache: `npm cache clean --force`
2. Delete `node_modules` and `package-lock.json`
3. Run `npm install` again
4. Check Node.js version: `node --version`

## Testing the Setup

### 1. Check All Services Running
```bash
# Check Model API
curl http://localhost:8000/health

# Check Backend
curl http://localhost:5000/api/loans/recent

# Check Frontend
# Open browser: http://localhost:5173
```

### 2. Test Loan Application
1. Login as user: `user@aegisai.com` / `user123@`
2. Click "Apply for New Loan"
3. Fill form with:
   - Income: $60,000
   - Loan Amount: $15,000
   - Credit Score: 750
   - Employment: Full-Time
   - Age: 30
   - Existing Debts: $5,000
4. Click "Check Eligibility"
5. Should see approval result

### 3. Verify Data Persistence
1. Accept loan offer
2. Navigate to "My Loans"
3. Should see new loan in list
4. Refresh page
5. Should still see loan (not logged out)

## Performance Optimization

### Production Build

#### Frontend
```bash
cd Frontend
npm run build
# Serve with: npm run preview
```

#### Backend
```bash
cd Backend
NODE_ENV=production npm start
```

#### Model API
```bash
cd model
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## Security Considerations

### Development
- Default credentials are for demo only
- MongoDB has no authentication
- CORS allows all origins

### Production Recommendations
1. Change all default credentials
2. Enable MongoDB authentication
3. Configure proper CORS origins
4. Use HTTPS/SSL certificates
5. Implement rate limiting
6. Add input validation
7. Use environment-specific configs
8. Enable logging and monitoring
9. Regular security audits
10. Keep dependencies updated

## Backup and Restore

### Backup MongoDB
```bash
mongodump --db credit_risk_db --out ./backup
```

### Restore MongoDB
```bash
mongorestore --db credit_risk_db ./backup/credit_risk_db
```

## Support and Documentation

### Additional Documentation
- `README.md` - Project overview
- `API_INTEGRATION_FIX.md` - API integration details
- `AUTH_PERSISTENCE_FIX.md` - Authentication setup
- `USER_DASHBOARD_COMPLETE.md` - User dashboard guide
- `LOAN_DATA_SYNC_FIX.md` - Loan data synchronization

### Getting Help
1. Check documentation files
2. Review error logs
3. Check browser console (F12)
4. Verify all services are running
5. Check environment variables

## Next Steps

After successful setup:

1. **Explore Admin Dashboard**
   - Monitor model health
   - View trust scores
   - Check governance logs
   - Test simulation features

2. **Test User Features**
   - Apply for loans
   - View loan history
   - Update profile
   - Test different scenarios

3. **Customize Configuration**
   - Update branding
   - Modify thresholds
   - Configure alerts
   - Add custom rules

4. **Deploy to Production**
   - Set up cloud hosting
   - Configure domain
   - Enable SSL
   - Set up monitoring

## Summary

You now have a complete AI Governance Control Platform running locally with:

✅ ML-based credit risk prediction
✅ Real-time monitoring and drift detection
✅ Trust score calculation
✅ LLM observability
✅ Admin and user dashboards
✅ Loan management system
✅ Authentication and authorization
✅ Data persistence

Enjoy using AegisAI! 🚀
