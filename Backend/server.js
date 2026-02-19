/**
 * AegisAI Backend Server
 * 
 * Node.js/Express backend that interfaces with the Python ML API
 * and provides additional business logic and data management.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'AegisAI Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      predict: '/api/predict',
      history: '/api/history',
      stats: '/api/stats'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Import routes
const predictRoutes = require('./routes/predict');
const historyRoutes = require('./routes/history');
const statsRoutes = require('./routes/stats');
const loansRoutes = require('./routes/loans');
const alertRoutes = require('./routes/alerts');
const incidentRoutes = require('./routes/incidents');

app.use('/api/predict', predictRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/loans', loansRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/incidents', incidentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AegisAI Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 ML API: ${process.env.ML_API_URL || 'http://localhost:8000'}`);
  
  // Start alert monitoring
  if (process.env.ENABLE_ALERTS !== 'false') {
    const AlertIntegration = require('./services/alertIntegration');
    const alertIntegration = new AlertIntegration();
    alertIntegration.startMonitoring(5); // Check every 5 minutes
    console.log('🚨 Alert monitoring started');
  }
});

module.exports = app;
