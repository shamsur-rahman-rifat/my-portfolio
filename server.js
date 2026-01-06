require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const Mailjet = require('node-mailjet');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Mailjet Client
const mailjet = Mailjet.apiConnect(
    process.env.MJ_APIKEY_PUBLIC,
    process.env.MJ_APIKEY_PRIVATE
);

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', (req, res) => res.render('index', { title: 'Home', page: 'home' }));
app.get('/about', (req, res) => res.render('about', { title: 'About', page: 'about' }));
app.get('/contact', (req, res) => res.render('contact', { title: 'Contact', page: 'contact' }));
app.get('/terms', (req, res) => res.render('terms', { title: 'Terms & Conditions', page: 'terms' }));
app.get('/privacy', (req, res) => res.render('privacy', { title: 'Privacy Policy', page: 'privacy' }));

// Contact Form Handler
app.post('/contact', async (req, res) => {
    const { name, email, message } = req.body;

    try {
        const request = mailjet
            .post("send", { 'version': 'v3.1' })
            .request({
                "Messages": [
                    // 1. Email to Admin
                    {
                        "From": {
                            "Email": process.env.SENDER_EMAIL,
                            "Name": "Portfolio Contact Form"
                        },
                        "To": [
                            {
                                "Email": "shamsur30rahman@gmail.com",
                                "Name": "Shamsur Rahman Rifat"
                            }
                        ],
                        "Subject": `New Contact Form Submission from ${name}`,
                        "TextPart": `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
                        "HTMLPart": `<h3>New Message</h3><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong><br>${message}</p>`
                    },
                    // 2. Auto-reply to User
                    {
                        "From": {
                            "Email": process.env.SENDER_EMAIL,
                            "Name": "Shamsur Rahman Rifat"
                        },
                        "To": [
                            {
                                "Email": email,
                                "Name": name
                            }
                        ],
                        "Subject": "Thank you for contacting me!",
                        "HTMLPart": `
                            <h3>Hi ${name},</h3>
                            <p>Thank you for reaching out. I have received your message and will get back to you shortly.</p>
                            <p>If you are interested in discussing a professional opportunity, I would love to schedule an online meeting with you.</p>
                            <br>
                            <p>Best Regards,</p>
                            <p>Shamsur Rahman Rifat</p>
                        `
                    }
                ]
            });

        await request;
        res.send('<script>alert("Message sent successfully!"); window.location.href="/";</script>');
    } catch (error) {
        console.error(error.statusCode, error.message);
        res.send('<script>alert("Error sending message. Please try again."); window.location.href="/contact";</script>');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

module.exports = app;
