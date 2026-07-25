"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const env_1 = require("../config/env");
const router = (0, express_1.Router)();
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User_1.User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const user = new User_1.User({ name, email, password: hashedPassword });
        await user.save();
        const token = jsonwebtoken_1.default.sign({ id: user._id, name: user.name, email: user.email }, env_1.JWT_SECRET, { expiresIn: '7d' });
        // Using httpOnly cookie for MERN auth standard
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
        res.status(201).json({ user: { id: user._id, name: user.name, email: user.email } });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, name: user.name, email: user.email }, env_1.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
        res.status(200).json({ user: { id: user._id, name: user.name, email: user.email }, token }); // returning token in payload as well for ease of use in WebSocket handshake if needed
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
});
router.get('/me', async (req, res) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token)
        return res.status(401).json({ error: 'Unauthorized' });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.JWT_SECRET);
        res.status(200).json({ user: decoded });
    }
    catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
});
router.get('/ws-token', async (req, res) => {
    const token = req.cookies.token;
    if (!token)
        return res.status(401).json({ error: 'Unauthorized: No session cookie' });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.JWT_SECRET);
        // Issue a short-lived token for WS handshake
        const wsToken = jsonwebtoken_1.default.sign({ id: decoded.id, name: decoded.name, email: decoded.email }, env_1.JWT_SECRET, { expiresIn: '5m' });
        res.status(200).json({ wsToken });
    }
    catch (err) {
        res.status(401).json({ error: 'Invalid session' });
    }
});
exports.default = router;
