# Penetration Testing Guide

## Basic Security Testing for User Management System

### 1. Setup & Prerequisites
- Node.js and npm installed
- Application running on localhost:3000
- MongoDB database running
- Browser developer tools (F12)
- Text editor for testing payloads

### 2. Input Validation Testing

#### Email Validation Tests
```
Test Cases:
1. Empty email: Leave email field blank
   Expected: Error message "Email and password are required"

2. Invalid email format: test@invalid, user@, @domain.com
   Expected: Error message "Invalid email format"

3. SQL injection attempt: admin' OR '1'='1
   Expected: Error message "Invalid email format"

4. XSS payload: <script>alert('XSS')</script>@test.com
   Expected: Error message "Invalid email format"
```

#### Password Validation Tests
```
Test Cases:
1. Empty password: Leave password field blank
   Expected: Error message "Email and password are required"

2. Weak password: 12345 (less than 6 characters)
   Expected: Error message "Password must be at least 6 characters long"

3. Valid password: SecurePass123
   Expected: Account created successfully
```

### 3. Authentication Testing

#### Brute Force Protection Testing
```
Test Multiple Failed Logins:
1. Try login with correct email but wrong password (repeat 10+ times)
2. Observe application behavior
3. Check security.log for failed attempts
4. Note: Current implementation does not have rate limiting
   Recommendation: Implement fail2ban or express-rate-limit
```

#### Session Testing
```
Test Case 1 - Session Fixation:
1. Login and note session ID in cookies
2. Try to use same session ID in different browser
3. Expected: Session should be tied to user ID

Test Case 2 - Session Hijacking:
1. Login and copy session cookie
2. Open incognito window and set same cookie
3. Expected: Access to profile should not be possible
```

### 4. Injection Attack Testing

#### SQL Injection Attempts
```
Email field attempts:
- ' OR '1'='1
- admin' --
- ' UNION SELECT * FROM users --

Expected: All blocked by email validation
Note: Using Mongoose ODM prevents SQL injection
```

#### NoSQL Injection
```
Example payload attempt:
{"$ne": null}

Expected: Treated as invalid email format
```

### 5. XSS (Cross-Site Scripting) Testing

#### Stored XSS
```
Test Case 1 - Email Field:
Payload: <img src=x onerror=alert('XSS')>
Expected: Rejected as invalid email

Test Case 2 - Profile Display:
If XSS somehow bypassed, check if escapeHtml() prevents execution
```

#### Reflected XSS
```
Test direct URL parameters:
/signup?email=<script>alert('XSS')</script>
Expected: Not vulnerable (form-based submission)
```

### 6. Authentication Bypass Testing

#### Direct URL Access
```
Test Case - Access protected routes:
1. Access /profile without login
2. Expected: Redirect to /login
3. Try accessing /profile with manipulated session
4. Expected: Session validation failure
```

#### JWT Token Testing
```
Test Case 1 - Modified JWT:
1. Get token from login
2. Modify token payload
3. Use modified token in session
4. Expected: Token should be validated

Test Case 2 - Expired Token:
1. Use old token
2. Expected: Should be rejected (if expiration implemented)
```

### 7. Password Security Testing

#### Plaintext Password Storage Test
```
1. Login with account
2. Check database directly
3. Expected: Passwords should be hashed (bcrypt format)
4. Hash should start with $2a$, $2b$, $2x$, or $2y$
```

#### Password Comparison Test
```
1. Login with correct password: Success
2. Login with incorrect password: Failure with generic error
3. Login with password variation: Failure
4. Expected: No timing attack vulnerability
```

### 8. Session Management Testing

#### Cookie Attributes
```
Check browser cookies for login session:
1. HttpOnly flag: Should be set (not accessible via JavaScript)
2. Secure flag: Should be set in production (HTTPS only)
3. SameSite flag: Should be set to prevent CSRF

Commands:
- Open DevTools (F12)
- Go to Application > Cookies
- Inspect session cookie attributes
```

### 9. Logging Verification

