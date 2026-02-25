const express = require('express');
const { createRoom, validateRoom } = require('../rooms/roomManager');

const router = express.Router();

// POST /api/v1/rooms — Create a new room
router.post('/', (_req, res) => {
    const room = createRoom();
    res.status(201).json({ success: true, roomCode: room.code, expiresIn: '15m' });
});

// GET /api/v1/rooms/validate/:code — Check if a room is valid and joinable
router.get('/validate/:code', (req, res) => {
    const result = validateRoom(req.params.code);
    if (!result.valid) {
        return res.status(404).json({ valid: false, message: 'Room not found.' });
    }
    res.json({ valid: true, currentParticipants: result.currentParticipants, isFull: result.isFull });
});

module.exports = router;
