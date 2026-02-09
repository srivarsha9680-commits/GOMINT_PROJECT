const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userPostgres');

// Utility: generate JWT
function generateToken(user) {
    return jwt.sign(
        { sub: user.id, role: user.role },
        process.env.JWT_SECRET || 'devsecret',
        { expiresIn: '7d' }
    );
}

// Middleware: verify JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token required' });

    jwt.verify(token, process.env.JWT_SECRET || 'devsecret', (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = decoded;
        next();
    });
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { username, password, role, firstName, lastName, mobile } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password required' });
        }

        // Check if user already exists
        const existing = await User.findOne({ where: { username } });
        if (existing) {
            return res.status(409).json({ message: 'Email already registered' });
        }

        // Hash password
        const hash = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            username,
            passwordHash: hash,
            role: role || 'operator'
        });

        res.status(201).json({
            id: user.id,
            username: user.username,
            role: user.role
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password required' });
        }

        // Find user by username
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Compare password
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = generateToken(user);
        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET /api/auth/me (protected route)
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.sub);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            id: user.id,
            username: user.username,
            role: user.role
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    // JWT is stateless, so logout is handled on client side
    // Just return a success response
    res.json({ message: 'Logged out successfully' });
});

module.exports = router;
module.exports.authenticateToken = authenticateToken;
