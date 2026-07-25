import { Router } from 'express';
import { Room } from '../models/Room';
import { Snapshot } from '../models/Snapshot';
import { Message } from '../models/Message';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.post('/', async (req: any, res: any) => {
  try {
    const { name, language } = req.body;
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

router.post('/join', async (req: any, res: any) => {
  try {
    const { roomCode } = req.body;
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
