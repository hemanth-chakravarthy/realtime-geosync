'use client';
import { useGeoSync } from '@/context/GeoSyncContext';

const STATUS_CONFIG = {
    connected: { dot: 'bg-white', label: 'Connected', pulse: false },
    connecting: { dot: 'bg-zinc-400', label: 'Connecting…', pulse: true },
    searching: { dot: 'bg-zinc-400', label: 'Reconnecting…', pulse: true },
    disconnected: { dot: 'bg-zinc-600', label: 'Disconnected', pulse: false },
    idle: { dot: 'bg-zinc-700', label: 'Idle', pulse: false },
};

/**
 * HUD — renders inline (no fixed positioning when `inline` prop is true).
 * The room page top-bar positions it via flexbox.
 */
export default function HUD({ inline = false }) {
    const { coords, connectionStatus, participantCount } = useGeoSync();
    const { lat, lng, zoom } = coords;
    const status = STATUS_CONFIG[connectionStatus] ?? STATUS_CONFIG.idle;

    const classes = inline
        ? 'rounded-xl border border-white/10 bg-black/80 px-4 py-3 shadow backdrop-blur-md select-none'
        : 'fixed top-2 right-2 z-[1000] rounded-xl border border-white/10 bg-black/80 px-4 py-3 shadow-2xl backdrop-blur-md select-none';

    return (
        <div className={classes} style={{ minWidth: 200 }}>
            {/* Status row */}
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-2 mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Telemetry</span>
                <div className="flex items-center gap-1.5">
                    <div className={`h-2 w-2 rounded-full ${status.dot} ${status.pulse ? 'animate-pulse' : ''}`} />
                    <span className="text-[10px] font-bold text-zinc-400">{status.label}</span>
                </div>
            </div>

            {/* Coords */}
            <div className="space-y-1 font-mono text-xs">
                <div className="flex justify-between gap-4">
                    <span className="text-zinc-600">LAT</span>
                    <span className="text-zinc-300 tabular-nums">{lat.toFixed(5)}</span>
                </div>
                <div className="flex justify-between gap-4">
                    <span className="text-zinc-600">LNG</span>
                    <span className="text-zinc-300 tabular-nums">{lng.toFixed(5)}</span>
                </div>
                <div className="flex justify-between gap-4">
                    <span className="text-zinc-600">ZM</span>
                    <span className="text-zinc-300 tabular-nums">{zoom.toFixed(1)}</span>
                </div>
            </div>

            {/* Participant count */}
            {participantCount > 0 && (
                <div className="mt-2 border-t border-white/10 pt-2 flex justify-between items-center">
                    <span className="text-[10px] text-zinc-600">Users</span>
                    <span className="font-mono text-[10px] font-bold text-zinc-400">{participantCount}/3</span>
                </div>
            )}
        </div>
    );
}
