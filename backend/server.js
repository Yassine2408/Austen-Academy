const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const csrf = require('csurf');
const validator = require('validator');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// SECURITY MIDDLEWARE SETUP
// ============================================

// Helmet for security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://www.google.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https:"],
            frameSrc: ["https://www.google.com"]
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8000',
    credentials: true,
    optionsSuccessStatus: 200
}));

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration for CSRF
app.use(session({
    secret: process.env.SESSION_SECRET || 'austen-academy-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/austen-academy'
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

// CSRF protection
const csrfProtection = csrf({
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    }
});

// Rate limiting
const contactFormLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        error: 'Trop de tentatives de contact. Veuillez réessayer dans 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        error: 'Trop de requêtes. Veuillez réessayer plus tard.'
    }
});

app.use(generalLimiter);

// ============================================
// DATABASE CONNECTION
// ============================================

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/austen-academy', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Contact submission schema
const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: 100,
        trim: true
    },
    email: {
        type: String,
        required: true,
        maxlength: 254,
        lowercase: true,
        validate: [validator.isEmail, 'Email invalide']
    },
    phone: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^(\+212|0)[567]\d{8}$/.test(v.replace(/\s/g, ''));
            },
            message: 'Numéro de téléphone marocain invalide'
        }
    },
    course: {
        type: String,
        required: true,
        enum: ['english', 'french', 'german', 'bureautique', 'soutien', 'medical', 'other']
    },
    message: {
        type: String,
        required: true,
        maxlength: 2000,
        trim: true
    },
    ipAddress: String,
    userAgent: String,
    submittedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'contacted', 'enrolled', 'spam'],
        default: 'pending'
    }
});

const Contact = mongoose.model('Contact', contactSchema);

// ============================================
// SECURITY HELPER FUNCTIONS
// ============================================

// Advanced input sanitization
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    
    return validator.escape(input)
        .trim()
        .substring(0, 1000);
}

// Validate Moroccan phone numbers
function isValidMoroccanPhone(phone) {
    const cleanPhone = phone.replace(/\s/g, '');
    return /^(\+212|0)[567]\d{8}$/.test(cleanPhone);
}

// Check for suspicious content
function containsSuspiciousContent(text) {
    const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /eval\(/i,
        /document\./i,
        /window\./i
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(text));
}

// Email configuration with TLS
const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: true,
        minVersion: 'TLSv1.2'
    }
});

// ============================================
// ROUTES
// ============================================

// Serve static files
app.use(express.static(path.join(__dirname, '../'), {
    setHeaders: (res, path) => {
        // Security headers for static files
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day cache
    }
}));

