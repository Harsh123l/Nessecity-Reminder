-- Create Database
CREATE DATABASE IF NOT EXISTS necessity_reminder;
USE necessity_reminder;

-- Users Table
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Reminders Table
CREATE TABLE reminders (
    reminder_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    category ENUM('medicine', 'workout', 'meeting', 'other') NOT NULL,
    reminder_time DATETIME NOT NULL,
    notes TEXT,
    is_notified BOOLEAN DEFAULT FALSE,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Index for faster queries
CREATE INDEX idx_user_reminders ON reminders(user_id, reminder_time);
CREATE INDEX idx_reminder_time ON reminders(reminder_time);

-- Sample Queries (for testing)
-- Insert a user
INSERT INTO users (full_name, email, password) 
VALUES ('John Doe', 'john@example.com', 'hashed_password_here');

-- Insert a reminder
INSERT INTO reminders (user_id, title, category, reminder_time, notes) 
VALUES (1, 'Take Medicine', 'medicine', '2024-12-31 09:00:00', 'Take after breakfast');

-- Get all reminders for a user
SELECT * FROM reminders WHERE user_id = 1 ORDER BY reminder_time ASC;

-- Get upcoming reminders
SELECT * FROM reminders 
WHERE user_id = 1 
AND reminder_time > NOW() 
AND is_completed = FALSE 
ORDER BY reminder_time ASC;