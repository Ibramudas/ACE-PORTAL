const express = require('express');
const app = express();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Database connection settings
const dbHost = 'localhost';
const dbUser = 'root';
const dbPassword = 'intellectrix08';
const dbDatabase = 'ACE_PORTAL';

const db = mysql.createPool({
  host: dbHost,
  user: dbUser,
  password: dbPassword,
  database: dbDatabase,
});

// Middleware
app.use(express.json());

// Registration endpoint
app.post('/register', async (req, res) => {
    const { Name, email, phoneNumber, Password } = req.body;

    if (!Name || !email || !Password) {
        return res.status(400).json({ message: 'Please fill out all fields' });
    }

    // Check if user already exists
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(Password, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Insert user into database
        await db.query('INSERT INTO users SET ?', { Name, email, phoneNumber, Password: hashedPassword, verificationToken });

        // Send verification email
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: 'your-email@gmail.com', // Replace with your email
                pass: 'your-app-password',    // Use an app-specific password if using Gmail
            },
        });
    
        const verificationLink = 'http://localhost:3000/verify-email?token=${verificationToken}';
    
        await transporter.sendMail({
            from: '"Brain Academy" <your-email@gmail.com>',
            to: email,
            subject: 'Verify Your Email',
            html: `<p>Hello ${Name},</p>
                   <p>Please verify your email by clicking the link below:</p>
                   <a href="${verificationLink}">Verify Email</a>`,
        });
    
        res.status(200).json({ message: 'User registered successfully. Please check your email to verify your account.' });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Email verification route
app.get('/verify-email', async (req, res) => {
    const token = req.query.token;

    try {
        const [rows] = await db.query('SELECT * FROM users WHERE verificationToken = ?', [token]);

        if (rows.length === 0) {
            return res.status(400).send('Invalid or expired verification token');
        }

        await db.query('UPDATE users SET verificationToken = NULL, isVerified = 1 WHERE verificationToken = ?', [token]);

        res.send('Email verified successfully. You can now log in.');
    } catch (error) {
        console.error('Verification Error:', error);
        res.status(500).send('Server error');
    }
});

// Login route
app.post('/login', async (req, res) => {
    const { Name, Password } = req.body;  // Use email for login instead of Name
    
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE Name = ?', [Name]);

        if (rows.length === 0) {
            return res.status(400).json({ message: 'Invalid Name or password' });
        }

        const user = rows[0];

        if (!user.isVerified) {
            return res.status(403).json({ message: 'Please verify your Name before logging in' });
        }

        const isMatch = await bcrypt.compare(Password, user.Password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        res.status(200).json({ message: 'User logged in successfully' });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on http://localhost:${PORT}");
});