// CSRF token endpoint
app.get('/api/csrf-token', csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// Contact form submission with comprehensive security
app.post('/api/contact', contactFormLimiter, csrfProtection, async (req, res) => {
    try {
        const { name, email, phone, course, message } = req.body;

        // ============================================
        // SERVER-SIDE VALIDATION & SANITIZATION
        // ============================================

        // Validate required fields
        if (!name || !email || !phone || !course || !message) {
            return res.status(400).json({
                error: 'Tous les champs sont obligatoires'
            });
        }

        // Sanitize inputs
        const sanitizedData = {
            name: sanitizeInput(name),
            email: validator.normalizeEmail(email),
            phone: phone.replace(/\s/g, ''),
            course: sanitizeInput(course),
            message: sanitizeInput(message)
        };

        // Advanced validation
        if (!validator.isLength(sanitizedData.name, { min: 2, max: 100 })) {
            return res.status(400).json({
                error: 'Le nom doit contenir entre 2 et 100 caractères'
            });
        }

        if (!validator.isEmail(sanitizedData.email)) {
            return res.status(400).json({
                error: 'Adresse email invalide'
            });
        }

        if (!isValidMoroccanPhone(sanitizedData.phone)) {
            return res.status(400).json({
                error: 'Numéro de téléphone marocain invalide'
            });
        }

        if (!validator.isLength(sanitizedData.message, { min: 10, max: 2000 })) {
            return res.status(400).json({
                error: 'Le message doit contenir entre 10 et 2000 caractères'
            });
        }

        // Check for suspicious content
        const allContent = `${sanitizedData.name} ${sanitizedData.message}`;
        if (containsSuspiciousContent(allContent)) {
            return res.status(400).json({
                error: 'Contenu suspect détecté'
            });
        }

        // ============================================
        // SAVE TO DATABASE
        // ============================================

        const contactSubmission = new Contact({
            ...sanitizedData,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        await contactSubmission.save();

        // ============================================
        // SECURE EMAIL SENDING
        // ============================================

        const emailHTML = `
            <div style="font-family: 'Montserrat', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
                <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0, 74, 173, 0.1);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h2 style="color: #004aad; margin: 0;">Nouvelle Demande de Contact</h2>
                        <p style="color: #666; margin: 5px 0;">Austen Academy - Centre de Formation</p>
                    </div>
                    
                    <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                        <h3 style="color: #004aad; margin-top: 0;">Informations du Contact</h3>
                        <p><strong>Nom:</strong> ${sanitizedData.name}</p>
                        <p><strong>Email:</strong> ${sanitizedData.email}</p>
                        <p><strong>Téléphone:</strong> ${sanitizedData.phone}</p>
                        <p><strong>Formation souhaitée:</strong> ${sanitizedData.course}</p>
                    </div>
                    
                    <div style="background: white; padding: 20px; border-left: 4px solid #d4af37; margin-bottom: 20px;">
                        <h3 style="color: #004aad; margin-top: 0;">Message</h3>
                        <p style="line-height: 1.6;">${sanitizedData.message}</p>
                    </div>
                    
                    <div style="background: #f0f8ff; padding: 15px; border-radius: 8px; font-size: 12px; color: #666;">
                        <p><strong>Détails techniques:</strong></p>
                        <p>IP: ${req.ip}</p>
                        <p>Navigateur: ${req.get('User-Agent')}</p>
                        <p>Date: ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Casablanca' })}</p>
                    </div>
                </div>
            </div>
        `;

        const mailOptions = {
            from: `"Austen Academy Contact" <${process.env.SMTP_USER}>`,
            to: process.env.CONTACT_EMAIL || 'info@austenacademymaroc.com',
            subject: `Nouvelle demande de contact - ${sanitizedData.course}`,
            html: emailHTML,
            text: `
                Nouvelle demande de contact - Austen Academy
                
                Nom: ${sanitizedData.name}
                Email: ${sanitizedData.email}
                Téléphone: ${sanitizedData.phone}
                Formation: ${sanitizedData.course}
                
                Message:
                ${sanitizedData.message}
                
                IP: ${req.ip}
                Date: ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Casablanca' })}
            `
        };

        await transporter.sendMail(mailOptions);

        // ============================================
        // SUCCESS RESPONSE
        // ============================================

        res.status(200).json({
            success: true,
            message: 'Votre demande a été envoyée avec succès. Nous vous contacterons bientôt!'
        });

    } catch (error) {
        console.error('Contact form error:', error);
        
        // Don't expose internal errors to client
        res.status(500).json({
            error: 'Une erreur est survenue. Veuillez réessayer plus tard.'
        });
    }
});

// ============================================
// ADMIN ROUTES (Protected)
// ============================================

// Admin authentication middleware
const adminAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token d\'authentification requis' });
    }
    
    const token = authHeader.substring(7);
    const validToken = process.env.ADMIN_TOKEN || 'admin-token-change-this';
    
    if (token !== validToken) {
        return res.status(403).json({ error: 'Token invalide' });
    }
    
    next();
};

// Get contact submissions (admin only)
app.get('/api/admin/contacts', adminAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const contacts = await Contact.find()
            .sort({ submittedAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('-__v');

        const total = await Contact.countDocuments();

        res.json({
            contacts,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Admin contacts error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Update contact status (admin only)
app.patch('/api/admin/contacts/:id/status', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'contacted', 'enrolled', 'spam'].includes(status)) {
            return res.status(400).json({ error: 'Statut invalide' });
        }

        const contact = await Contact.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!contact) {
            return res.status(404).json({ error: 'Contact non trouvé' });
        }

        res.json({ success: true, contact });
    } catch (error) {
        console.error('Update contact status error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ============================================
// HEALTH CHECK & MONITORING
// ============================================

app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint non trouvé'
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error:', error);
    
    // Don't expose internal errors in production
    if (process.env.NODE_ENV === 'production') {
        res.status(500).json({
            error: 'Erreur interne du serveur'
        });
    } else {
        res.status(500).json({
            error: error.message,
            stack: error.stack
        });
    }
});

// ============================================
// SERVER STARTUP
// ============================================

app.listen(PORT, () => {
    console.log(`🚀 Austen Academy Backend Server running on port ${PORT}`);
    console.log(`🔒 Security: ${process.env.NODE_ENV === 'production' ? 'Production' : 'Development'} mode`);
    console.log(`📧 Email: ${process.env.SMTP_USER ? 'Configured' : 'Not configured'}`);
    console.log(`🗄️  Database: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    mongoose.connection.close();
    process.exit(0);
});

module.exports = app;
