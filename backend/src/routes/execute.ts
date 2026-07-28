import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth';
import axios from 'axios';
import { z } from 'zod';

const router = Router();

const executeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many execution requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(requireAuth);
router.use(executeLimiter);

const JUDGE0_RUNTIMES: Record<string, number> = {
  javascript: 93, // Node.js 18.15.0
  typescript: 94, // TypeScript 5.0.3
  python: 109, // Python 3.13.2
  cpp: 54 // C++ GCC 9.2.0
};

const executeSchema = z.object({
  language: z.string(),
  code: z.string().min(1, 'No code provided'),
  stdin: z.string().optional(),
});

router.post('/', async (req, res) => {
  try {
    const parseResult = executeSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.message });
    }
    const { language, code, stdin } = parseResult.data;

    const languageId = JUDGE0_RUNTIMES[language];
    if (!languageId) {
      return res.status(400).json({ error: `Language ${language} execution is not supported.` });
    }

    try {
      const response = await axios.post('https://ce.judge0.com/submissions?base64_encoded=false&wait=true', {
        language_id: languageId,
        source_code: code,
        stdin: stdin || ""
      });

      const data = response.data;
      
      if (!data) {
        return res.status(500).json({ error: 'Invalid response from execution server' });
      }

      const isSuccess = data.status?.id === 3;
      const errorMsg = data.stderr || data.compile_output;

      res.json({
        status: isSuccess ? 'success' : 'error',
        stdout: data.stdout || '',
        stderr: errorMsg || '',
        error: !isSuccess ? errorMsg : null
      });

    } catch (apiError: any) {
      const msg = apiError.response?.data?.message || apiError.message;
      return res.status(500).json({ error: `Execution failed on remote server: ${msg}` });
    }

  } catch (error) {
    res.status(500).json({ error: 'Failed to execute code' });
  }
});

export default router;
