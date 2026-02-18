/**
 * Quick Email Test Script
 * Run this to test if your email configuration is working
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
    console.log('🧪 Testing Email Configuration...\n');
    
    // Check if credentials are set
    if (!process.env.GMAIL_USER || process.env.GMAIL_APP_PASSWORD === 'your-app-password-here') {
        console.error('❌ ERROR: Gmail credentials not configured!');
        console.log('\n📝 Please follow these steps:');
        console.log('1. Enable 2FA on yamrajsingh1042@gmail.com');
        console.log('2. Generate an App Password');
        console.log('3. Update GMAIL_APP_PASSWORD in Backend/.env');
        console.log('\nSee GMAIL_SETUP_GUIDE.md for detailed instructions.');
        process.exit(1);
    }

    console.log('📧 From:', process.env.GMAIL_USER);
    console.log('📬 To:', process.env.DEFAULT_ALERT_EMAIL);
    console.log('\n⏳ Sending test email...\n');

    // Create transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    });

    // Email content
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: process.env.DEFAULT_ALERT_EMAIL,
        subject: '🚨 Test Alert - AegisAI Banking Dashboard',
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
                .content { padding: 30px; }
                .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
                .alert-icon { font-size: 48px; margin-bottom: 10px; }
                .success-badge { background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="alert-icon">✅</div>
                    <h1>Email System Test</h1>
                </div>
                <div class="content">
                    <div class="success-badge">✓ Configuration Successful</div>
                    
                    <h2>Your alert system is working!</h2>
                    
                    <p>This is a test email from your AegisAI Banking ML Observability Dashboard.</p>
                    
                    <p><strong>Configuration Details:</strong></p>
                    <ul>
                        <li>Sender: ${process.env.GMAIL_USER}</li>
                        <li>Recipient: ${process.env.DEFAULT_ALERT_EMAIL}</li>
                        <li>Time: ${new Date().toLocaleString()}</li>
                    </ul>
                    
                    <p><strong>What happens next?</strong></p>
                    <p>Your system will now automatically send alerts when:</p>
                    <ul>
                        <li>Model accuracy drops below 70%</li>
                        <li>System resources exceed 80%</li>
                        <li>API response time exceeds 1 second</li>
                        <li>LLM costs exceed daily limits</li>
                        <li>High hallucination rates detected</li>
                    </ul>
                    
                    <p style="margin-top: 30px; padding: 15px; background: #f0f9ff; border-left: 4px solid #3b82f6;">
                        <strong>💡 Tip:</strong> Alerts are checked every 5 minutes with a 5-minute cooldown to prevent spam.
                    </p>
                </div>
                <div class="footer">
                    AegisAI Banking ML Observability Dashboard<br>
                    Automated Alert System - Test Email
                </div>
            </div>
        </body>
        </html>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ SUCCESS! Email sent successfully!');
        console.log('📨 Message ID:', info.messageId);
        console.log('\n📬 Check the inbox of:', process.env.DEFAULT_ALERT_EMAIL);
        console.log('💡 Don\'t forget to check spam/junk folder if you don\'t see it!\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ ERROR: Failed to send email\n');
        console.error('Error details:', error.message);
        
        if (error.message.includes('Invalid login')) {
            console.log('\n🔧 Troubleshooting:');
            console.log('1. Make sure 2FA is enabled on yamrajsingh1042@gmail.com');
            console.log('2. Generate a new App Password (not your regular password)');
            console.log('3. Update GMAIL_APP_PASSWORD in Backend/.env');
            console.log('4. Remove any spaces from the app password');
        }
        
        console.log('\n📖 See GMAIL_SETUP_GUIDE.md for help\n');
        process.exit(1);
    }
}

// Run the test
testEmail();
