const express = require('express');
const AlertService = require('../services/alertService');
const router = express.Router();

const alertService = new AlertService();

// Simulate incident and send email notification
router.post('/simulate', async (req, res) => {
    try {
        // Call ML API to simulate incident
        const mlApiUrl = process.env.ML_API_URL || 'http://localhost:8000';
        const response = await fetch(`${mlApiUrl}/governance/simulate-incident`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error('Failed to simulate incident on ML API');
        }

        const incidentData = await response.json();
        
        // Extract incident details
        const incident = incidentData.incident || {};
        const trustResult = incidentData.trust_result || {};
        
        // Prepare email notification
        const alertData = {
            type: 'Governance Incident Detected',
            severity: 'critical',
            message: `🚨 ${incident.type || 'Drift Incident'} detected in the ML model`,
            details: {
                incident_type: incident.type || 'drift_detected',
                severity: incident.severity || 'high',
                description: incident.description || 'High severity drift detected in model predictions',
                detected_at: incident.detected_at || new Date().toISOString(),
                trust_score: trustResult.trust_score || 'N/A',
                autonomy_level: trustResult.autonomy_level || 'N/A',
                governance_action: trustResult.governance_action || 'Review required',
                recommendation: 'Immediate review of model performance and data quality recommended'
            },
            recipients: {
                email: [process.env.ALERT_EMAIL_TO || 'vikastiwari1045@gmail.com'],
                sms: []
            }
        };

        // Send email alert
        const emailResult = await alertService.sendAlert(alertData);
        
        res.json({
            success: true,
            incident: incidentData,
            notification: {
                email_sent: emailResult.email?.success || false,
                email_message: emailResult.email?.message || 'Email notification sent'
            }
        });
        
    } catch (error) {
        console.error('Failed to simulate incident:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Simulate drift with email notification
router.post('/simulate-drift', async (req, res) => {
    try {
        const mlApiUrl = process.env.ML_API_URL || 'http://localhost:8000';
        const response = await fetch(`${mlApiUrl}/simulation/drift`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error('Failed to simulate drift on ML API');
        }

        const driftData = await response.json();
        const incident = driftData.incident || {};
        const trustResult = driftData.trust_result || {};
        
        // Send email alert
        const alertData = {
            type: 'Data Drift Alert',
            severity: 'critical',
            message: '🔴 High severity data drift detected in ML model',
            details: {
                incident_type: 'drift_detected',
                severity: incident.severity || 'high',
                description: incident.description || 'Significant drift detected in feature distributions',
                detected_at: incident.detected_at || new Date().toISOString(),
                trust_score: trustResult.trust_score || 'N/A',
                autonomy_level: trustResult.autonomy_level || 'N/A',
                governance_action: trustResult.governance_action || 'Model retraining recommended',
                affected_features: incident.details?.affected_features || ['income', 'age', 'loan_amount']
            },
            recipients: {
                email: [process.env.ALERT_EMAIL_TO || 'vikastiwari1045@gmail.com'],
                sms: []
            }
        };

        await alertService.sendAlert(alertData);
        
        res.json({
            success: true,
            simulation: driftData,
            notification: { email_sent: true }
        });
        
    } catch (error) {
        console.error('Failed to simulate drift:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Simulate bias with email notification
router.post('/simulate-bias', async (req, res) => {
    try {
        const mlApiUrl = process.env.ML_API_URL || 'http://localhost:8000';
        const response = await fetch(`${mlApiUrl}/simulation/bias`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error('Failed to simulate bias on ML API');
        }

        const biasData = await response.json();
        const incident = biasData.incident || {};
        const trustResult = biasData.trust_result || {};
        
        // Send email alert
        const alertData = {
            type: 'Model Bias Alert',
            severity: 'critical',
            message: '⚠️ Bias detected in ML model predictions',
            details: {
                incident_type: 'bias_detected',
                severity: incident.severity || 'high',
                description: incident.description || 'Bias detected in credit_history feature',
                detected_at: incident.detected_at || new Date().toISOString(),
                trust_score: trustResult.trust_score || 'N/A',
                autonomy_level: trustResult.autonomy_level || 'N/A',
                governance_action: trustResult.governance_action || 'Fairness review required',
                bias_score: incident.details?.bias_score || 0.78,
                affected_group: incident.details?.affected_group || 'Fair credit history'
            },
            recipients: {
                email: [process.env.ALERT_EMAIL_TO || 'vikastiwari1045@gmail.com'],
                sms: []
            }
        };

        await alertService.sendAlert(alertData);
        
        res.json({
            success: true,
            simulation: biasData,
            notification: { email_sent: true }
        });
        
    } catch (error) {
        console.error('Failed to simulate bias:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Simulate accuracy drop with email notification
router.post('/simulate-accuracy-drop', async (req, res) => {
    try {
        const mlApiUrl = process.env.ML_API_URL || 'http://localhost:8000';
        const response = await fetch(`${mlApiUrl}/simulation/accuracy-drop`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error('Failed to simulate accuracy drop on ML API');
        }

        const accuracyData = await response.json();
        const incident = accuracyData.incident || {};
        const trustResult = accuracyData.trust_result || {};
        
        // Send email alert
        const alertData = {
            type: 'Model Performance Alert',
            severity: 'warning',
            message: '📉 Model accuracy drop detected',
            details: {
                incident_type: 'accuracy_drop',
                severity: incident.severity || 'medium',
                description: incident.description || 'Model accuracy has decreased significantly',
                detected_at: incident.detected_at || new Date().toISOString(),
                trust_score: trustResult.trust_score || 'N/A',
                autonomy_level: trustResult.autonomy_level || 'N/A',
                governance_action: trustResult.governance_action || 'Model retraining recommended',
                previous_accuracy: incident.details?.previous_accuracy || 0.95,
                current_accuracy: incident.details?.current_accuracy || 0.87,
                drop_percentage: incident.details?.drop_percentage || 8.4
            },
            recipients: {
                email: [process.env.ALERT_EMAIL_TO || 'vikastiwari1045@gmail.com'],
                sms: []
            }
        };

        await alertService.sendAlert(alertData);
        
        res.json({
            success: true,
            simulation: accuracyData,
            notification: { email_sent: true }
        });
        
    } catch (error) {
        console.error('Failed to simulate accuracy drop:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
