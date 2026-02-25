'use client';
import { createContext, useContext, useState, useRef, useCallback } from 'react';
import { getSocket } from '@/lib/socket';

const GeoSyncContext = createContext(null);

export function GeoSyncProvider({ children }) {
    const [role, setRole] = useState(null);
    const [roomCode, setRoomCode] = useState('');
    const [connectionStatus, setConnectionStatus] = useState('idle');
    const [coords, setCoords] = useState({ lat: 20.5937, lng: 78.9629, zoom: 5 });
    const [trackerDisconnected, setTrackerDisconnected] = useState(false);
    const [participantCount, setParticipantCount] = useState(0);
    const socketRef = useRef(null);

    const connect = useCallback((code, assignedRole) => {
        const socket = getSocket();
        socketRef.current = socket;

        setRoomCode(code);
        setRole(assignedRole);
        setTrackerDisconnected(false);
        setConnectionStatus('connected');

        // Map update from server (for followers)
        socket.on('map-update', ({ lat, lng, zoom }) => {
            setCoords({ lat, lng, zoom });
        });

        // Room participant count updates
        socket.on('room-update', ({ participantCount: count }) => {
            setParticipantCount(count);
        });

        // Tracker left the session
        socket.on('tracker-disconnected', () => {
            setTrackerDisconnected(true);
            setConnectionStatus('disconnected');
        });

        socket.on('disconnect', () => setConnectionStatus('searching'));
        socket.on('connect', () => setConnectionStatus('connected'));
    }, []);

    const resync = useCallback(() => {
        setTrackerDisconnected(false);
    }, []);

    const disconnect = useCallback(() => {
        const socket = socketRef.current;
        if (socket) {
            socket.off('map-update');
            socket.off('room-update');
            socket.off('tracker-disconnected');
            socket.off('disconnect');
            socket.off('connect');
            socket.disconnect();
        }
        setRole(null);
        setRoomCode('');
        setConnectionStatus('idle');
        setTrackerDisconnected(false);
        setParticipantCount(0);
    }, []);

    return (
        <GeoSyncContext.Provider
            value={{
                role, roomCode, connectionStatus, coords, setCoords,
                trackerDisconnected, participantCount,
                connect, resync, disconnect,
            }}
        >
            {children}
        </GeoSyncContext.Provider>
    );
}

export function useGeoSync() {
    const ctx = useContext(GeoSyncContext);
    if (!ctx) throw new Error('useGeoSync must be used within a GeoSyncProvider');
    return ctx;
}
