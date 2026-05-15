const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const helmet = require('helmet');
const authRoutes = require('./routes/auth');
const logger = require('./logger');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/user_management_system';

// Security Middleware
app.use(helmet());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'user-management-secret',
        resave: false,
        saveUninitialized: false
    })
);

// Routes
app.use('/', authRoutes);

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