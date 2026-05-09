const express = require('express');
const router = express.Router();
const User = require('../models/User');
const validator = require('validator');

function escapeHtml(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function renderPage(title, body) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; background: #f5f7fb; color: #1f2937; }
        .wrap { max-width: 720px; margin: 40px auto; padding: 24px; }
        .card { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
        h1 { margin-top: 0; }
        label { display: block; margin-top: 14px; font-weight: 600; }
        input { width: 100%; padding: 10px 12px; margin-top: 6px; border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box; }
        button, .link-btn { display: inline-block; margin-top: 16px; padding: 10px 14px; border: 0; border-radius: 8px; background: #2563eb; color: #fff; text-decoration: none; cursor: pointer; }
        .muted { color: #6b7280; }
        .error { color: #b91c1c; margin-top: 12px; }
        .row { margin-top: 12px; }
        code { background: #eef2ff; padding: 2px 6px; border-radius: 6px; }
    </style>
</head>
<body>
    <div class="wrap">
        <div class="card">
            ${body}
        </div>
    </div>
</body>
</html>`;
}

function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.redirect('/login');
    }

    next();
}

router.get('/', (req, res) => {
    if (req.session.userId) {
        return res.redirect('/profile');
    }

    res.redirect('/signup');
});

router.get('/signup', (req, res) => {
    res.send(renderPage('Sign Up', `
        <h1>Create account</h1>
        <p class="muted">Register a new user with email and password.</p>
        <form method="POST" action="/signup">
            <label for="email">Email</label>
            <input id="email" name="email" type="email" required>

            <label for="password">Password</label>
            <input id="password" name="password" type="password" required>

            <button type="submit">Sign up</button>
        </form>
        <p class="row">Already have an account? <a href="/login">Log in</a></p>
    `));
});

router.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send(renderPage('Sign Up', '<h1>Create account</h1><p class="error">Email and password are required.</p><p><a href="/signup">Go back</a></p>'));
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).send(renderPage('Sign Up', '<h1>Create account</h1><p class="error">An account with that email already exists.</p><p><a href="/signup">Try again</a></p>'));
        }

        const user = new User({ email, password });
        await user.save();

        req.session.userId = user._id.toString();
        res.redirect('/profile');
    } catch (error) {
        res.status(500).send(renderPage('Sign Up', `<h1>Create account</h1><p class="error">${escapeHtml(error.message)}</p><p><a href="/signup">Try again</a></p>`));
    }
});


router.get('/login', (req, res) => {
    res.send(renderPage('Log In', `
        <h1>Log in</h1>
        <p class="muted">Use your registered email and password.</p>
        <form method="POST" action="/login">
            <label for="email">Email</label>
            <input id="email" name="email" type="email" required>

            <label for="password">Password</label>
            <input id="password" name="password" type="password" required>

            <button type="submit">Log in</button>
        </form>
        <p class="row">Need an account? <a href="/signup">Sign up</a></p>
    `));
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email, password });

        if (!user) {
            return res.status(401).send(renderPage('Log In', '<h1>Log in</h1><p class="error">Invalid email or password.</p><p><a href="/login">Try again</a></p>'));
        }

        req.session.userId = user._id.toString();
        res.redirect('/profile');
    } catch (error) {
        res.status(500).send(renderPage('Log In', `<h1>Log in</h1><p class="error">${escapeHtml(error.message)}</p><p><a href="/login">Try again</a></p>`));
    }
});


router.get('/profile', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);

        if (!user) {
            req.session.destroy(() => {
                res.redirect('/login');
            });
            return;
        }

        res.send(renderPage('Profile', `
            <h1>User profile</h1>
            <p class="muted">View and update the current account.</p>
            <p><strong>Email:</strong> <code>${escapeHtml(user.email)}</code></p>
            <p><strong>Password:</strong> <code>${escapeHtml(user.password)}</code></p>
            <form method="POST" action="/profile">
                <label for="email">Email</label>
                <input id="email" name="email" type="email" value="${escapeHtml(user.email)}" required>

                <label for="password">Password</label>
                <input id="password" name="password" type="text" value="${escapeHtml(user.password)}" required>

                <button type="submit">Update profile</button>
            </form>
            <form method="POST" action="/logout">
                <button type="submit" style="background:#475569;">Log out</button>
            </form>
        `));
    } catch (error) {
        res.status(500).send(renderPage('Profile', `<h1>User profile</h1><p class="error">${escapeHtml(error.message)}</p>`));
    }
});

router.post('/profile', requireAuth, async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findById(req.session.userId);

        if (!user) {
            return res.redirect('/login');
        }

        user.email = email;
        user.password = password;
        await user.save();

        res.redirect('/profile');
    } catch (error) {
        res.status(500).send(renderPage('Profile', `<h1>User profile</h1><p class="error">${escapeHtml(error.message)}</p><p><a href="/profile">Go back</a></p>`));
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

module.exports = router;