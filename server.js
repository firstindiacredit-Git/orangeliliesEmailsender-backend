const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Verify email configuration
console.log('Email Configuration:', {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE,
    user: process.env.EMAIL_USER ? 'Set' : 'Not Set',
    pass: process.env.EMAIL_PASS ? 'Set' : 'Not Set'
});

// Create a transporter for sending emails using SMTP
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    },
    debug: true, // Enable debug logging
    logger: true // Enable logger
});

// Verify SMTP connection
transporter.verify(function(error, success) {
    if (error) {
        console.error('SMTP Connection Error:', error);
    } else {
        console.log('SMTP Server is ready to take our messages');
    }
});

app.get('/', (req, res) => {
    res.send('Hello World');
});
// Email subscription endpoint
app.post('/api/subscribe', async (req, res) => {
    try {
        const { email } = req.body;
        console.log('Received subscription request for:', email);

        if (!email) {
            console.log('No email provided in request');
            return res.status(400).json({ error: 'Email is required' });
        }

        // Send email to info@orangelilies.com
        const mailOptions = {
            from: `"Orange Lilies" <${process.env.EMAIL_USER}>`,
            to: 'info@orangelilies.com',
            subject: 'New Newsletter Subscription',
            text: `New subscription from: ${email}`,
            html: `
                <h2>New Newsletter Subscription</h2>
                <p>A new user has subscribed to the newsletter:</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            `
        };

        console.log('Attempting to send notification email...');
        await transporter.sendMail(mailOptions);
        console.log('Notification email sent successfully');

        // Send confirmation email to subscriber
        const confirmationMailOptions = {
            from: `"Orange Lilies" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Welcome to Orange Lilies Newsletter!',
            html: `
                <h2>Welcome to Orange Lilies!</h2>
                <p>Thank you for subscribing to our newsletter. You'll be the first to know about:</p>
                <ul>
                    <li>New product launches</li>
                    <li>Special offers and discounts</li>
                    <li>Period care tips and advice</li>
                    <li>Community updates</li>
                </ul>
                <p>Stay tuned for our next update!</p>
                <p>Best regards,<br>The Orange Lilies Team</p>
            `
        };

        console.log('Attempting to send confirmation email...');
        await transporter.sendMail(confirmationMailOptions);
        console.log('Confirmation email sent successfully');

        res.status(200).json({ message: 'Subscription successful' });
    } catch (error) {
        console.error('Detailed subscription error:', {
            message: error.message,
            stack: error.stack,
            code: error.code,
            command: error.command
        });
        res.status(500).json({ 
            error: 'Failed to process subscription',
            details: error.message 
        });
    }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        console.log('Received contact form submission:', { name, email, subject });

        if (!name || !email || !subject || !message) {
            console.log('Missing required fields in contact form');
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Send email to info@orangelilies.com
        const mailOptions = {
            from: `"Orange Lilies Contact Form" <${process.env.EMAIL_USER}>`,
            to: 'info@orangelilies.com',
            subject: `Contact Form: ${subject}`,
            text: `New contact form submission:\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage: ${message}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            `
        };

        console.log('Attempting to send contact form email...');
        await transporter.sendMail(mailOptions);
        console.log('Contact form email sent successfully');

        // Send confirmation email to the user
        const confirmationMailOptions = {
            from: `"Orange Lilies" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Thank you for contacting Orange Lilies',
            html: `
                <h2>Thank you for contacting Orange Lilies!</h2>
                <p>Dear ${name},</p>
                <p>We have received your message and will get back to you as soon as possible.</p>
                <p>Here's a copy of your message:</p>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p><strong>Subject:</strong> ${subject}</p>
                    <p><strong>Message:</strong></p>
                    <p>${message}</p>
                </div>
                <p>Best regards,<br>The Orange Lilies Team</p>
            `
        };

        console.log('Attempting to send confirmation email...');
        await transporter.sendMail(confirmationMailOptions);
        console.log('Confirmation email sent successfully');

        res.status(200).json({ message: 'Message sent successfully' });
    } catch (error) {
        console.error('Detailed contact form error:', {
            message: error.message,
            stack: error.stack,
            code: error.code,
            command: error.command
        });
        res.status(500).json({ 
            error: 'Failed to send message',
            details: error.message 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok',
        emailConfig: {
            host: process.env.SMTP_HOST ? 'Set' : 'Not Set',
            port: process.env.SMTP_PORT ? 'Set' : 'Not Set',
            user: process.env.EMAIL_USER ? 'Set' : 'Not Set',
            pass: process.env.EMAIL_PASS ? 'Set' : 'Not Set'
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 