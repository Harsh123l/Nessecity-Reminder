// test-email.js - Standalone email test script
// Run this with: node test-email.js

const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('📧 Testing Email Configuration...\n');

// Show current configuration (hide password)
console.log('Current Configuration:');
console.log('EMAIL_USER:', process.env.EMAIL_USER || '❌ NOT SET');
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ SET (hidden)' : '❌ NOT SET');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM || '❌ NOT SET');
console.log('\n');

// Check if credentials are set
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('❌ ERROR: Email credentials not found in .env file!');
    console.log('\nMake sure your .env file has:');
    console.log('EMAIL_USER=your-email@gmail.com');
    console.log('EMAIL_PASSWORD=your-16-char-app-password');
    console.log('EMAIL_FROM=Necessity Reminder <your-email@gmail.com>');
    process.exit(1);
}

// Create transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    debug: true, // Enable debug output
    logger: true // Enable logger
});

// Verify connection
console.log('🔍 Verifying SMTP connection...\n');
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ SMTP Connection Failed!\n');
        console.error('Error Details:', error.message);
        console.log('\n📝 Common Solutions:');
        console.log('1. Make sure you are using Gmail App Password, not regular password');
        console.log('2. Enable 2-Step Verification: https://myaccount.google.com/security');
        console.log('3. Create App Password: https://myaccount.google.com/apppasswords');
        console.log('4. Check your internet connection');
        console.log('5. Temporarily disable VPN/Firewall\n');
    } else {
        console.log('✅ SMTP Connection Successful!\n');
        console.log('📨 Sending test email...\n');
        
        // Send test email
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: process.env.EMAIL_USER, // Send to yourself
            subject: '✅ Test Email - Necessity Reminder',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
                    <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
                        <h1 style="color: #667eea;">✅ Email Configuration Successful!</h1>
                        <p>If you're reading this, your email configuration is working perfectly!</p>
                        <p><strong>Configuration Details:</strong></p>
                        <ul>
                            <li>Email Service: Gmail</li>
                            <li>From: ${process.env.EMAIL_FROM}</li>
                            <li>Test Time: ${new Date().toLocaleString()}</li>
                        </ul>
                        <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666;">
                            This is a test email from your Necessity Reminder backend.
                        </p>
                    </div>
                </div>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('❌ Failed to send email!\n');
                console.error('Error:', error.message);
            } else {
                console.log('✅ Test email sent successfully!\n');
                console.log('Message ID:', info.messageId);
                console.log('Response:', info.response);
                console.log('\n📬 Check your inbox (and spam folder) for the test email!');
                console.log(`Email sent to: ${process.env.EMAIL_USER}\n`);
            }
        });
    }
});