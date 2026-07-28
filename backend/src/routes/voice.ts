import { Router, Request, Response } from 'express';
import { AccessToken } from 'livekit-server-sdk';
import jwt from 'jsonwebtoken';

const router = Router();

// Middleware to extract user from token (similar to auth)
// We'll just do a lightweight check here, assuming the token is in a cookie or Authorization header.
const requireAuth = (req: Request, res: Response, next: any) => {
  const token = req.cookies?.['codesync-auth'] || req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string; name: string };
    // @ts-ignore
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

router.get('/token', requireAuth, async (req: Request, res: Response) => {
  try {
    const roomCode = req.query.roomCode as string;
    if (!roomCode) {
      return res.status(400).json({ error: 'roomCode is required' });
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      return res.status(500).json({ error: 'LiveKit credentials are not configured on the server.' });
    }

    // @ts-ignore
    const participantName = req.user.name || 'Anonymous';
    
    // Create an access token
    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName + '-' + Math.random().toString(36).substring(2, 8),
      name: participantName,
    });

    // Add permissions to join the specific room
    at.addGrant({ roomJoin: true, room: roomCode, canPublish: true, canSubscribe: true });

    const token = await at.toJwt();
    res.json({ token });
  } catch (err) {
    console.error('Error generating LiveKit token:', err);
    res.status(500).json({ error: 'Failed to generate voice token' });
  }
});

export default router;
