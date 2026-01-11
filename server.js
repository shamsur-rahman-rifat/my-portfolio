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
app.get('/', (req, res) => res.render('index', { 
    title: 'Best Web Developer in Bangladesh | Shamsur Rifat', 
    description: 'Top-rated web developer providing custom MERN stack solutions. I build fast, secure, and scalable websites for businesses worldwide. Hire me today.',
    page: 'home' 
}));
app.get('/about', (req, res) => res.render('about', { 
    title: 'Expert Web Developer Bangladesh | About S. Rifat', 
    description: 'Skilled web developer from Bangladesh with a passion for coding. I create dynamic, responsive user interfaces and robust backends. Meet your dev.',
    page: 'about' 
}));
app.get('/contact', (req, res) => res.render('contact', { 
    title: 'Hire Web Developer in Bangladesh | Get in Touch', 
    description: 'Need a reliable web developer in Bangladesh? Get efficient, quality web solutions tailored to your needs. Let\'s discuss your project requirements.',
    page: 'contact' 
}));
app.get('/terms', (req, res) => res.render('terms', { 
    title: 'Terms & Conditions | Shamsur Rahman Rifat', 
    description: 'Terms and conditions for Shamsur Rahman Rifat\'s portfolio website.',
    page: 'terms' 
}));
app.get('/privacy', (req, res) => res.render('privacy', { 
    title: 'Privacy Policy | Shamsur Rahman Rifat', 
    description: 'Privacy policy outlining how user data is handled on Shamsur Rahman Rifat\'s portfolio.',
    page: 'privacy' 
}));

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
