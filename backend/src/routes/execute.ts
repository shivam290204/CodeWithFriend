import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth';

const router = Router();
const PISTON_API_URL = process.env.PISTON_API_URL || 'https://emkc.org/api/v2/piston';

const executeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: { error: 'Too many execution requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(requireAuth);
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to execute code' });
  }
});

export default router;
