const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

const generateRefreshToken = () => {
    return crypto.randomBytes(40).toString('hex');
};

// Register
exports.register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: 'viewer'
        });

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: { user: user.toJSON() }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        if (user.locked_until && user.locked_until > new Date()) {
            return res.status(401).json({
                success: false,
                message: 'Account locked. Please try again later.'
            });
        }

        const isValid = await user.validatePassword(password);
        if (!isValid) {
            user.failed_attempts += 1;
            if (user.failed_attempts >= 5) {
                user.locked_until = new Date(Date.now() + 15 * 60 * 1000);
            }
            await user.save();
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        user.failed_attempts = 0;
        user.locked_until = null;
        user.last_login = new Date();
        await user.save();

        if (user.mfa_enabled) {
            return res.status(200).json({
                success: true,
                mfa_required: true,
                message: 'MFA verification required',
                user_id: user.id
            });
        }

        const token = generateToken(user);
        const refreshToken = generateRefreshToken();

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: user.toJSON(),
                token,
                refreshToken
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
};

// Enable MFA
exports.enableMFA = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const secret = speakeasy.generateSecret({
            name: `Nexora (${user.email})`
        });

        user.mfa_secret = secret.base32;
        await user.save();

        const qrCode = await QRCode.toDataURL(secret.otpauth_url);

        res.json({
            success: true,
            data: {
                secret: secret.base32,
                qrCode,
                message: 'Scan QR code with Google Authenticator'
            }
        });
    } catch (error) {
        console.error('MFA enable error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to enable MFA'
        });
    }
};

// Verify MFA
exports.verifyMFA = async (req, res) => {
    try {
        const { user_id, token } = req.body;
        
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const verified = speakeasy.totp.verify({
            secret: user.mfa_secret,
            encoding: 'base32',
            token
        });

        if (!verified) {
            return res.status(401).json({
                success: false,
                message: 'Invalid MFA token'
            });
        }

        const jwtToken = generateToken(user);
        const refreshToken = generateRefreshToken();

        res.json({
            success: true,
            message: 'MFA verification successful',
            data: {
                user: user.toJSON(),
                token: jwtToken,
                refreshToken
            }
        });
    } catch (error) {
        console.error('MFA verify error:', error);
        res.status(500).json({
            success: false,
            message: 'MFA verification failed'
        });
    }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.json({
            success: true,
            data: user.toJSON()
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user'
        });
    }
};

// Update profile
exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const { name, preferences } = req.body;
        await user.update({ name, preferences });

        res.json({
            success: true,
            message: 'Profile updated',
            data: user.toJSON()
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
};