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

const PISTON_RUNTIMES: Record<string, { language: string, version: string }> = {
  javascript: { language: 'javascript', version: '18.15.0' },
  typescript: { language: 'typescript', version: '5.0.3' },
  python: { language: 'python', version: '3.10.0' },
  cpp: { language: 'c++', version: '10.2.0' }
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

    const runtime = PISTON_RUNTIMES[language];
    if (!runtime) {
      return res.status(400).json({ error: `Language ${language} execution is not supported.` });
    }

    try {
      const pistonUrl = process.env.PISTON_URL || 'https://emkc.org/api/v2/piston/execute';
      const response = await axios.post(pistonUrl, {
        language: runtime.language,
        version: runtime.version,
        files: [{ content: code }],
        stdin: stdin || ""
      });

      const data = response.data;
      const run = data.run;
      
      if (!run) {
        return res.status(500).json({ error: 'Invalid response from execution server' });
      }

      res.json({
        status: run.code === 0 ? 'success' : 'error',
        stdout: run.stdout,
        stderr: run.stderr,
        error: run.code !== 0 ? (run.stderr || run.stdout) : null
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
