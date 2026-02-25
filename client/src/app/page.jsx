'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { getSocket } from '@/lib/socket';
import { useGeoSync } from '@/context/GeoSyncContext';
import GlobeAnimation from '@/components/GlobeAnimation';

const API_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export default function HomePage() {
    const router = useRouter();
    const { connect } = useGeoSync();
    const [joinCode, setJoinCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [tab, setTab] = useState('create');

    const initSocket = (roomCode) => {
        const socket = getSocket();
        socket.connect();
        socket.once('role-assigned', ({ role: assignedRole }) => {
            connect(roomCode, assignedRole);
            router.push(`/room/${roomCode}`);
        });
        socket.once('error', ({ msg }) => {
            setError(msg);
            setLoading(false);
            socket.disconnect();
        });
        socket.emit('join-room', { roomCode });
    };

    const handleCreate = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await axios.post(`${API_URL}/api/v1/rooms`);
            initSocket(data.roomCode);
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to create room. Is the server running?');
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        const code = joinCode.trim().toUpperCase();
        if (code.length < 4) return setError('Enter a valid room code.');
        setLoading(true);
        setError('');
        try {
            const { data } = await axios.get(`${API_URL}/api/v1/rooms/validate/${code}`);
            if (!data.valid) { setError('Room not found.'); setLoading(false); return; }
            if (data.isFull) { setError('Room is full (max 3 users).'); setLoading(false); return; }
            initSocket(code);
        } catch {
            setError('Room not found or server unavailable.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-black text-white flex flex-col">

            {/* Grid background */}
            <div
                aria-hidden
                className="pointer-events-none fixed inset-0"
                style={{
                    opacity: 0.03,
                    backgroundImage:
                        'linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)',
                    backgroundSize: '48px 48px',
                }}
            />

            <main className="relative flex flex-1 flex-col items-center justify-center gap-5 px-4 py-8">

                {/* Globe — smaller on mobile */}
                <div className="scale-75 sm:scale-90 md:scale-100 origin-center" style={{ marginBottom: -30 }}>
                    <GlobeAnimation />
                </div>

                {/* Hero heading */}
                <div className="text-center space-y-1.5">
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-none">
                        <span className="text-white">Real-Time</span>
                        <span className="text-zinc-500"> Geo-Sync</span>
                    </h1>
                    <p className="text-xs text-zinc-600 max-w-xs mx-auto leading-relaxed tracking-wide">
                        Synchronize map views between a Tracker and Followers — in real time.
                    </p>
                </div>

                {/* Card */}
                <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-zinc-950 p-4 shadow-2xl">

                    {/* Tabs */}
                    <div className="flex rounded-lg bg-zinc-900 p-1 mb-4">
                        {[
                            { id: 'create', label: '+ Create' },
                            { id: 'join', label: '→ Join' },
                        ].map((t) => (
                            <button
                                key={t.id}
                                onClick={() => { setTab(t.id); setError(''); }}
                                className={`flex-1 rounded-md py-2 text-xs font-semibold transition-all ${tab === t.id ? 'bg-white text-black shadow' : 'text-zinc-500 hover:text-zinc-200'
                                    }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {tab === 'create' ? (
                        <div className="space-y-3">
                            <p className="text-xs text-zinc-600 text-center">
                                Create a session — share the code with up to 2 Followers.
                            </p>
                            <button
                                onClick={handleCreate}
                                disabled={loading}
                                className="w-full rounded-lg bg-white hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-3 text-sm font-semibold text-black transition-colors"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                                        Creating…
                                    </span>
                                ) : 'Create Room'}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            <p className="text-xs text-zinc-600 text-center">
                                Enter the 6-character code from the Tracker.
                            </p>
                            <input
                                type="text"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                                maxLength={6}
                                placeholder="E.g. XJ92KP"
                                autoCapitalize="characters"
                                autoCorrect="off"
                                className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-3 font-mono text-sm text-white placeholder-zinc-700 focus:border-white/30 focus:outline-none uppercase tracking-widest"
                            />
                            <button
                                onClick={handleJoin}
                                disabled={loading}
                                className="w-full rounded-lg bg-white hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-3 text-sm font-semibold text-black transition-colors"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                                        Joining…
                                    </span>
                                ) : 'Join Room'}
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="mt-3 rounded-lg border border-white/8 bg-zinc-900 px-3 py-2.5 text-xs text-zinc-400">
                            {error}
                        </div>
                    )}
                </div>

                {/* Feature pills */}
                <div className="flex flex-wrap justify-center gap-1.5">
                    {['< 100ms', 'Street-level', '3 users', 'No sign-up'].map((f) => (
                        <span key={f} className="rounded-full border border-white/8 px-2.5 py-0.5 text-xs text-zinc-700">
                            {f}
                        </span>
                    ))}
                </div>
            </main>

            <footer className="shrink-0 py-3 text-center text-xs text-zinc-800">
                Socket.io · Leaflet.js · Next.js 14
            </footer>
        </div>
    );
}
