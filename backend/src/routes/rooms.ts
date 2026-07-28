import { Router } from 'express';
import { Room } from '../models/Room';
import { Snapshot } from '../models/Snapshot';
import { Message } from '../models/Message';
import { requireAuth } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

router.use(requireAuth);

const createRoomSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  language: z.string().optional(),
});

router.post('/', async (req: any, res: any) => {
  try {
    const parseResult = createRoomSchema.safeParse(req.body);
    if (!parseResult.success) {
      const msg = parseResult.error.issues.map(e => e.message).join(', ');
      return res.status(400).json({ error: msg });
    }
    const { name, language } = parseResult.data;
    
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const userId = req.user.id;
    
    const room = new Room({
      roomCode,
      name,
      language: language || 'javascript',
      hostId: userId,
      members: [{ userId, role: 'host' }]
    });
    
    await room.save();
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create room' });
  }
});

const joinRoomSchema = z.object({
  roomCode: z.string().min(1, 'Room code is required'),
});

router.post('/join', async (req: any, res: any) => {
  try {
    const parseResult = joinRoomSchema.safeParse(req.body);
    if (!parseResult.success) {
      const msg = parseResult.error.issues.map(e => e.message).join(', ');
      return res.status(400).json({ error: msg });
    }
    const { roomCode } = parseResult.data;
    
    const room = await Room.findOne({ roomCode: roomCode.toUpperCase() });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    
    const userId = req.user.id;
    if (!room.members.find(m => m.userId === userId)) {
      room.members.push({ userId, role: 'member' });
      await room.save();
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
    
    const userId = req.user.id;
    if (!room.members.find(m => m.userId === userId)) {
      return res.status(403).json({ error: 'Access denied: not a member' });
    }
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get room details' });
  }
});

router.post('/:roomCode/language', async (req: any, res: any) => {
  try {
    const room = await Room.findOne({ roomCode: req.params.roomCode.toUpperCase() });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    
    if (room.hostId && req.user.id !== room.hostId.toString()) {
      return res.status(403).json({ error: 'Only the host can change language' });
    }
    
    room.language = req.body.language;
    await room.save();
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update language' });
  }
});

router.post('/:roomCode/snapshot', async (req: any, res: any) => {
  try {
    const room = await Room.findOne({ roomCode: req.params.roomCode.toUpperCase() });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    
    const userId = req.user.id;
    if (!room.members.find(m => m.userId === userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
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
    
    const userId = req.user.id;
    if (!room.members.find(m => m.userId === userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
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
    
    const userId = req.user.id;
    if (!room.members.find(m => m.userId === userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const messages = await Message.find({ roomId: room._id }).sort({ createdAt: -1 }).limit(50);
    res.status(200).json(messages.reverse());
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

export default router;
