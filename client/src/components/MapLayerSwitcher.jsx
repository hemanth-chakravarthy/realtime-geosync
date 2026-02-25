'use client';
import { useState } from 'react';

const LAYERS = [
    {
        id: 'streets',
        label: 'Streets',
        icon: '🗺️',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
    },
    {
        id: 'satellite',
        label: 'Satellite',
        icon: '🛰️',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: '© <a href="https://www.esri.com">Esri</a>',
        maxZoom: 19,
    },
    {
        id: 'terrain',
        label: 'Terrain',
        icon: '⛰️',
        url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        attribution: '© <a href="https://opentopomap.org">OpenTopoMap</a>',
        maxZoom: 17,
    },
    {
        id: 'dark',
        label: 'Dark',
        icon: '🌑',
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attribution: '© OSM © CARTO',
        maxZoom: 19,
    },
];

export { LAYERS };

export default function MapLayerSwitcher({ activeLayerId, onLayerChange }) {
    const [open, setOpen] = useState(false);
    const active = LAYERS.find((l) => l.id === activeLayerId) ?? LAYERS[0];

    return (
        <div className="fixed bottom-4 right-4 z-[1000] flex flex-col items-end gap-1.5">
            {/* Layer options */}
            {open && (
                <div className="flex flex-col gap-1 rounded-xl border border-white/10 bg-black/90 p-1.5 shadow-2xl backdrop-blur-md">
                    {LAYERS.map((layer) => (
                        <button
                            key={layer.id}
                            onClick={() => { onLayerChange(layer.id); setOpen(false); }}
                            className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors text-left whitespace-nowrap
                ${activeLayerId === layer.id
                                    ? 'bg-white/10 text-white'
                                    : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-200'
                                }`}
                        >
                            <span>{layer.icon}</span>
                            {layer.label}
                            {activeLayerId === layer.id && (
                                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Toggle button */}
            <button
                onClick={() => setOpen((v) => !v)}
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold backdrop-blur-md shadow-lg transition-colors ${open
                        ? 'border-white/20 bg-zinc-900 text-white'
                        : 'border-white/10 bg-black/80 text-zinc-400 hover:text-white'
                    }`}
            >
                <span>{active.icon}</span>
                <span className="hidden xs:inline">{active.label}</span>
                <span className={`text-[10px] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▲</span>
            </button>
        </div>
    );
}
