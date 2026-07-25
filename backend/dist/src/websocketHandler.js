"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWebSocketConnection = void 0;
const ws_1 = require("ws");
const Y = __importStar(require("yjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Room_1 = require("./models/Room");
const Message_1 = require("./models/Message");
const env_1 = require("./config/env");
// In-memory state for rooms
const docs = new Map();
const roomClients = new Map();
const handleWebSocketConnection = async (ws, request) => {
    const url = new URL(request.url || '', `http://${request.headers.host}`);
    const match = url.pathname.match(/^\/ws\/room\/([a-zA-Z0-9-]+)$/);
    if (!match) {
        ws.close(1008, 'Invalid room path');
        return;
    }
    const roomCode = match[1];
    // Auth
    const token = url.searchParams.get('token');
    let user = null;
    if (token) {
        try {
            user = jsonwebtoken_1.default.verify(token, env_1.JWT_SECRET);
        }
        catch (e) {
            console.warn('Invalid WS token');
        }
    }
    if (!user) {
        ws.close(1008, 'Unauthorized: Missing or invalid token');
        return;
    }
    // Verify room exists
    const room = await Room_1.Room.findOne({ roomCode: roomCode.toUpperCase() });
    if (!room) {
        ws.close(1008, 'Room not found');
        return;
    }
    // Verify membership
    if (!room.members.find(m => m.userId === user.id)) {
        ws.close(1008, 'Unauthorized: Not a member of this room');
        return;
    }
    // Initialize room state if not exists
    if (!docs.has(roomCode)) {
        docs.set(roomCode, new Y.Doc());
        roomClients.set(roomCode, new Set());
    }
    const doc = docs.get(roomCode);
    const clients = roomClients.get(roomCode);
    const client = { ws, user, color: '#' + Math.floor(Math.random() * 16777215).toString(16) };
    clients.add(client);
    // Broadcast user-joined
    broadcast(roomCode, { type: 'user-joined', payload: { user: client.user } });
    ws.on('message', async (message) => {
        try {
            // Check if it's a JSON string or binary (Yjs update)
            // The frontend sends `yjs-update` or JSON for other events.
            // Wait, in CodeSync, Yjs updates are usually sent as binary, or base64 JSON?
            // Let's assume the frontend sends JSON: { type: "MESSAGE_TYPE", payload: ... }
            const text = message.toString();
            const parsed = JSON.parse(text);
            if (parsed.type === 'yjs-update') {
                const update = Buffer.from(parsed.payload, 'base64');
                Y.applyUpdate(doc, update);
                // broadcast to other clients in room
                broadcast(roomCode, { type: 'yjs-update', payload: parsed.payload }, client);
            }
            else if (parsed.type === 'presence') {
                broadcast(roomCode, { type: 'presence', payload: { ...parsed.payload, userId: client.user.id } }, client);
            }
            else if (parsed.type === 'chat-message') {
                // Save to DB
                const chatMsg = new Message_1.Message({
                    roomId: room._id,
                    senderId: client.user.id.startsWith('guest') ? null : client.user.id,
                    text: parsed.payload.text,
                    senderName: client.user.name,
                });
                await chatMsg.save();
                broadcast(roomCode, { type: 'chat-message', payload: chatMsg });
            }
            else if (parsed.type === 'room-updated') {
                if (room.hostId && room.hostId.toString() === client.user.id) {
                    broadcast(roomCode, { type: 'room-updated', payload: parsed.payload });
                }
            }
            else if (parsed.type === 'kick') {
                if (room.hostId && room.hostId.toString() === client.user.id) {
                    const targetId = parsed.payload.userId;
                    clients.forEach(c => {
                        if (c.user.id === targetId) {
                            c.ws.send(JSON.stringify({ type: 'kicked' }));
                            c.ws.close();
                        }
                    });
                }
            }
        }
        catch (e) {
            // If it's pure binary from y-websocket, we handle it differently, 
            // but based on the README it uses a JSON wrapper: { "type": "yjs-update", "payload": "..." }
        }
    });
    ws.on('close', () => {
        clients.delete(client);
        broadcast(roomCode, { type: 'user-left', payload: { userId: client.user.id } });
    });
    ws.on('error', (err) => {
        console.error('WebSocket Error:', err);
    });
};
exports.handleWebSocketConnection = handleWebSocketConnection;
function broadcast(roomCode, message, excludeClient) {
    const clients = roomClients.get(roomCode);
    if (!clients)
        return;
    const msgStr = JSON.stringify(message);
    clients.forEach(c => {
        if (c !== excludeClient && c.ws.readyState === ws_1.WebSocket.OPEN) {
            c.ws.send(msgStr);
        }
    });
}
