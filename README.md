# DevelopersHub_CyberSecurityIntership_Tasks-Week4

**Internship Domain:** Cybersecurity  
**Project:** User Management System  
**Duration:** 1 Week (Week 4) 

# WEEK 4 — Advanced Security Hardening 
---

## **Introduction**
This week focused on advanced application hardening: rate limiting, an app-level Intrusion Detection/Lockout system (IDS), API key protection, refined CORS and CSP/HSTS policies, and session hardening. The goal was to raise resilience against automated attacks, abuse, and misconfigured clients while keeping development ergonomics.

---

## **Controls Implemented**

- **Rate Limiting**
  - Global API limiter: 100 requests / 15 minutes.
  - Auth limiter: 6 attempts / 15 minutes for `/signup` and `/login`.
  - Returns `429` with a descriptive message on limit breach.

- **App-Level IDS (Account Lockout)**
  - Fields: `failedLoginAttempts`, `lastFailedLoginAt`, `lockUntil`.
  - Logic: 5 failed attempts within a 15-minute window lock the account for the remainder of the window.
  - Login returns `423 Locked` when account is locked; successful login clears failures.

- **API Key Protection**
  - Middleware checks `x-api-key` header or `api_key` query param against `API_KEYS`.
  - Missing key: `401`; invalid key: `403`; misconfiguration: `503`.
  - Valid key attached to `req.apiKey` for downstream handlers.

- **CORS & CSP/HSTS**
  - Development: relaxed CORS (localhost allowed) and permissive CSP to ease local testing.
  - Production: strict whitelist from `CORS_ORIGINS`, strict CSP and HSTS (`maxAge=31536000`, `includeSubDomains`, `preload`).
  - Use environment variable `NODE_ENV` to toggle behavior.

- **Session Hardening**
  - `express-session` with `httpOnly: true`, `sameSite: 'lax'`, `secure: true` in production.
  - Custom session name via `SESSION_NAME`.
  - `trust proxy` enabled in production when behind a reverse proxy.

- **Logging**
  - `winston` logs security events (login attempts, lockouts, CORS violations, rate limits) to console and `security.log`.

---

## **Key Files Changed**
- `server.js` — CORS, Helmet (CSP/HSTS), rate limiters, session config, dotenv.
- `models/User.js` — IDS fields & helper methods.
- `routes/auth.js` — lockout enforcement, logging, error codes.
- `middleware/apiKey.js` — API key validation.
- `routes/api.js` — protected example endpoint.

---

## **Environment Variables**
- `NODE_ENV` (development|production)  
- `MONGO_URI`  
- `JWT_SECRET`  
- `SESSION_SECRET`  
- `SESSION_NAME`  
- `CORS_ORIGINS` (comma-separated)  
- `API_KEYS` (comma-separated)  
- `API_RATE_LIMIT`, `AUTH_RATE_LIMIT`, `LOGIN_WINDOW_MS`, `MAX_LOGIN_ATTEMPTS`

---

## **Testing & Validation**
- Manual tests:
  - Signup/login success and token issuance.
  - Trigger auth limiter: expect `429` then blocked requests.
  - Trigger IDS: 5 failed logins → `423 Locked`.
  - Protected API: valid `x-api-key` returns `200`, invalid returns `403`.
- Dev vs Prod:
  - Confirm `NODE_ENV` toggles CSP/HSTS and CORS behavior.

---

## **Outcome**
Implemented layered defenses against brute-force and automated abuse while keeping development ergonomics. Audit logs provide visibility for suspicious activity and support incident response.

---

## **Next Steps**
- Harden CSP for production and remove relaxed dev exceptions.
- Rotate secrets and ensure `.env` is excluded from source control.
- Add automated tests for lockout and rate-limiting behavior.
- Monitor `security.log` in production and configure alerting.

---

## **Conclusion**
Week 4 delivered practical, layered security improvements that reduce the attack surface against credential stuffing, brute force, and programmatic abuse, and added observability to detect and respond to incidents.onstrated the importance of secure development practices and showed how incremental fixes can transform a vulnerable application into a more resilient system.
