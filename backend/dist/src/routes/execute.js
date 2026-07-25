"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const PISTON_API_URL = process.env.PISTON_API_URL || 'https://emkc.org/api/v2/piston';
const executeLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute
    message: { error: 'Too many execution requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
router.use(auth_1.requireAuth);
router.use(executeLimiter);
router.post('/', async (req, res) => {
    try {
        const { language, sourceCode, version } = req.body;
        // Map language to piston payload
        const payload = {
            language,
            version: version || '*', // Piston uses '*' for latest by default or you specify
            files: [{ content: sourceCode }]
        };
        const response = await fetch(`${PISTON_API_URL}/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        res.status(response.status).json(data);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to execute code' });
    }
});
exports.default = router;
