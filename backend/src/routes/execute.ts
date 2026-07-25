import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth';
import { spawn } from 'child_process';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

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

router.post('/', async (req, res) => {
  try {
    const { language, code, stdin } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'No code provided' });
    }

    const fileId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const tempDir = tmpdir();
    let filename = '';
    let cmd = '';
    let args: string[] = [];

    if (language === 'javascript') {
      filename = join(tempDir, `${fileId}.js`);
      cmd = 'node';
      args = [filename];
    } else if (language === 'typescript') {
      filename = join(tempDir, `${fileId}.ts`);
      cmd = 'npx';
      args = ['tsx', filename];
    } else if (language === 'python') {
      filename = join(tempDir, `${fileId}.py`);
      cmd = 'python';
      args = [filename];
    } else {
      return res.status(400).json({ error: `Language ${language} execution is not supported locally.` });
    }

    writeFileSync(filename, code);

    const child = spawn(cmd, args);

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    if (stdin) {
      child.stdin.write(stdin);
      child.stdin.end();
    }

    const timeout = setTimeout(() => {
      child.kill();
      stderr += '\nExecution timed out (5s limit).';
    }, 5000);

    child.on('close', (codeStatus) => {
      clearTimeout(timeout);
      try { if (existsSync(filename)) unlinkSync(filename); } catch (e) {}
      
      res.json({
        status: codeStatus === 0 ? 'success' : 'error',
        stdout,
        stderr,
        error: codeStatus !== 0 ? stderr : null
      });
    });

    child.on('error', (err) => {
      clearTimeout(timeout);
      try { if (existsSync(filename)) unlinkSync(filename); } catch (e) {}
      res.status(500).json({ error: `Failed to start process: ${err.message}` });
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to execute code' });
  }
});

export default router;
