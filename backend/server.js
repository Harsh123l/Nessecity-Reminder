// server.js - Main backend server file with Email Notifications
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'necessity_reminder'
});

db.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed:', err);
        return;
    }
    console.log('✅ Connected to MySQL database');
});

// ==================== EMAIL CONFIGURATION ====================

// Create email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Verify email configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email configuration error:', error);
    } else {
        console.log('✅ Email server is ready to send messages');
    }
});

// Function to send email reminder
async function sendReminderEmail(userEmail, userName, reminder) {
    const categoryEmojis = {
        medicine: '💊',
        workout: '🏋️',
        meeting: '📅',
        other: '📌'
    };

    const mailOptions = {
        from: process.env.EMAIL_FROM || 'Necessity Reminder',
        to: userEmail,
        subject: `⏰ Reminder: ${reminder.title}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                              color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .reminder-box { background: white; padding: 20px; border-radius: 8px; 
                                   border-left: 4px solid #667eea; margin: 20px 0; }
                    .category { display: inline-block; padding: 5px 15px; background: #667eea; 
                               color: white; border-radius: 20px; font-size: 14px; }
                    .time { color: #666; font-size: 16px; margin: 10px 0; }
                    .notes { background: #fff3cd; padding: 15px; border-radius: 5px; 
                            margin-top: 15px; border-left: 3px solid #ffc107; }
                    .footer { text-align: center; margin-top: 20px; color: #999; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>⏰ Reminder Alert!</h1>
                    </div>
                    <div class="content">
                        <p>Hi <strong>${userName}</strong>,</p>
                        <p>This is a friendly reminder about:</p>
                        
                        <div class="reminder-box">
                            <span class="category">${categoryEmojis[reminder.category]} ${reminder.category.toUpperCase()}</span>
                            <h2 style="margin: 15px 0; color: #333;">${reminder.title}</h2>
                            <p class="time">⏰ Scheduled Time: ${new Date(reminder.reminder_time).toLocaleString()}</p>
                            ${reminder.notes ? `<div class="notes"><strong>📝 Notes:</strong><br>${reminder.notes}</div>` : ''}
                        </div>
                        
                        <p>Don't forget to complete this task!</p>
                        <p style="text-align: center; margin-top: 30px;">
                            <a href="http://localhost/necessity-reminder/dashboard.html" 
                               style="background: #667eea; color: white; padding: 12px 30px; 
                                      text-decoration: none; border-radius: 5px; display: inline-block;">
                                View Dashboard
                            </a>
                        </p>
                    </div>
                    <div class="footer">
                        <p>You received this email because you set up a reminder in Necessity Reminder app.</p>
                        <p>&copy; 2025 Necessity Reminder. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${userEmail} for reminder: ${reminder.title}`);
        return true;
    } catch (error) {
        console.error('❌ Error sending email:', error);
        return false;
    }
}

// Cron job to check for reminders every minute
cron.schedule('* * * * *', () => {
    console.log('🔍 Checking for upcoming reminders...');
    
    const now = new Date();
    const fiveMinutesLater = new Date(now.getTime() + 5 * 60000); // 5 minutes from now

    const sql = `
        SELECT r.*, u.email, u.full_name 
        FROM reminders r
        JOIN users u ON r.user_id = u.user_id
        WHERE r.reminder_time BETWEEN ? AND ?
        AND r.is_notified = FALSE
        AND r.is_completed = FALSE
    `;

    db.query(sql, [now, fiveMinutesLater], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return;
        }

        results.forEach(reminder => {
            sendReminderEmail(reminder.email, reminder.full_name, reminder);
            
            // Mark as notified
            db.query(
                'UPDATE reminders SET is_notified = TRUE WHERE reminder_id = ?',
                [reminder.reminder_id]
            );
        });

        if (results.length > 0) {
            console.log(`📧 Sent ${results.length} reminder email(s)`);
        }
    });
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// ==================== AUTH ROUTES ====================

