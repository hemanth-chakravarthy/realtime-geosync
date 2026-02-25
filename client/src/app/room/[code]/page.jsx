'use client';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGeoSync } from '@/context/GeoSyncContext';
import HUD from '@/components/HUD';
import RoleBadge from '@/components/RoleBadge';
import TrackerDisconnectedModal from '@/components/TrackerDisconnectedModal';
import MapLayerSwitcher from '@/components/MapLayerSwitcher';
import { getSocket } from '@/lib/socket';

const MapView = dynamic(() => import('@/components/MapView'), {
    ssr: false,
    loading: () => (
        <div className="flex h-full w-full items-center justify-center bg-black">
            <div className="flex flex-col items-center gap-3">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <p className="text-xs text-zinc-500 font-medium tracking-wide">Loading map…</p>
            </div>
        </div>
    ),
});

export default function RoomPage({ params }) {
    const router = useRouter();
    const { role, connect, trackerDisconnected, resync, disconnect } = useGeoSync();
    const [activeLayerId, setActiveLayerId] = useState('streets');
    const code = params.code.toUpperCase();
    const hasJoined = useRef(false);

    useEffect(() => {
        if (hasJoined.current) return;
        hasJoined.current = true;

        const socket = getSocket();
        if (!socket.connected) socket.connect();

        if (role) return;

        socket.once('role-assigned', ({ role: assignedRole }) => { connect(code, assignedRole); });
        socket.once('error', ({ msg }) => { alert(`Error: ${msg}`); router.push('/'); });
        socket.emit('join-room', { roomCode: code });

        return () => { socket.off('error'); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [code]);

    const handleLeave = () => { disconnect(); router.push('/'); };

    return (
        <div className="relative h-[100dvh] w-screen overflow-hidden bg-black">

            {/* Subtle grid — same as landing */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-[1]"
                style={{
                    opacity: 0.025,
                    backgroundImage:
                        'linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)',
                    backgroundSize: '48px 48px',
                }}
            />

            {/* Full-screen map */}
            <div className="absolute inset-0 z-[2]">
                <MapView roomCode={code} activeLayerId={activeLayerId} />
            </div>


            {/* ── Top bar ─────────────────────────────────────────── */}
            <div className="absolute top-0 left-0 right-0 z-[1000] flex items-start justify-between px-3 pt-2.5 pointer-events-none">

                {/* Room code — centred on sm+, hidden on mobile */}
                <div className="hidden sm:block sm:absolute sm:left-1/2 sm:-translate-x-1/2 sm:top-2.5 pointer-events-none">
                    <span className="rounded-full border border-white/10 bg-zinc-950/90 px-5 py-1.5 font-mono text-xs text-zinc-500 backdrop-blur-md shadow whitespace-nowrap">
                        Room&nbsp;<strong className="text-white tracking-widest text-sm">{code}</strong>
                    </span>
                </div>

                {/* HUD + RoleBadge + Room code (mobile only) — stacked top right */}
                <div className="pointer-events-auto shrink-0 flex flex-col items-end gap-2 ml-auto">
                    <HUD inline />
                    <RoleBadge role={role} />
                    {/* Room code — only visible on mobile, sits below Broadcasting */}
                    <span className="sm:hidden rounded-full border border-white/10 bg-zinc-950/90 px-4 py-1 font-mono text-[10px] text-zinc-500 backdrop-blur-md shadow whitespace-nowrap">
                        Room&nbsp;<strong className="text-white tracking-widest">{code}</strong>
                    </span>
                </div>
            </div>

            {/* ── Bottom bar ──────────────────────────────────────── */}
            <div className="absolute bottom-0 left-0 right-0 z-[1000] flex items-end justify-between px-3 pb-4 pointer-events-none">

                {/* Leave button */}
                <button
                    onClick={handleLeave}
                    className="pointer-events-auto rounded-xl border border-white/10 bg-zinc-950/90 px-3 py-2 text-xs font-semibold text-zinc-500 backdrop-blur-md hover:border-white/20 hover:text-zinc-200 transition-colors shadow"
                >
                    ✕ Leave
                </button>

                {/* Right cluster: Re-sync + Layer switcher */}
                <div className="pointer-events-auto flex flex-col items-end gap-2">
                    {role === 'follower' && !trackerDisconnected && (
                        <button
                            onClick={resync}
                            className="rounded-xl border border-white/10 bg-zinc-950/90 px-3 py-2 text-xs font-semibold text-zinc-400 backdrop-blur-md hover:border-white/20 hover:text-zinc-200 transition-colors shadow"
                        >
                            ↺ Re-sync
                        </button>
                    )}
                    <MapLayerSwitcher activeLayerId={activeLayerId} onLayerChange={setActiveLayerId} />
                </div>
            </div>

            {trackerDisconnected && (
                <TrackerDisconnectedModal onResync={resync} onLeave={handleLeave} />
            )}
        </div>
    );
}
