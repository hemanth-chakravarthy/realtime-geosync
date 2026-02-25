const { addParticipant, removeParticipant, getRoom, touchRoom } = require('../rooms/roomManager');

// Throttle map: track last emit timestamp per socket (10Hz = 100ms)
const throttleMap = new Map();
const THROTTLE_MS = 100;

/**
 * Validate incoming map-move coordinate payload.
 */
function isValidPayload({ lat, lng, zoom }) {
    return (
        typeof lat === 'number' && lat >= -90 && lat <= 90 &&
        typeof lng === 'number' && lng >= -180 && lng <= 180 &&
        typeof zoom === 'number' && zoom >= 0 && zoom <= 22
    );
}

/**
 * Broadcast current participant count to the entire room.
 */
function broadcastRoomUpdate(io, roomCode) {
    const room = getRoom(roomCode);
    if (!room) return;
    io.to(roomCode).emit('room-update', {
        participantCount: room.participants.length,
        maxParticipants: 3,
    });
}

/**
 * Register all Socket.io event handlers for a connected socket.
 */
function registerSocketHandlers(io, socket) {
    console.log(`[Socket] Connected: ${socket.id}`);

    // ── join-room ──────────────────────────────────────────────────────────────
    socket.on('join-room', ({ roomCode }) => {
        const code = (roomCode || '').toUpperCase().trim();
        const room = getRoom(code);

        if (!room) {
            return socket.emit('error', { code: 'NOT_FOUND', msg: `Room "${code}" does not exist.` });
        }
        if (room.participants.length >= 3) {
            return socket.emit('error', { code: 'ROOM_FULL', msg: 'This room already has 3 participants.' });
        }
        // Prevent duplicate join from same socket
        if (room.participants.some((p) => p.socketId === socket.id)) {
            // Already in room — just re-emit their role
            const existing = room.participants.find((p) => p.socketId === socket.id);
            socket.emit('role-assigned', { role: existing.role });
            return;
        }

        const role = addParticipant(code, socket.id);
        if (!role) {
            return socket.emit('error', { code: 'ROOM_FULL', msg: 'Unable to join room.' });
        }

        socket.join(code);
        socket.emit('role-assigned', { role });

        // Notify others a new user joined
        socket.to(code).emit('follower-joined', {
            msg: role === 'tracker' ? 'Tracker connected.' : 'A follower has joined your session.',
        });

        // Broadcast updated participant count to everyone in room
        broadcastRoomUpdate(io, code);

        console.log(`[Socket] ${socket.id} joined room ${code} as ${role} (${room.participants.length}/3)`);
    });

    // ── map-move ───────────────────────────────────────────────────────────────
    socket.on('map-move', ({ roomCode, lat, lng, zoom }) => {
        const code = (roomCode || '').toUpperCase().trim();

        // Server-side throttle guard (10Hz)
        const now = Date.now();
        const lastEmit = throttleMap.get(socket.id) ?? 0;
        if (now - lastEmit < THROTTLE_MS) return;
        throttleMap.set(socket.id, now);

        if (!isValidPayload({ lat, lng, zoom })) return;

        touchRoom(code);

        // Broadcast to all followers in room (everyone except the Tracker/sender)
        socket.to(code).emit('map-update', {
            lat: parseFloat(lat.toFixed(6)),
            lng: parseFloat(lng.toFixed(6)),
            zoom: parseFloat(zoom.toFixed(1)),
            ts: now,
        });
    });

    // ── disconnect ─────────────────────────────────────────────────────────────
    socket.on('disconnect', (reason) => {
        console.log(`[Socket] Disconnected: ${socket.id} (${reason})`);
        throttleMap.delete(socket.id);

        const result = removeParticipant(socket.id);
        if (result) {
            if (result.wasTracker) {
                io.to(result.roomCode).emit('tracker-disconnected', {
                    msg: 'The Tracker has left the session.',
                });
                console.log(`[Socket] Tracker left room ${result.roomCode}`);
            }
            // Broadcast updated count to remaining participants
            broadcastRoomUpdate(io, result.roomCode);
        }
    });
}

module.exports = { registerSocketHandlers };
