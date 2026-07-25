import { Router } from 'express';

const router = Router();
const PISTON_API_URL = process.env.PISTON_API_URL || 'https://emkc.org/api/v2/piston';

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
