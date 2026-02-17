# AegisAI Backend (Node.js)

Node.js/Express backend that interfaces with the Python ML API and provides additional business logic, data management, and API endpoints for the frontend.

## Features

- RESTful API endpoints for credit risk predictions
- Prediction history management
- Statistics aggregation
- Request validation
- Error handling
- CORS support
- MongoDB integration

## Architecture

```
Backend/
├── server.js           # Main server file
├── routes/
│   ├── predict.js     # Prediction endpoints
│   ├── history.js     # History endpoints
│   └── stats.js       # Statistics endpoints
├── package.json       # Dependencies
├── .env.example       # Environment template
└── README.md          # This file
```

## Installation

1. Install dependencies:
```bash
cd Backend
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Ensure MongoDB is running:
```bash
# MongoDB should be running on localhost:27017
```

4. Ensure Python ML API is running:
```bash
# Python API should be running on localhost:8000
python main.py
```

## Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Root
- `GET /` - API information

### Health
- `GET /api/health` - Health check

### Predictions
- `POST /api/predict` - Generate credit risk prediction
  ```json
  {
    "income": 75000,
    "age": 35,
    "loan_amount": 200000,
    "credit_history": "Good",
    "employment_type": "Full-time",
    "existing_debts": 15000
  }
  ```

### History
- `GET /api/history?page=1&limit=10` - Get prediction history (paginated)
- `GET /api/history/:id` - Get specific prediction by ID

### Statistics
- `GET /api/stats` - Get prediction statistics
- `GET /api/stats/model` - Get ML model information

## Testing

```bash
npm test
```

## Environment Variables

See `.env.example` for all available configuration options:

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string
- `ML_API_URL` - Python ML API URL
- `CORS_ORIGIN` - Allowed CORS origins

## Integration with ML API

The backend acts as a proxy and enhancement layer for the Python ML API:

1. **Prediction Flow**:
   - Frontend → Node.js Backend → Python ML API → MongoDB
   - Backend validates input and forwards to ML API
   - ML API makes prediction and logs to MongoDB
   - Backend returns result to frontend

2. **History Flow**:
   - Frontend → Node.js Backend → MongoDB
   - Backend queries MongoDB directly for history
   - Returns paginated results

3. **Statistics Flow**:
   - Frontend → Node.js Backend → Python ML API
   - Backend forwards request to ML API
   - ML API calculates stats from MongoDB
   - Backend returns aggregated data

## Error Handling

The backend provides comprehensive error handling:

- Input validation errors (400)
- Not found errors (404)
- ML service unavailable (503)
- Internal server errors (500)

All errors return JSON with consistent format:
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "details": "Additional details"
  }
}
```

## Security

- Helmet.js for security headers
- CORS configuration
- Input validation with express-validator
- Rate limiting (configurable)
- Environment variable protection

## Future Enhancements

- [ ] JWT authentication
- [ ] User management
- [ ] Role-based access control
- [ ] Request rate limiting
- [ ] Caching layer (Redis)
- [ ] WebSocket support for real-time updates
- [ ] API documentation (Swagger)
- [ ] Logging service integration
- [ ] Monitoring and alerting

## License

Proprietary
