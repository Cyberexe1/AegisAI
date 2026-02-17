/**
 * Statistics routes
 * 
 * Handles statistics retrieval from ML API and MongoDB
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000';

/**
 * GET /api/stats
 * Get prediction statistics from ML API
 */
router.get('/', async (req, res) => {
  try {
    const response = await axios.get(`${ML_API_URL}/stats`);

    res.json({
      success: true,
      data: response.data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Stats retrieval error:', error.message);
    
    if (error.response) {
      res.status(error.response.status).json({
        success: false,
        error: error.response.data
      });
    } else {
      res.status(503).json({
        success: false,
        error: {
          message: 'ML service unavailable',
          details: error.message
        }
      });
    }
  }
});

/**
 * GET /api/stats/model
 * Get model information
 */
router.get('/model', async (req, res) => {
  try {
    const response = await axios.get(`${ML_API_URL}/`);

    res.json({
      success: true,
      data: response.data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Model info retrieval error:', error.message);
    res.status(503).json({
      success: false,
      error: {
        message: 'ML service unavailable',
        details: error.message
      }
    });
  }
});

module.exports = router;
