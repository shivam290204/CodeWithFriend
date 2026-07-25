import { WebSocket } from 'ws';
import * as Y from 'yjs';
import jwt from 'jsonwebtoken';
import { Room } from './models/Room';
import { Message } from './models/Message';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretcodesynckey123456789';

// In-memory state for rooms
const docs: Map<string, Y.Doc> = new Map();
const roomClients: Map<string, Set<any>> = new Map();

export const handleWebSocketConnection = async (ws: WebSocket, request: any) => {
  const url = new URL(request.url || '', `http://${request.headers.host}`);
  const match = url.pathname.match(/^\/ws\/room\/([a-zA-Z0-9-]+)$/);
  if (!match) {
    ws.close(1008, 'Invalid room path');
    return;
  }
  const roomCode = match[1];

  // Auth (Optional via token in query params or cookie, but let's assume token in query for ws)
  const token = url.searchParams.get('token');
  let user: any = { id: 'guest-' + Math.random().toString(36).substring(7), name: 'Guest' };
  if (token) {
    try {
      user = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      console.warn('Invalid WS token');
    }
  }

  // Verify room exists
  const room = await Room.findOne({ roomCode: roomCode.toUpperCase() });
  if (!room) {
    ws.close(1008, 'Room not found');
    return;
  }

  // Initialize room state if not exists
  if (!docs.has(roomCode)) {
    docs.set(roomCode, new Y.Doc());
    roomClients.set(roomCode, new Set());
  }

  const doc = docs.get(roomCode)!;
  const clients = roomClients.get(roomCode)!;

  const client = { ws, user, color: '#' + Math.floor(Math.random()*16777215).toString(16) };
  clients.add(client);

  // Broadcast user-joined
  broadcast(roomCode, { type: 'user-joined', payload: { user: client.user } });

  ws.on('message', async (message: Buffer) => {
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
      } else if (parsed.type === 'presence') {
        broadcast(roomCode, { type: 'presence', payload: { ...parsed.payload, userId: client.user.id } }, client);
      } else if (parsed.type === 'chat-message') {
        // Save to DB
        const chatMsg = new Message({
          roomId: room._id,
          senderId: client.user.id.startsWith('guest') ? null : client.user.id,
          text: parsed.payload.text,
          senderName: client.user.name,
        });
        await chatMsg.save();
        
        broadcast(roomCode, { type: 'chat-message', payload: chatMsg });
      } else if (parsed.type === 'room-updated') {
        if (room.hostId && room.hostId.toString() === client.user.id) {
          broadcast(roomCode, { type: 'room-updated', payload: parsed.payload });
        }
      } else if (parsed.type === 'kick') {
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
    } catch (e) {
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

function broadcast(roomCode: string, message: any, excludeClient?: any) {
  const clients = roomClients.get(roomCode);
  if (!clients) return;
  const msgStr = JSON.stringify(message);
  clients.forEach(c => {
    if (c !== excludeClient && c.ws.readyState === WebSocket.OPEN) {
      c.ws.send(msgStr);
    }
  });
}
