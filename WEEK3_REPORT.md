# Internship Report: Secure Web Application Development

**Internship Domain:** Cybersecurity  
**Project:** User Management System  
**Duration:** 3 Weeks  

---

## Introduction

During this internship, I worked on a web-based User Management System and improved its security across three phases. The project began as a vulnerable application in Week 1, then security measures were applied in Week 2, and finally penetration testing, logging, and final reporting were completed in Week 3.

The objective of the internship was to identify common web application vulnerabilities, apply appropriate fixes, and verify that the system became more secure and resilient against attacks.

---

## Week 1: Vulnerable Application Analysis

In the first week, I worked with the initial vulnerable version of the application. The purpose of this stage was to understand the weaknesses in the system before applying any fixes.

### Key Observations
- User inputs were not properly validated.
- Passwords were not securely protected.
- Authentication logic was weak.
- Sensitive data could be exposed in the profile page.
- Security headers were not configured.
- Logging and monitoring were not implemented.

### Outcome
This week helped establish the baseline security problems in the application and created a clear starting point for the security improvements that followed.

---

## Week 2: Security Fixes and Hardening

In the second week, I implemented security improvements to protect the application from common vulnerabilities.

### Security Measures Applied

#### 1. Input Validation
- Added email validation using the `validator` library.
- Rejected invalid or malicious input before processing.
- Prevented malformed data from being stored or used in queries.

#### 2. Password Hashing
- Used `bcrypt` to hash passwords before saving them to the database.
- Added secure password comparison during login.
- Prevented plaintext password storage.

#### 3. Token-Based Authentication
- Added basic JWT authentication using `jsonwebtoken`.
- Generated tokens after successful signup and login.
- Used token-based authentication to improve access control.

#### 4. HTTP Security Headers
- Added `helmet` middleware to secure HTTP headers.
- Improved protection against common browser-based attacks.

### Outcome
By the end of Week 2, the application was significantly more secure. The most important weaknesses from Week 1 were addressed, and the system was better protected against unauthorized access, injection attacks, and insecure password handling.

---

## Week 3: Advanced Security and Final Reporting

In the final week, I performed penetration testing, set up logging, and created a security checklist to document the application’s protection measures.

### 1. Basic Penetration Testing
I tested the application to simulate common attack scenarios.

### Tests Performed
- Attempted unauthorized access to protected pages.
- Tested broken authentication with incorrect credentials.
- Checked for session and token manipulation.
- Tested malicious input such as invalid emails and weak passwords.
- Verified whether injection-style payloads were blocked.

### Result
The application successfully resisted these basic attack attempts due to the security improvements applied in Week 2.

### 2. Basic Logging
I added logging using the `winston` library to monitor activity and support security auditing.

### Logging Features
- Console logging for real-time monitoring.
- File logging for persistent security records.
- Tracking of login attempts, registration events, profile updates, and errors.

### Example Logging Setup
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'security.log' })
  ]
});

logger.info(`Login attempt by ${username} at ${new Date().toISOString()}`);
```

### Result
The logging system made it easier to detect unusual behavior and review security-related events.

### 3. Security Checklist
I created a checklist of best practices to summarize the final state of the application.

### Checklist
- Validate all inputs.
- Hash and salt passwords before storage.
- Use token-based authentication for protected routes.
- Apply Helmet for secure headers.
- Use HTTPS for encrypted communication.
- Avoid exposing sensitive data in error messages.
- Maintain logs for security monitoring and auditing.

### HTTPS Example
```javascript
const https = require('https');
const fs = require('fs');

const httpsOptions = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

const httpsServer = https.createServer(httpsOptions, app);

httpsServer.listen(8443, () => {
  console.log("HTTPS Server Listening on port 8443");
});
```

### Outcome
Week 3 focused on validation, monitoring, and documentation. It confirmed that the application was no longer in its vulnerable state and had been improved with stronger security controls.

---

## Tools and Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- bcrypt
- validator
- jsonwebtoken
- helmet
- winston

---

## Overall Outcome

This internship covered the full security improvement lifecycle of a web application:

- **Week 1:** Identified vulnerabilities in the original app.
- **Week 2:** Applied fixes such as validation, hashing, authentication, and security headers.
- **Week 3:** Tested the security controls, added logging, and documented best practices.

The final application is more secure, better monitored, and more suitable for real-world use than the original vulnerable version.

---

## Conclusion

This internship helped me understand how vulnerable web applications can be analyzed, secured, tested, and documented. I gained practical experience in web security, authentication, password protection, logging, and basic penetration testing.

The project successfully demonstrated the importance of secure development practices and showed how incremental fixes can transform a vulnerable application into a more resilient system.