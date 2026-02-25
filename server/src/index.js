require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const roomsRouter = require('./routes/rooms');
const { registerSocketHandlers } = require('./sockets/handler');
const { purgeIdleRooms } = require('./rooms/roomManager');

const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

const app = express();
const server = http.createServer(app);

// ── Socket.io setup ───────────────────────────────────────────────────────────
const io = new Server(server, {
    cors: { origin: CLIENT_URL, methods: ['GET', 'POST'] },
    pingTimeout: 10000,
    pingInterval: 5000,
});

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());
app.use(morgan('dev'));

// Rate limit: max 10 room creations per minute per IP
app.use(
    '/api/v1/rooms',
    rateLimit({
        windowMs: 60 * 1000,
        max: 20,
        message: { error: { code: 'RATE_LIMITED', message: 'Too many requests. Try again shortly.' } },
    })
);

// ── REST Routes ───────────────────────────────────────────────────────────────
app.use('/api/v1/rooms', roomsRouter);

app.get('/health', (_req, res) => {
    res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// ── Socket Handlers ───────────────────────────────────────────────────────────
io.on('connection', (socket) => {
    registerSocketHandlers(io, socket);
});

// ── Idle Room Purge every 5 min ───────────────────────────────────────────────
setInterval(purgeIdleRooms, 5 * 60 * 1000);

// ── Start ─────────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
    console.log(`✅ Geo-Sync server running → http://localhost:${PORT}`);
    console.log(`   CORS allowed: ${CLIENT_URL}`);
});
