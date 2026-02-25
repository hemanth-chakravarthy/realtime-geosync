import { io } from 'socket.io-client';

// Singleton socket instance — reused across the entire app
let socket;

export function getSocket() {
    if (!socket) {
        socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
            autoConnect: false,
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        });
    }
    return socket;
}
