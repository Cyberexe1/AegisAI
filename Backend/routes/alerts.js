const express = require('express');
const AlertService = require('../services/alertService');
const router = express.Router();

const alertService = new AlertService();

// Test alert endpoint
router.post('/test', async (req, res) => {
    try {
        const { email, phone, type = 'test' } = req.body;
        
        const alertData = {
            type: 'System Test',
            severity: 'info',
            message: 'This is a test alert from your ML observability dashboard.',
            details: { timestamp: new Date().toISOString() },
            recipients: {
                email: email ? [email] : [],
                sms: phone ? [phone] : []
            }
        };

        const results = await alertService.sendAlert(alertData);
        res.json({ success: true, results });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Send critical alert
router.post('/critical', async (req, res) => {
    try {
        const { message, details, recipients } = req.body;
        
        const alertData = {
            type: 'Critical System Alert',
            severity: 'critical',
            message,
            details,
            recipients
        };

        const results = await alertService.sendAlert(alertData);
        res.json({ success: true, results });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Send warning alert
router.post('/warning', async (req, res) => {
    try {
        const { message, details, recipients } = req.body;
        
        const alertData = {
            type: 'System Warning',
            severity: 'warning',
            message,
            details,
            recipients
        };

        const results = await alertService.sendAlert(alertData);
        res.json({ success: true, results });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;