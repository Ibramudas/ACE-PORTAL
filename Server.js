const express = require('express');
const app = express();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
// Serve static files from the current directory
app.use(express.static(__dirname));

// Database connection settings
const dbHost = 'localhost';
const dbUser = 'root';
const dbPassword = 'intellectrix08';
const dbDatabase = 'ACE_PORTAL';

// Create a MySQL connection pool
const db = mysql.createPool({
  host: dbHost,
  user: dbUser,
  password: dbPassword,
  database: dbDatabase,
  authPlugins: {
    mysql_native_password: () => {
      return new mysql.authPlugins.NativePasswordAuth();
    },
  },
});


app.use(express.json());

// Registration endpoint
app.post('/register', (req, res) => {
    const { Name, email, Number, Password } = req.body;

    // Validate form data
    if (!Name || !email || !Password) {
        res.status(400).json({ message: 'Please fill out all fields' });
        return;
    }

    // Check if user already exists
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, results) => {
        if (err) {
            res.status(500).json({ message: 'Error checking for existing user' });
            return;
        }

        if (results.length > 0) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        // Hash password
        const hashedPassword = bcrypt.hashSync(password, 10);

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Insert user into database
        const insertQuery = 'INSERT INTO users SET ?';
        db.query(insertQuery, { Name, email, Number, Password: hashedPassword, verificationToken }, (err, results) => {
            if (err) {
                res.status(500).json({ message: 'Error creating user' });
                return;
            }

            // Send verification email
            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: 'your_email@gmail.com',
                    pass: 'your_password'
                }
            });

            const mailOptions = {
                from: 'your_email@gmail.com',
                to: email,
                subject: 'Verify your email address',
                text: `Click the following link to verify your email address: http://localhost:3000/verify-email/${verificationToken}`
            };

            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.error(err);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });

            res.json({ message: 'User created successfully' });
        });
    });
});

// Verify email endpoint
app.get('/verify-email/:token', (req, res) => {
    const token = req.params.token;

    // Update user verification status
    const query = 'UPDATE users SET verified = 1 WHERE verificationToken = ?';
    db.query(query, [token], (err, results) => {
        if (err) {
            res.status(500).json({ message: 'Error verifying email' });
            return;
        }

        res.json({ message: 'Email verified successfully' });
    });
});

// Login endpoint
app.post('/login', (req, res) => {
    const { Name, Password } = req.body;

    // Validate form data
    if (!email || !Password) {
        res.status(400).json({ message: 'Please fill out all fields' });
        return;
    }

    // Check if user exists
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, results) => {
        if (err) {
            res.status(500).json({ message: 'Error checking for existing user' });
            return;
        }

        if (results.length === 0) {
            res.status(400).json({ message: 'User does not exist' });
            return;
        }

        // Compare passwords
        const user = results[0];
        const isValidPassword = bcrypt.compareSync(Password, user.password);

        if (!isValidPassword) {
            res.status(400).json({ message: 'Invalid password' });
            return;
        }

        res.json({ message: 'Login successful' });
    });
});

// Password reset endpoint
app.post('/reset-password', (req, res) => {
    const { email } = req.body;

    // Validate form data
    if (!email) {
        res.status(400).json({ message: 'Please provide email' });
        return;
    }

    // Check if user exists
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, results) => {
        if (err) {
            
            res.status(500).json({ message: 'Error checking for existing user' });
                        return;
                    }
            
                    if (results.length === 0) {
                        res.status(400).json({ message: 'User does not exist' });
                        return;
                    }
            
                    // Generate password reset token
                    const resetToken = crypto.randomBytes(32).toString('hex');
            
                    // Update user password reset token
                    const updateQuery = 'UPDATE users SET resetToken = ? WHERE email = ?';
                    db.query(updateQuery, [resetToken, email], (err, results) => {
                        if (err) {
                            res.status(500).json({ message: 'Error generating password reset token' });
                            return;
                        }
            
                        // Send password reset email
                        const transporter = nodemailer.createTransport({
                            host: 'smtp.gmail.com',
                            port: 587,
                            secure: false,
                            auth: {
                                user: 'your_email@gmail.com',
                                pass: 'your_password'
                            }
                        });
            
                        const mailOptions = {
                            from: 'your_email@gmail.com',
                            to: email,
                            subject: 'Reset your password',
                            text: `Click the following link to reset your password: http://localhost:3000/reset-password/${resetToken}`
                        };
            
                        transporter.sendMail(mailOptions, (err, info) => {
                            if (err) {
                                console.error(err);
                            } else {
                                console.log('Email sent: ' + info.response);
                            }
                        });
            
                        res.json({ message: 'Password reset email sent successfully' });
                    });
                });
            });
            
            // Reset password endpoint
            app.post('/reset-password/:token', (req, res) => {
                const token = req.params.token;
                const { Password } = req.body;
            
                // Validate form data
                if (!password) {
                    res.status(400).json({ message: 'Please provide password' });
                    return;
                }
            
                // Check if user exists
                const query = 'SELECT * FROM users WHERE resetToken = ?';
                db.query(query, [token], (err, results) => {
                    if (err) {
                        res.status(500).json({ message: 'Error checking for existing user' });
                        return;
                    }
            
                    if (results.length === 0) {
                        res.status(400).json({ message: 'Invalid password reset token' });
                        return;
                    }
            
                    // Hash new password
                    const hashedPassword = bcrypt.hashSync(password, 10);
            
                    // Update user password
                    const updateQuery = 'UPDATE users SET Password = ?, resetToken = NULL WHERE resetToken = ?';
                    db.query(updateQuery, [hashedPassword, token], (err, results) => {
                        if (err) {
                            res.status(500).json({ message: 'Error resetting password' });
                            return;
                        }
            
                        res.json({ message: 'Password reset successfully' });
                    });
                });
            });
            
            // Update user profile endpoint
            app.post('/update-profile', (req, res) => {
                const { email, Name } = req.body;
            
                // Validate form data
                if (!email || !Name) {
                    res.status(400).json({ message: 'Please provide email and name' });
                    return;
                }
            
                // Update user profile
                const query = 'UPDATE users SET Name = ? WHERE email = ?';
                db.query(query, [Name, email], (err, results) => {
                    if (err) {
                        res.status(500).json({ message: 'Error updating user profile' });
                        return;
                    }
            
                    res.json({ message: 'User profile updated successfully' });
                });
            });
            
            app.listen(3000, () => {
                console.log('Server listening on port 3000');
            });
            
            
            
