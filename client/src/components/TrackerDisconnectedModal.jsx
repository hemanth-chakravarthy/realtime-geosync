'use client';

export default function TrackerDisconnectedModal({ onResync, onLeave }) {
    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-sm">

            {/* Same subtle grid as landing page */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                    opacity: 0.03,
                    backgroundImage:
                        'linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)',
                    backgroundSize: '48px 48px',
                }}
            />

            {/* Card — matches landing page card style exactly */}
            <div className="relative w-full max-w-xs mx-4 rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl text-center">

                {/* Icon */}
                <div className="mb-4 flex items-center justify-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-zinc-900 text-xl">
                        📡
                    </span>
                </div>

                {/* Title */}
                <h2 className="text-base font-bold text-white mb-1 tracking-tight">
                    Tracker Disconnected
                </h2>
                <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
                    The Tracker has left the session.<br />The map is now frozen.
                </p>

                {/* Actions — white primary, zinc secondary (same as landing page) */}
                <div className="flex flex-col gap-2.5">
                    <button
                        onClick={onResync}
                        className="w-full rounded-lg bg-white hover:bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-black transition-colors"
                    >
                        Wait for Tracker
                    </button>
                    <button
                        onClick={onLeave}
                        className="w-full rounded-lg border border-white/10 bg-zinc-900 hover:border-white/20 hover:bg-zinc-800 px-4 py-2.5 text-sm font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                        Leave Session
                    </button>
                </div>
            </div>
        </div>
    );
}
