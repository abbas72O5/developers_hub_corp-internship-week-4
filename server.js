const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const logger = require('./logger');
const app = express();


const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/user_management_system';
// Trust proxy when behind a reverse proxy (affects secure cookies)
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

// Security Middleware
app.use(helmet());

// Content Security Policy - basic strong defaults
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'"],
            imgSrc: ["'self'", 'data:'],
            connectSrc: ["'self'"],
            frameAncestors: ["'none'"],
        }
    })
);

// Enable HSTS in production only
if (process.env.NODE_ENV === 'production') {
    app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }));
}

// Middleware
const corsOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'];
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true); // allow non-browser tools
        if (corsOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }
        return callback(new Error('CORS policy violation'));
    },
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session hardening
app.use(
    session({
        name: process.env.SESSION_NAME || 'sessionId',
        secret: process.env.SESSION_SECRET || 'user-management-secret',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            sameSite: 'lax',
        }
    })
);

// Rate limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.API_RATE_LIMIT) || 100,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Rate limit exceeded for IP ${req.ip}`);
        res.status(429).json({ error: 'Too many requests, please try again later.' });
    }
});

// Stricter limiter for auth endpoints to mitigate brute-force
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: parseInt(process.env.AUTH_RATE_LIMIT) || 6,
    message: 'Too many authentication attempts. Try again later.'
});

// Apply API limiter to /api routes
app.use('/api', apiLimiter);

// Apply auth limiter to signup/login routes (mounted before routes)
app.use(['/login', '/signup'], authLimiter);

// Routes
app.use('/', authRoutes);
app.use('/api', apiRoutes);

async function startServer() {
    try {
        await mongoose.connect(MONGO_URI);
        logger.info('MongoDB connected successfully');

        app.listen(PORT, () => {
            logger.info(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        logger.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
}

startServer();