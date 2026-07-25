"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Room_1 = require("../models/Room");
const Snapshot_1 = require("../models/Snapshot");
const Message_1 = require("../models/Message");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.post('/', async (req, res) => {
    try {
        const { name, language } = req.body;
        const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const userId = req.user.id;
        const room = new Room_1.Room({
            roomCode,
            name,
            language: language || 'javascript',
            hostId: userId,
            members: [{ userId, role: 'host' }]
        });
        await room.save();
        res.status(201).json(room);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create room' });
    }
});
router.post('/join', async (req, res) => {
    try {
        const { roomCode } = req.body;
        const room = await Room_1.Room.findOne({ roomCode: roomCode.toUpperCase() });
        if (!room)
            return res.status(404).json({ error: 'Room not found' });
        const userId = req.user.id;
        if (!room.members.find(m => m.userId === userId)) {
            room.members.push({ userId, role: 'member' });
            await room.save();
        }
        res.status(200).json(room);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to join room' });
    }
});
router.get('/:roomCode', async (req, res) => {
    try {
        const room = await Room_1.Room.findOne({ roomCode: req.params.roomCode.toUpperCase() });
        if (!room)
            return res.status(404).json({ error: 'Room not found' });
        const userId = req.user.id;
        if (!room.members.find(m => m.userId === userId)) {
            return res.status(403).json({ error: 'Access denied: not a member' });
        }
        res.status(200).json(room);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get room details' });
    }
});
router.post('/:roomCode/language', async (req, res) => {
    try {
        const room = await Room_1.Room.findOne({ roomCode: req.params.roomCode.toUpperCase() });
        if (!room)
            return res.status(404).json({ error: 'Room not found' });
        if (room.hostId && req.user.id !== room.hostId.toString()) {
            return res.status(403).json({ error: 'Only the host can change language' });
        }
        room.language = req.body.language;
        await room.save();
        res.status(200).json(room);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update language' });
    }
});
router.post('/:roomCode/snapshot', async (req, res) => {
    try {
        const room = await Room_1.Room.findOne({ roomCode: req.params.roomCode.toUpperCase() });
        if (!room)
            return res.status(404).json({ error: 'Room not found' });
        const userId = req.user.id;
        if (!room.members.find(m => m.userId === userId)) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const snapshot = new Snapshot_1.Snapshot({
            roomId: room._id,
            content: req.body.content,
            description: req.body.description || 'Manual Checkpoint'
        });
        await snapshot.save();
        res.status(201).json(snapshot);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to save snapshot' });
    }
});
router.get('/:roomCode/snapshots/latest', async (req, res) => {
    try {
        const room = await Room_1.Room.findOne({ roomCode: req.params.roomCode.toUpperCase() });
        if (!room)
            return res.status(404).json({ error: 'Room not found' });
        const userId = req.user.id;
        if (!room.members.find(m => m.userId === userId)) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const snapshot = await Snapshot_1.Snapshot.findOne({ roomId: room._id }).sort({ createdAt: -1 });
        res.status(200).json(snapshot || { content: null });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get latest snapshot' });
    }
});
router.get('/:roomCode/messages', async (req, res) => {
    try {
        const room = await Room_1.Room.findOne({ roomCode: req.params.roomCode.toUpperCase() });
        if (!room)
            return res.status(404).json({ error: 'Room not found' });
        const userId = req.user.id;
        if (!room.members.find(m => m.userId === userId)) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const messages = await Message_1.Message.find({ roomId: room._id }).sort({ createdAt: -1 }).limit(50);
        res.status(200).json(messages.reverse());
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});
exports.default = router;
