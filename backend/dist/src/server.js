"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./config/env"); // Validate environment variables first
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const ws_1 = require("ws");
dotenv_1.default.config();
const auth_1 = __importDefault(require("./routes/auth"));
const rooms_1 = __importDefault(require("./routes/rooms"));
const execute_1 = __importDefault(require("./routes/execute"));
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/codesync';
app.use((0, cors_1.default)({ origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true }));
app.use(express_1.default.json());
const cookie_parser_1 = __importDefault(require("cookie-parser"));
app.use((0, cookie_parser_1.default)());
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/rooms', rooms_1.default);
app.use('/api/execute', execute_1.default);
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});
// Setup HTTP Server
const server = (0, http_1.createServer)(app);
// Setup WebSocket Server
const websocketHandler_1 = require("./websocketHandler");
const wss = new ws_1.WebSocketServer({ server });
wss.on('connection', (ws, request) => {
    (0, websocketHandler_1.handleWebSocketConnection)(ws, request);
});
// Start Server
mongoose_1.default
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