#### Check Security Logs
```
View logs during security testing:

File: security.log
1. User registration events
2. Login attempts (successful and failed)
3. Profile updates
4. Invalid input attempts

Commands:
tail -f security.log          # Watch log in real-time
grep "Failed login" security.log
grep "Invalid email" security.log
```

### 10. HTTP Security Headers

#### Test Security Headers
```
Using curl or browser tools:
curl -i http://localhost:3000/

Expected headers (from Helmet.js):
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 0
- Strict-Transport-Security: (in production with HTTPS)
- Content-Security-Policy: (configured by Helmet)
```

### 11. Error Handling Testing

#### Information Leakage
```
Test Case 1 - Login with non-existent email:
Response: "Invalid email or password" (generic, safe)

Test Case 2 - Database error simulation:
Expected: Generic error message, details in logs only

Test Case 3 - Invalid input:
Expected: Specific validation error, no stack traces exposed
```

### 12. Privilege Testing

#### Horizontal Privilege Escalation
```
Test Case 1 - Access another user's profile:
1. Login as user1
2. Modify session userId to user2's ID
3. Expected: Should not access user2's data

Test Case 2 - Direct URL manipulation:
1. Try accessing /profile of another user
2. Expected: Session validation should prevent access
```

### 13. Common Vulnerabilities Checklist

```
OWASP Top 10 - Testing Status:
- [x] A01: Broken Access Control - Protected routes verified
- [x] A02: Cryptographic Failures - Passwords hashed with bcrypt
- [x] A03: Injection - Input validation + Mongoose ORM
- [x] A04: Insecure Design - Follows security patterns
- [x] A05: Security Misconfiguration - Helmet headers enabled
- [x] A06: Vulnerable Components - Regular npm audit recommended
- [x] A07: Authentication Failures - Session + JWT implemented
- [x] A08: Software/Data Integrity - Dependencies from npm registry
- [x] A09: Logging Failures - Winston logging implemented
- [x] A10: SSRF - N/A for this application
```

### 14. Automated Testing Tools

#### OWASP ZAP
```
1. Download OWASP ZAP
2. Start application: npm start
3. Run ZAP scan on http://localhost:3000
4. Review reported vulnerabilities
5. Fix issues and re-scan
```

#### npm Audit
```
Commands:
npm audit                    # Check for vulnerable dependencies
npm audit fix              # Automatically fix vulnerabilities
npm audit fix --force      # Force fix breaking changes
```

#### Nmap Security Scanning
```
Commands:
nmap -p 3000 localhost     # Check if port is open
nmap -A localhost          # Aggressive scan
nmap -sV localhost         # Service version detection
```

### 15. Testing Results Log Template

```
Date: [Date]
Tester: [Name]
System: User Management System v3 
Environment: Development

Vulnerability Found:
- Type: [e.g., XSS, SQL Injection]
- Severity: [Critical/High/Medium/Low]
- Location: [Route/Component]
- Payload Used: [Testing payload]
- Impact: [Potential impact]
- Status: [Fixed/Acknowledged/In Progress]
- Fix Implemented: [Description]

Passed Tests:
- Input validation working
- Password hashing confirmed
- Session protection verified
- Error messages generic
- Logging functional
```

### 16. Performance & Stress Testing

```
Test with Apache Bench:
ab -n 1000 -c 10 http://localhost:3000/login

Test concurrent connections:
- Monitor server response
- Check for memory leaks
- Verify logging performance
```

### Recommendations for Production

1. **Implement Rate Limiting**
   ```javascript
   const rateLimit = require('express-rate-limit');
   ```

2. **Enable HTTPS/TLS**
   ```
   Use nginx reverse proxy or AWS/Heroku with SSL
   ```

3. **Configure CORS**
   ```javascript
   const cors = require('cors');
   app.use(cors());
   ```

4. **Set up Web Application Firewall**
   ```
   Use AWS WAF or similar service
   ```

5. **Regular Security Audits**
   ```
   Schedule quarterly penetration testing
   ```

