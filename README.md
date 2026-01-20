# 🔔 Necessity Reminder

A full-stack web application that helps you never miss important tasks like medicines, workouts, meetings, and more with timely email and browser notifications.

## ✨ Features

- 🔐 **Secure Authentication** - JWT-based user authentication
- 💊 **Medicine Reminders** - Never forget your medications
- 🏋️ **Workout Tracking** - Stay consistent with fitness goals
- 📅 **Meeting Alerts** - Be on time for important meetings
- 📧 **Email Notifications** - Get reminders via email
- 🔔 **Browser Notifications** - Real-time alerts in your browser
- 📊 **Dashboard** - Beautiful interface to manage all reminders
- 🗄️ **MySQL Database** - Secure data storage

## 🛠️ Tech Stack

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript

### Backend
- Node.js
- Express.js
- MySQL
- JWT Authentication
- Nodemailer (Email notifications)
- Node-cron (Scheduled tasks)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [MySQL](https://www.mysql.com/) (v5.7 or higher)
- [XAMPP](https://www.apachefriends.org/) (optional, for easier MySQL setup)
- Gmail account (for email notifications)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Harsh123l/Nessecity-Reminder.git
cd Nessecity-Reminder
```

### 2. Setup Database

#### Using XAMPP:
1. Start Apache and MySQL in XAMPP Control Panel
2. Open phpMyAdmin: `http://localhost/phpmyadmin`
3. Create database named `necessity_reminder`
4. Click SQL tab and run the SQL commands from `database/schema.sql`

#### Using MySQL Command Line:
```bash
mysql -u root -p
```
```sql
CREATE DATABASE necessity_reminder;
USE necessity_reminder;
-- Then run the SQL commands from database/schema.sql
```

### 3. Backend Setup

```bash
cd backend
npm install
```

### 4. Configure Environment Variables

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` file with your actual values:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=necessity_reminder

PORT=3000
JWT_SECRET=your-super-secret-key

EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
EMAIL_FROM=Necessity Reminder <your-email@gmail.com>
```

### 5. Get Gmail App Password

1. Enable 2-Step Verification: https://myaccount.google.com/security
2. Create App Password: https://myaccount.google.com/apppasswords
3. Copy the 16-character password to `.env` file

### 6. Start Backend Server

```bash
cd backend
npm start
```

You should see:
```
✅ Connected to MySQL database
✅ Email server is ready to send messages
🚀 Server running on http://localhost:3000
```

### 7. Setup Frontend

#### Option A: Using XAMPP
1. Copy `frontend` folder to `C:\xampp\htdocs\necessity-reminder\`
2. Access at: `http://localhost/necessity-reminder/index.html`

#### Option B: Using Live Server (VS Code)
1. Install "Live Server" extension in VS Code
2. Right-click `frontend/index.html`
3. Select "Open with Live Server"

#### Option C: Using Python
```bash
cd frontend
python -m http.server 8000
# Access at: http://localhost:8000
```

## 📖 Usage

1. **Sign Up**: Create a new account on the signup page
2. **Login**: Access your dashboard
3. **Add Reminders**: 
   - Fill in reminder details
   - Select category (Medicine/Workout/Meeting/Other)
   - Set date and time
   - Add optional notes
4. **Receive Notifications**:
   - Browser notifications (if permitted)
   - Email alerts (5 minutes before reminder time)

## 📁 Project Structure

```
Nessecity-Reminder/
├── frontend/
│   ├── index.html          # Landing page
│   ├── login.html          # Login page
│   ├── signup.html         # Registration page
│   └── dashboard.html      # Main dashboard
├── backend/
│   ├── server.js           # Main server file
│   ├── package.json        # Dependencies
│   ├── .env.example        # Environment template
│   └── .gitignore          # Git ignore file
├── database/
│   └── schema.sql          # Database schema
└── README.md               # This file
```

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token-based authentication
- ✅ SQL injection protection
- ✅ Environment variables for sensitive data
- ✅ CORS enabled for API security

## 🧪 Testing

### Test Email Functionality:
1. Login to dashboard
2. Click "📧 Test Email Notification" button
3. Check your email inbox

### Test Database Connection:
```bash
# In browser
http://localhost:3000/api/health
```

Expected response:
```json
{"status":"OK","message":"Server is running"}
```

## 📧 Email Features

- Welcome email on signup
- Reminder alerts 5 minutes before due time
- Beautiful HTML email templates
- Category-based icons and styling

## 🐛 Troubleshooting

### Email not sending?
1. Check Gmail App Password is correct (16 characters)
2. Verify 2-Step Verification is enabled
3. Check `.env` file configuration
4. Restart server after changing `.env`

### Database connection failed?
1. Ensure MySQL is running (green in XAMPP)
2. Check database credentials in `.env`
3. Verify database `necessity_reminder` exists

### Port already in use?
```bash
# Change PORT in .env file
PORT=3001
```

## 👨‍💻 Author

**Harsh**
- GitHub: [@Harsh123l](https://github.com/Harsh123l)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built as a college project
- Uses Nodemailer for email functionality
- Inspired by the need for better task management

## Support

For issues and questions:
- Open an issue on GitHub
- Email: omeprecisions@gmail.com

---

⭐ If you found this project helpful, please give it a star on GitHub!

**Happy Organizing! 🎉**
