# CodeSync — Real-Time Collaborative Code Editor & Workspace

<div align="center">
  <h3>Full-Stack Real-Time Code Collaboration & Execution Platform</h3>
  <p>Sub-millisecond peer-to-peer CRDT synchronization, resizable 3-column workspace, live multi-cursor tracking, sandboxed multi-language code execution, persistent room chat, and stateless JWT security.</p>
</div>

---

## 🌟 Overview

**CodeSync** is a state-of-the-art, full-stack real-time collaborative development environment. It empowers teams of developers to code simultaneously in the same workspace with live cursor awareness, multi-language syntax highlighting, instant code execution, real-time chat, and snapshot history management—all powered by **Monaco Editor**, **Yjs (CRDTs)**, **React (Vite)**, and a high-throughput **Node.js + Express WebSocket Relay**.

```
CodeSync/
├── frontend/   # React (Vite), TypeScript, Tailwind CSS, Monaco Editor, Yjs, Lucide Icons
└── backend/    # Node.js, Express, MongoDB, WebSockets, JWT Authentication
```

---

## ✨ Key Features

### ⚡ Real-Time CRDT Collaboration (`y-monaco` + `yjs`)
- **Conflict-Free Replicated Data Types (CRDTs)**: Edits merge automatically across peer connections with zero locking and zero merge conflicts.
- **Opaque Relay Architecture**: The Node.js Express backend acts as a high-speed WebSocket relay (`/ws/room/{roomCode}`) propagating `yjs-update` binary payloads instantly to peers while preserving eventual consistency.

### 📐 Resizable 3-Column Workspace (`react-resizable-panels`)
- **Left Panel (~20% default size)**: Live connected member roster, presence status (`Host` vs `Peer`), color badges, and host moderation tools (`Kick`).
- **Center Panel (~60% default size)**: High-performance **Monaco Editor** bound directly to the shared Yjs document with real-time cursor awareness, code formatting, and instant local code execution.
- **Right Panel (~20% default size)**: Collapsible, live persistent room chat panel with unread badge indicators and instant WebSocket message broadcasting.

### ▶️ Instant Code Execution Engine
- **Local Proxy**: Secure Express API route (`POST /api/execute`) proxies execution requests directly to the Piston execution engine.
- **Multi-Language Support**: Instantly run JavaScript (`node`), TypeScript (`ts-node`), Python (`python3`), Java (`openjdk`), and C++ (`gcc/g++`) inside isolated sandboxed containers.
- **Interactive Output Terminal**: View execution `stdout`, `stderr`, runtime duration, and exit status directly inside the Monaco workspace panel.

### 👥 Live Presence & Remote Cursors
- **Live Awareness State**: Real-time cursor positions, text selection ranges, and active user name badges rendered cleanly inside the Monaco editor viewport.
- **Roster & Presence Events**: Real-time connected member list combining WebSocket connection lifecycle notifications (`user-joined`, `user-left`) and live CRDT awareness.

### 💬 Integrated Workspace Chat
- **Persistent Chat History**: Automatically fetches prior conversation logs (`GET /api/rooms/{roomCode}/messages`) from MongoDB when joining a room.
- **Low-Latency Broadcast**: Instant messaging (`chat-message`) relayed over open WebSocket channels to all active participants.

### 🛡️ Stateless JWT Security & Room Access Control
- **HttpOnly Cookie Authentication**: Secure sign-in (`/login`) and sign-up (`/signup`) endpoints issuing stateless JSON Web Tokens (custom auth backed by MongoDB).
- **WebSocket Handshake Interception**: Verifies user credentials and checks room access permissions directly during the initial `ws://` / `wss://` handshake.

### 👑 Host Governance & Version Control
- **Live Syntax Switching**: Room hosts can change the active programming language with real-time propagation (`room-updated`) to all peers.
- **Host Moderation**: Hosts can instantly remove (`kick`) disruptive members from the session.
- **Snapshot Timelines & Auto-Save**: Automatic background checkpoints alongside manual save options and full historical rollback.

---

## 🛠️ Tech Stack

| Layer | Technologies & Libraries |
| :--- | :--- |
| **Frontend Framework** | React 18, Vite, TypeScript |
| **Typography & Icons** | `Inter`, `JetBrains Mono`, `lucide-react` icons |
| **Styling & UI** | Vanilla CSS, Tailwind CSS (`#0B0E14` Obsidian Dark Mode), `react-resizable-panels` |
| **Editor & CRDT Engine** | Monaco Editor (`@monaco-editor/react`), Yjs (`yjs`, `y-monaco`, `y-protocols`) |
| **Backend Framework** | Node.js, Express.js, `ws` (WebSockets) |
| **Security & Auth** | JSON Web Tokens (`jsonwebtoken`), bcryptjs, HttpOnly Cookies |
| **Database & ORM** | MongoDB, Mongoose |
| **Code Execution API** | Piston Code Execution Engine proxy |

---

## 🏛️ System Architecture & Data Flow

```
+-----------------------------------------------------------------------------------+
|                              CLIENT (Browser / React)                             |
|   +------------------------------------+     +--------------------------------+   |
|   |   Monaco Editor + Yjs CRDT Doc     |     |   Dashboard & Room Management  |   |
|   +------------------------------------+     +--------------------------------+   |
+-----------------------------------------------------------------------------------+
       | (CRDT Updates & Awareness)                   | (REST API & JWT Cookies)
       | WebSocket /ws/room/{roomCode}                | HTTP /api/*
       v                                              v
+-----------------------------------------------------------------------------------+
|                             NODE.JS + EXPRESS BACKEND                             |
|   +------------------------------------+     +--------------------------------+   |
|   |   WebSocket Server (ws)            |     |  Express API Routes (Auth, Room|   |
|   | (Relays yjs-update, presence, chat)|     |  Snapshot, Chat, Execute)      |   |
|   +------------------------------------+     +--------------------------------+   |
+-----------------------------------------------------------------------------------+
                                                      |
                                                      v (Mongoose ORM)
                               +----------------------------------------------+
                               |               MongoDB Database               |
                               |  (Users, Rooms, Snapshots, Chat Messages)    |
                               +----------------------------------------------+
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18.x or higher) & **npm**
- **MongoDB** (Local instance running on `localhost:27017` or MongoDB Atlas URI)

---

### Step 1: Backend Setup (`backend`)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/codesync
   JWT_SECRET=YourSuperSecretSigningKeyMustBeAtLeast32CharactersLong
   PISTON_API_URL=https://emkc.org/api/v2/piston
   ```
4. Start the Express server:
   ```bash
   npm run dev
   ```
   The backend will run on **`http://localhost:5000`**.

---

### Step 2: Frontend Setup (`frontend`)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file inside `frontend/`:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_WS_URL=ws://localhost:5000
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to **`http://localhost:5173`**.

---

## 🤝 Contributing

1. Fork the repository and create your feature branch (`git checkout -b feature/amazing-feature`).
2. Commit your changes (`git commit -m 'feat: add amazing feature'`).
3. Push to the branch (`git push origin feature/amazing-feature`).
4. Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License. Built with ❤️ by the **CodeSync Engineering Team**.
