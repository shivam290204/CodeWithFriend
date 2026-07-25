import { Router } from 'express';
import { Room } from '../models/Room';
import { Snapshot } from '../models/Snapshot';
import { Message } from '../models/Message';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretcodesynckey123456789';

// Middleware to extract user
const authMiddleware = (req: any, res: any, next: any) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (e) {}
  }
  next(); // Allow guests for some routes, or enforce depending on route
};

router.use(authMiddleware);

router.post('/', async (req: any, res: any) => {
  try {
    const { name, language } = req.body;
    // Generate a simple room code
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const room = new Room({
      roomCode,
      name,
      language: language || 'javascript',
      hostId: req.user?.id || null, // Allow guest hosts if needed
    });
    
    await room.save();
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create room' });
  }
});

router.post('/join', async (req: any, res: any) => {
  try {
    const { roomCode } = req.body;
    const room = await Room.findOne({ roomCode: roomCode.toUpperCase() });
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ error: 'Failed to join room' });
  }
});

router.get('/:roomCode', async (req: any, res: any) => {
  try {
    const room = await Room.findOne({ roomCode: req.params.roomCode.toUpperCase() });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get room details' });
  }
});

router.post('/:roomCode/language', async (req: any, res: any) => {
  try {
    const room = await Room.findOne({ roomCode: req.params.roomCode.toUpperCase() });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    
    if (room.hostId && req.user?.id !== room.hostId.toString()) {
      return res.status(403).json({ error: 'Only the host can change language' });
    }
    
    room.language = req.body.language;
    await room.save();
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update language' });
  }
});

// Snapshots
router.post('/:roomCode/snapshot', async (req: any, res: any) => {
  try {
    const room = await Room.findOne({ roomCode: req.params.roomCode.toUpperCase() });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    
    const snapshot = new Snapshot({
      roomId: room._id,
      content: req.body.content,
      description: req.body.description || 'Manual Checkpoint'
    });
    await snapshot.save();
    res.status(201).json(snapshot);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save snapshot' });
  }
});

router.get('/:roomCode/snapshots/latest', async (req: any, res: any) => {
  try {
    const room = await Room.findOne({ roomCode: req.params.roomCode.toUpperCase() });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    
    const snapshot = await Snapshot.findOne({ roomId: room._id }).sort({ createdAt: -1 });
    res.status(200).json(snapshot || { content: null });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get latest snapshot' });
  }
});

router.get('/:roomCode/messages', async (req: any, res: any) => {
  try {
    const room = await Room.findOne({ roomCode: req.params.roomCode.toUpperCase() });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    
    const messages = await Message.find({ roomId: room._id }).sort({ createdAt: -1 }).limit(50);
    res.status(200).json(messages.reverse());
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

export default router;
