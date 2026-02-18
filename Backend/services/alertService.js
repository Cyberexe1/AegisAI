const nodemailer = require('nodemailer');
const twilio = require('twilio');
require('dotenv').config();

class AlertService {
    constructor() {
        // Email transporter (Gmail SMTP)
        this.emailTransporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD // Use app password, not regular password
            }
        });

        // SMS client (Twilio)
        this.smsClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
            ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
            : null;
    }

    async sendEmailAlert(to, subject, message, alertType = 'warning') {
        try {
            const htmlContent = this.generateEmailTemplate(subject, message, alertType);
            
            const mailOptions = {
                from: process.env.GMAIL_USER,
                to: to,
                subject: `🚨 Banking ML Alert: ${subject}`,
                html: htmlContent
            };

            const result = await this.emailTransporter.sendMail(mailOptions);
            console.log('Email alert sent:', result.messageId);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('Email alert failed:', error);
            return { success: false, error: error.message };
        }
    }

    async sendSMSAlert(to, message) {
        if (!this.smsClient) {
            console.log('SMS not configured, skipping SMS alert');
            return { success: false, error: 'SMS not configured' };
        }

        try {
            const result = await this.smsClient.messages.create({
                body: `🚨 ML Alert: ${message}`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: to
            });

            console.log('SMS alert sent:', result.sid);
            return { success: true, sid: result.sid };
        } catch (error) {
            console.error('SMS alert failed:', error);
            return { success: false, error: error.message };
        }
    }

    async sendAlert(alertData) {
        const { 
            type, 
            severity, 
            message, 
            details, 
            recipients 
        } = alertData;

        const results = {
            email: [],
            sms: []
        };

        // Send email alerts
        if (recipients.email && recipients.email.length > 0) {
            for (const email of recipients.email) {
                const emailResult = await this.sendEmailAlert(
                    email, 
                    `${severity.toUpperCase()}: ${type}`, 
                    message,
                    severity
                );
                results.email.push({ email, ...emailResult });
            }
        }

        // Send SMS alerts for critical issues only
        if (severity === 'critical' && recipients.sms && recipients.sms.length > 0) {
            for (const phone of recipients.sms) {
                const smsResult = await this.sendSMSAlert(phone, message);
                results.sms.push({ phone, ...smsResult });
            }
        }

        return results;
    }

    generateEmailTemplate(subject, message, alertType) {
        const colors = {
            critical: '#dc2626',
            warning: '#f59e0b',
            info: '#3b82f6'
        };

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { background: ${colors[alertType] || colors.warning}; color: white; padding: 20px; text-align: center; }
                .content { padding: 30px; }
                .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
                .alert-icon { font-size: 48px; margin-bottom: 10px; }
                .timestamp { color: #666; font-size: 14px; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="alert-icon">🚨</div>
                    <h1>${subject}</h1>
                </div>
                <div class="content">
                    <p><strong>Alert Message:</strong></p>
                    <p>${message}</p>
                    <div class="timestamp">
                        <strong>Time:</strong> ${new Date().toLocaleString()}
                    </div>
                </div>
                <div class="footer">
                    Banking ML Observability Dashboard<br>
                    This is an automated alert. Please check your dashboard for more details.
                </div>
            </div>
        </body>
        </html>
        `;
    }
}

module.exports = AlertService;