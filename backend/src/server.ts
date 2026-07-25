import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

dotenv.config();

import authRoutes from './routes/auth';
import roomRoutes from './routes/rooms';
import executeRoutes from './routes/execute';

const app = express();
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/codesync';

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true }));
app.use(express.json());
import cookieParser from 'cookie-parser';
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/execute', executeRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Setup HTTP Server
const server = createServer(app);

// Setup WebSocket Server
import { handleWebSocketConnection } from './websocketHandler';

const wss = new WebSocketServer({ server });

wss.on('connection', (ws, request) => {
  handleWebSocketConnection(ws, request);
});

// Start Server
mongoose
  .connect(mongoUri)
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
