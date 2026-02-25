'use client';

/**
 * RoleBadge — renders inline (no fixed/absolute positioning).
 * The parent (room page top-bar) controls its placement.
 */
export default function RoleBadge({ role }) {
    if (!role) return null;
    const isTracker = role === 'tracker';

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold tracking-widest uppercase border backdrop-blur-md whitespace-nowrap shadow-sm
                ${isTracker
                    ? 'bg-black/10 border-white/20 text-black'
                    : 'bg-black/5 border-white/10 text-zinc-400'
                }`}
        >
            <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${isTracker ? 'bg-black animate-pulse' : 'bg-zinc-600'}`} />
            {isTracker ? 'Broadcasting' : '👁 Following'}
        </span>
    );
}