// Signup Route
app.post('/api/auth/signup', async (req, res) => {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Database error', error: err });
            }

            if (results.length > 0) {
                return res.status(400).json({ message: 'Email already registered' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const sql = 'INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)';
            db.query(sql, [fullName, email, hashedPassword], async (err, result) => {
                if (err) {
                    return res.status(500).json({ message: 'Failed to create user', error: err });
                }

                // Send welcome email
                const welcomeMailOptions = {
                    from: process.env.EMAIL_FROM,
                    to: email,
                    subject: '🎉 Welcome to Necessity Reminder!',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                        color: white; padding: 30px; text-align: center;">
                                <h1>Welcome to Necessity Reminder! 🎉</h1>
                            </div>
                            <div style="padding: 30px; background: #f9f9f9;">
                                <h2>Hi ${fullName}!</h2>
                                <p>Thank you for signing up! Your account has been created successfully.</p>
                                <p>You can now:</p>
                                <ul>
                                    <li>💊 Set medicine reminders</li>
                                    <li>🏋️ Track your workouts</li>
                                    <li>📅 Never miss meetings</li>
                                    <li>📌 Manage all your important tasks</li>
                                </ul>
                                <p style="text-align: center; margin-top: 30px;">
                                    <a href="http://localhost/necessity-reminder/login.html" 
                                       style="background: #667eea; color: white; padding: 12px 30px; 
                                              text-decoration: none; border-radius: 5px; display: inline-block;">
                                        Login Now
                                    </a>
                                </p>
                            </div>
                        </div>
                    `
                };

                try {
                    await transporter.sendMail(welcomeMailOptions);
                    console.log(`✅ Welcome email sent to ${email}`);
                } catch (emailError) {
                    console.log('⚠️ Could not send welcome email:', emailError.message);
                }

                res.status(201).json({ 
                    message: 'User created successfully',
                    userId: result.insertId 
                });
            });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Login Route
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password required' });
    }

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = results[0];
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { userId: user.user_id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                user_id: user.user_id,
                full_name: user.full_name,
                email: user.email
            }
        });
    });
});

// ==================== REMINDER ROUTES ====================

// Get all reminders for logged-in user
app.get('/api/reminders', authenticateToken, (req, res) => {
    const userId = req.user.userId;

    const sql = `
        SELECT * FROM reminders 
        WHERE user_id = ? 
        ORDER BY reminder_time ASC
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err });
        }
        res.json(results);
    });
});

// Create new reminder
app.post('/api/reminders', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const { title, category, reminderTime, notes } = req.body;

    if (!title || !category || !reminderTime) {
        return res.status(400).json({ message: 'Title, category, and time are required' });
    }

    const sql = `
        INSERT INTO reminders (user_id, title, category, reminder_time, notes) 
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [userId, title, category, reminderTime, notes || null], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to create reminder', error: err });
        }

        res.status(201).json({
            message: 'Reminder created successfully',
            reminderId: result.insertId
        });
    });
});

// Update reminder (mark as completed)
app.patch('/api/reminders/:id/complete', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const reminderId = req.params.id;

    const sql = `
        UPDATE reminders 
        SET is_completed = TRUE, is_notified = TRUE 
        WHERE reminder_id = ? AND user_id = ?
    `;

    db.query(sql, [reminderId, userId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Reminder not found' });
        }

        res.json({ message: 'Reminder marked as completed' });
    });
});

// Delete reminder
app.delete('/api/reminders/:id', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const reminderId = req.params.id;

    const sql = 'DELETE FROM reminders WHERE reminder_id = ? AND user_id = ?';

    db.query(sql, [reminderId, userId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Reminder not found' });
        }

        res.json({ message: 'Reminder deleted successfully' });
    });
});

// Manual email test endpoint
app.post('/api/test-email', authenticateToken, async (req, res) => {
    const userId = req.user.userId;

    const sql = 'SELECT * FROM users WHERE user_id = ?';
    db.query(sql, [userId], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(500).json({ message: 'User not found' });
        }

        const user = results[0];
        const testReminder = {
            title: 'Test Reminder',
            category: 'other',
            reminder_time: new Date(),
            notes: 'This is a test email to verify email functionality.'
        };

        const emailSent = await sendReminderEmail(user.email, user.full_name, testReminder);
        
        if (emailSent) {
            res.json({ message: 'Test email sent successfully! Check your inbox.' });
        } else {
            res.status(500).json({ message: 'Failed to send test email' });
        }
    });
});

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running', emailConfigured: !!process.env.EMAIL_USER });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
    console.log(`📧 Email notifications: ${process.env.EMAIL_USER ? 'Enabled ✅' : 'Not configured ⚠️'}`);
});