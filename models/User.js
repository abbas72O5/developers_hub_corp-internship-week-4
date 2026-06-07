const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    failedLoginAttempts: {
        type: Number,
        default: 0
    },
    lastFailedLoginAt: {
        type: Date,
        default: null
    },
    lockUntil: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function() {
    if (!this.isModified('password')) {
        return;
    }
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        throw error;
    }
});

userSchema.methods.isLoginLocked = function() {
    return Boolean(this.lockUntil && this.lockUntil.getTime() > Date.now());
};

userSchema.methods.registerFailedLogin = function(windowMs, maxAttempts) {
    const now = Date.now();
    const lastAttempt = this.lastFailedLoginAt ? this.lastFailedLoginAt.getTime() : 0;
    const withinWindow = now - lastAttempt <= windowMs;

    this.failedLoginAttempts = withinWindow ? this.failedLoginAttempts + 1 : 1;
    this.lastFailedLoginAt = new Date(now);

    if (this.failedLoginAttempts >= maxAttempts) {
        this.lockUntil = new Date(now + windowMs);
        this.failedLoginAttempts = 0;
    }
};

userSchema.methods.clearLoginFailures = function() {
    this.failedLoginAttempts = 0;
    this.lastFailedLoginAt = null;
    this.lockUntil = null;
};

// Method to compare passwords
userSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);