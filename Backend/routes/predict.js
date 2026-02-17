/**
 * Prediction routes
 * 
 * Handles credit risk prediction requests by forwarding to ML API
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');
const { body, validationResult } = require('express-validator');

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000';

// Validation middleware
const validatePredictionInput = [
  body('income').isFloat({ gt: 0 }).withMessage('Income must be a positive number'),
  body('age').isInt({ min: 18, max: 100 }).withMessage('Age must be between 18 and 100'),
  body('loan_amount').isFloat({ gt: 0 }).withMessage('Loan amount must be a positive number'),
  body('credit_history').isIn(['Good', 'Fair', 'Poor']).withMessage('Invalid credit history'),
  body('employment_type').isIn(['Full-time', 'Part-time', 'Self-employed', 'Unemployed']).withMessage('Invalid employment type'),
  body('existing_debts').isFloat({ min: 0 }).withMessage('Existing debts must be non-negative')
];

/**
 * POST /api/predict
 * Generate credit risk prediction
 */
router.post('/', validatePredictionInput, async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { income, age, loan_amount, credit_history, employment_type, existing_debts } = req.body;

    // Forward request to ML API
    const response = await axios.post(`${ML_API_URL}/predict`, {
      income,
      age,
      loan_amount,
      credit_history,
      employment_type,
      existing_debts
    });

    // Return prediction result
    res.json({
      success: true,
      data: response.data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Prediction error:', error.message);
    
    if (error.response) {
      // ML API returned an error
      res.status(error.response.status).json({
        success: false,
        error: error.response.data
      });
    } else {
      // Network or other error
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

module.exports = router;
