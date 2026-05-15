const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.printf(({ timestamp, level, message, stack }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${message}${stack ? '\n' + stack : ''}`;
        })
    ),
    defaultMeta: { service: 'user-management-system' },
    transports: [
        // Log to console
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        // Log to file
        new winston.transports.File({ filename: path.join(__dirname, 'security.log'), level: 'info' }),
        new winston.transports.File({ filename: path.join(__dirname, 'error.log'), level: 'error' })
    ]
});

module.exports = logger;
