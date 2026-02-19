/**
 * Loan management routes
 * 
 * Handles user loan history and status
 */

const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'aegisai'; // Changed from credit_risk_db to match seed script

/**
 * GET /api/loans/user/:userId
 * Get all loans for a specific user
 */
router.get('/user/:userId', async (req, res) => {
  let client;
  
  try {
    const { userId } = req.params;
    
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    
    // Get user's loans from the loans collection
    const loans = await db.collection('loans')
      .find({ userId: userId })
      .sort({ applicationDate: -1 })
      .toArray();
    
    // Categorize loans by status
    const ongoingLoans = loans.filter(l => l.status === 'ongoing');
    const completedLoans = loans.filter(l => l.status === 'completed');
    const pendingLoans = loans.filter(l => l.status === 'pending');
    const rejectedLoans = loans.filter(l => l.status === 'rejected');
    
    // Format response
    const response = {
      success: true,
      data: {
        total_applications: loans.length,
        ongoing: ongoingLoans.length,
        completed: completedLoans.length,
        pending: pendingLoans.length,
        rejected: rejectedLoans.length,
        loans: {
          ongoing: ongoingLoans.map(formatLoanData),
          completed: completedLoans.map(formatLoanData),
          pending: pendingLoans.map(formatLoanData),
          rejected: rejectedLoans.map(formatLoanData),
          all: loans.map(formatLoanData)
        }
      }
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Error fetching user loans:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch loan history'
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

/**
 * GET /api/loans/recent
 * Get recent loan applications (for admin dashboard)
 */
router.get('/recent', async (req, res) => {
  let client;
  
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    
    // Get recent loans
    const loans = await db.collection('loans')
      .find({})
      .sort({ applicationDate: -1 })
      .limit(limit)
      .toArray();
    
    const response = {
      success: true,
      data: {
        count: loans.length,
        loans: loans.map(formatLoanData)
      }
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Error fetching recent loans:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent loans'
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

/**
 * GET /api/loans/:loanId
 * Get specific loan details
 */
router.get('/:loanId', async (req, res) => {
  let client;
  
  try {
    const { loanId } = req.params;
    
    // Validate ObjectId
    if (!ObjectId.isValid(loanId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid loan ID'
      });
    }
    
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    
    // Get loan details
    const loan = await db.collection('predictions')
      .findOne({ _id: new ObjectId(loanId) });
    
    if (!loan) {
      return res.status(404).json({
        success: false,
        error: 'Loan not found'
      });
    }
    
    res.json({
      success: true,
      data: formatLoan(loan)
    });
    
  } catch (error) {
    console.error('Error fetching loan details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch loan details'
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

/**
 * Helper function to format loan data from loans collection
 */
function formatLoanData(loan) {
  return {
    id: loan._id.toString(),
    userId: loan.userId,
    userName: loan.userName,
    loanAmount: loan.loanAmount,
    loanPurpose: loan.loanPurpose,
    status: loan.status,
    approvalStatus: loan.approvalStatus,
    applicationDate: loan.applicationDate,
    approvalDate: loan.approvalDate,
    disbursementDate: loan.disbursementDate,
    completionDate: loan.completionDate,
    rejectionDate: loan.rejectionDate,
    rejectionReason: loan.rejectionReason,
    tenure: loan.tenure,
    interestRate: loan.interestRate,
    monthlyEMI: loan.monthlyEMI,
    paidEMIs: loan.paidEMIs,
    remainingEMIs: loan.remainingEMIs,
    nextDueDate: loan.nextDueDate,
    creditScore: loan.creditScore,
    mlPrediction: loan.mlPrediction
  };
}

/**
 * Helper function to format loan data from predictions collection (legacy)
 */
function formatLoan(prediction) {
  const input = prediction.input_data || {};
  
  // Data is stored at root level, not nested under 'prediction'
  const approvalProb = prediction.approval_probability || 0;
  const riskCategory = prediction.risk_category || 'Unknown';
  const confidenceScore = prediction.confidence_score || 0;
  
  // Determine status based on risk and approval probability
  let status = 'Pending';
  if (riskCategory === 'Low' || approvalProb > 0.6) {
    status = 'Approved';
  } else if (riskCategory === 'High' || approvalProb < 0.4) {
    status = 'Rejected';
  }
  
  // Calculate loan type based on amount
  let loanType = 'Personal Loan';
  if (input.loan_amount > 50000) {
    loanType = 'Business Loan';
  } else if (input.loan_amount > 30000) {
    loanType = 'Home Improvement';
  } else if (input.loan_amount > 20000) {
    loanType = 'Auto Loan';
  }
  
  return {
    id: prediction._id.toString(),
    loan_type: loanType,
    amount: input.loan_amount || 0,
    status: status,
    risk_score: approvalProb,  // Using approval_probability as risk_score
    risk_category: riskCategory,
    confidence: confidenceScore,
    approval_probability: approvalProb,
    applied_date: prediction.timestamp,
    applicant: {
      income: input.income || 0,
      age: input.age || 0,
      credit_history: input.credit_history || 'Unknown',
      employment_type: input.employment_type || 'Unknown',
      existing_debts: input.existing_debts || 0
    },
    model_version: prediction.model_version || 'Unknown',
    processing_time_ms: prediction.processing_time_ms || 0
  };
}

module.exports = router;
