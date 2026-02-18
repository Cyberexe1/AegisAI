const AlertService = require('./alertService');
const axios = require('axios');

class AlertIntegration {
    constructor() {
        this.alertService = new AlertService();
        this.lastAlertTime = {};
        this.alertCooldown = 5 * 60 * 1000; // 5 minutes cooldown
        
        // Default recipients from environment
        this.defaultRecipients = {
            email: process.env.DEFAULT_ALERT_EMAIL ? [process.env.DEFAULT_ALERT_EMAIL] : [],
            sms: process.env.DEFAULT_ALERT_PHONE ? [process.env.DEFAULT_ALERT_PHONE] : []
        };
    }

    async checkAndSendAlerts() {
        try {
            // Check ML model health
            await this.checkMLModelHealth();
            
            // Check system health
            await this.checkSystemHealth();
            
            // Check LLM metrics
            await this.checkLLMMetrics();
            
        } catch (error) {
            console.error('Error in alert checking:', error);
        }
    }

    async checkMLModelHealth() {
        try {
            const response = await axios.get(`${process.env.ML_API_URL}/health`);
            const health = response.data;

            // Check model accuracy
            if (health.avg_confidence < 0.7) {
                await this.sendAlertWithCooldown('ml_accuracy', {
                    type: 'ML Model Accuracy Drop',
                    severity: 'warning',
                    message: `Model confidence dropped to ${(health.avg_confidence * 100).toFixed(1)}%`,
                    details: health
                });
            }

            // Check response time
            if (health.avg_response_time_ms > 1000) {
                await this.sendAlertWithCooldown('ml_latency', {
                    type: 'ML Model Latency',
                    severity: 'warning',
                    message: `Model response time increased to ${health.avg_response_time_ms}ms`,
                    details: health
                });
            }

        } catch (error) {
            await this.sendAlertWithCooldown('ml_connection', {
                type: 'ML API Connection Error',
                severity: 'critical',
                message: 'Unable to connect to ML API service',
                details: { error: error.message }
            });
        }
    }

    async checkSystemHealth() {
        try {
            const response = await axios.get(`${process.env.ML_API_URL}/system-health`);
            const health = response.data;

            if (health.has_alerts) {
                for (const alert of health.alerts) {
                    if (alert.severity === 'high') {
                        await this.sendAlertWithCooldown(`system_${alert.type}`, {
                            type: `System ${alert.type.toUpperCase()} Alert`,
                            severity: 'critical',
                            message: alert.message,
                            details: health
                        });
                    }
                }
            }

        } catch (error) {
            console.error('Error checking system health:', error);
        }
    }

    async checkLLMMetrics() {
        try {
            const response = await axios.get(`${process.env.ML_API_URL}/llm/metrics`);
            const metrics = response.data;

            // Check cost threshold
            if (metrics.total_cost_24h > 50) { // $50 daily limit
                await this.sendAlertWithCooldown('llm_cost', {
                    type: 'LLM Cost Alert',
                    severity: 'warning',
                    message: `Daily LLM cost exceeded $${metrics.total_cost_24h}`,
                    details: metrics
                });
            }

            // Check hallucination rate
            if (metrics.hallucination_rate > 0.1) { // 10% threshold
                await this.sendAlertWithCooldown('llm_hallucination', {
                    type: 'LLM Hallucination Alert',
                    severity: 'critical',
                    message: `High hallucination rate: ${(metrics.hallucination_rate * 100).toFixed(1)}%`,
                    details: metrics
                });
            }

            // Check average latency
            if (metrics.avg_latency_ms > 5000) { // 5 second threshold
                await this.sendAlertWithCooldown('llm_latency', {
                    type: 'LLM Latency Alert',
                    severity: 'warning',
                    message: `High LLM latency: ${metrics.avg_latency_ms}ms`,
                    details: metrics
                });
            }

        } catch (error) {
            console.error('Error checking LLM metrics:', error);
        }
    }

    async sendAlertWithCooldown(alertKey, alertData) {
        const now = Date.now();
        const lastAlert = this.lastAlertTime[alertKey];

        // Check cooldown
        if (lastAlert && (now - lastAlert) < this.alertCooldown) {
            console.log(`Alert ${alertKey} in cooldown, skipping`);
            return;
        }

        // Send alert
        const fullAlertData = {
            ...alertData,
            recipients: this.defaultRecipients
        };

        const result = await this.alertService.sendAlert(fullAlertData);
        
        if (result.email.some(r => r.success) || result.sms.some(r => r.success)) {
            this.lastAlertTime[alertKey] = now;
            console.log(`Alert sent for ${alertKey}:`, alertData.message);
        }

        return result;
    }

    startMonitoring(intervalMinutes = 5) {
        console.log(`Starting alert monitoring every ${intervalMinutes} minutes`);
        
        // Initial check
        this.checkAndSendAlerts();
        
        // Set up interval
        setInterval(() => {
            this.checkAndSendAlerts();
        }, intervalMinutes * 60 * 1000);
    }
}

module.exports = AlertIntegration;