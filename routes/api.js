const express = require('express');
const router = express.Router();
const requireApiKey = require('../middleware/apiKey');

// Example protected endpoint
router.get('/private', requireApiKey, (req, res) => {
    res.json({ ok: true, message: 'Protected API endpoint', apiKey: !!req.apiKey });
});

module.exports = router;
