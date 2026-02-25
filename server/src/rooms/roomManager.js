// In-memory room store — keyed by room code
const rooms = new Map();

/**
 * Generate a random 6-character alphanumeric room code.
 */
function generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

/**
 * Create a new room and return it.
 */
function createRoom() {
    let code = generateCode();
    while (rooms.has(code)) code = generateCode();
    const room = { code, participants: [], participantCount: 0, lastActivity: Date.now() };
    rooms.set(code, room);
    return room;
}

/**
 * Get room by code (case-insensitive).
 */
function getRoom(code) {
    return rooms.get((code || '').toUpperCase().trim());
}

/**
 * Add a participant. Returns assigned role ('tracker'|'follower') or null if full.
 */
function addParticipant(code, socketId) {
    const room = getRoom(code);
    if (!room || room.participants.length >= 3) return null;
    // Prevent same socket from joining twice
    if (room.participants.some((p) => p.socketId === socketId)) return null;
    const role = room.participants.length === 0 ? 'tracker' : 'follower';
    room.participants.push({ socketId, role });
    room.participantCount = room.participants.length;
    room.lastActivity = Date.now();
    return role;
}

/**
 * Remove a participant by socket ID.
 * Returns { roomCode, wasTracker } or null if not found.
 */
function removeParticipant(socketId) {
    for (const [code, room] of rooms.entries()) {
        const idx = room.participants.findIndex((p) => p.socketId === socketId);
        if (idx !== -1) {
            const wasTracker = room.participants[idx].role === 'tracker';
            room.participants.splice(idx, 1);
            if (room.participants.length === 0) rooms.delete(code);
            return { roomCode: code, wasTracker };
        }
    }
    return null;
}

/**
 * Validate a room: returns status info.
 */
function validateRoom(code) {
    const room = getRoom(code);
    if (!room) return { valid: false, currentParticipants: 0, isFull: false };
    return { valid: true, currentParticipants: room.participants.length, isFull: room.participants.length >= 3 };
}

/**
 * Update room last activity timestamp.
 */
function touchRoom(code) {
    const room = getRoom(code);
    if (room) room.lastActivity = Date.now();
}

/**
 * Purge rooms idle > 15 minutes.
 */
function purgeIdleRooms() {
    const IDLE_LIMIT = 15 * 60 * 1000;
    const now = Date.now();
    for (const [code, room] of rooms.entries()) {
        if (now - room.lastActivity > IDLE_LIMIT) {
            rooms.delete(code);
            console.log(`[RoomManager] Purged idle room: ${code}`);
        }
    }
}

module.exports = { createRoom, getRoom, addParticipant, removeParticipant, validateRoom, touchRoom, purgeIdleRooms };
