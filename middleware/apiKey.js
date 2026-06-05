const logger = require('../logger');

// Middleware to require a valid API key in `x-api-key` header or `api_key` query
module.exports = function requireApiKey(req, res, next) {
    const key = req.header('x-api-key') || req.query.api_key;
    const raw = process.env.API_KEYS || '';
    const allowed = raw.split(',').map(k => k.trim()).filter(Boolean);

    if (!key) {
        logger.warn(`API access denied: missing key from IP ${req.ip}`);
        return res.status(401).json({ error: 'API key required' });
    }

    if (allowed.length === 0) {
        logger.error('API access attempted but no API_KEYS configured');
        return res.status(503).json({ error: 'API keys not configured on server' });
    }

    if (!allowed.includes(key)) {
        logger.warn(`Invalid API key attempt from IP ${req.ip}`);
        return res.status(403).json({ error: 'Invalid API key' });
    }

    req.apiKey = key;
    next();
};
