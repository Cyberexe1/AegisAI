/**
 * History routes
 * 
 * Handles prediction history retrieval from MongoDB
 */

const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'credit_risk_db';

let db = null;

// Initialize MongoDB connection
async function connectDB() {
  if (db) return db;
  
  try {
    const client = await MongoClient.connect(MONGODB_URI);
    db = client.db(DB_NAME);
    console.log('✅ Connected to MongoDB for history');
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

/**
 * GET /api/history
 * Get prediction history with pagination
 */
router.get('/', async (req, res) => {
  try {
    const database = await connectDB();
    const predictions = database.collection('predictions');

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count
    const total = await predictions.countDocuments();

    // Get paginated results
    const results = await predictions
      .find({})
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    res.json({
      success: true,
      data: {
        predictions: results,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('History retrieval error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve history',
        details: error.message
      }
    });
  }
});

/**
 * GET /api/history/:id
 * Get specific prediction by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const database = await connectDB();
    const predictions = database.collection('predictions');
    const { ObjectId } = require('mongodb');

    const prediction = await predictions.findOne({
      _id: new ObjectId(req.params.id)
    });

    if (!prediction) {
      return res.status(404).json({
        success: false,
        error: { message: 'Prediction not found' }
      });
    }

    res.json({
      success: true,
      data: prediction
    });

  } catch (error) {
    console.error('Prediction retrieval error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve prediction',
        details: error.message
      }
    });
  }
});

module.exports = router;
