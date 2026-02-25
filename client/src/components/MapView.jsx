'use client';
import { useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getSocket } from '@/lib/socket';
import { useGeoSync } from '@/context/GeoSyncContext';
import { LAYERS } from './MapLayerSwitcher';

// Throttle utility
function throttle(fn, limit) {
    let lastTime = 0;
    return (...args) => {
        const now = Date.now();
        if (now - lastTime >= limit) {
            lastTime = now;
            fn(...args);
        }
    };
}

// ── Dynamic tile layer swap ───────────────────────────────────────────────────
function DynamicTileLayer({ layerId }) {
    const layer = LAYERS.find((l) => l.id === layerId) ?? LAYERS[0];
    return (
        <TileLayer
            key={layer.id}
            url={layer.url}
            attribution={layer.attribution}
            maxZoom={layer.maxZoom}
        />
    );
}

// ── TrackerController — emits map-move events ─────────────────────────────────
function TrackerController({ roomCode }) {
    const { setCoords } = useGeoSync();

    const emitMove = useCallback(
        throttle((map) => {
            const center = map.getCenter();
            const zoom = map.getZoom();
            const lat = parseFloat(center.lat.toFixed(6));
            const lng = parseFloat(center.lng.toFixed(6));
            const zoomVal = parseFloat(zoom.toFixed(1));
            setCoords({ lat, lng, zoom: zoomVal });
            getSocket().emit('map-move', { roomCode, lat, lng, zoom: zoomVal });
        }, 100),
        [roomCode, setCoords]
    );

    useMapEvents({
        move(e) { emitMove(e.target); },
        zoom(e) { emitMove(e.target); },
    });

    return null;
}

// ── FollowerController — flies to incoming coordinates ────────────────────────
function FollowerController() {
    const map = useMap();
    const { coords } = useGeoSync();
    const prevCoords = useRef(null);

    useEffect(() => {
        const prev = prevCoords.current;
        if (prev && (prev.lat !== coords.lat || prev.lng !== coords.lng || prev.zoom !== coords.zoom)) {
            map.flyTo([coords.lat, coords.lng], coords.zoom, { animate: true, duration: 0.25 });
        }
        prevCoords.current = coords;
    }, [coords, map]);

    useEffect(() => {
        map.dragging.disable();
        map.scrollWheelZoom.disable();
        map.doubleClickZoom.disable();
        map.touchZoom.disable();
        map.keyboard.disable();
        return () => {
            map.dragging.enable();
            map.scrollWheelZoom.enable();
        };
    }, [map]);

    return null;
}

// ── Main MapView component ────────────────────────────────────────────────────
export default function MapView({ roomCode, activeLayerId = 'streets' }) {
    const { role, coords } = useGeoSync();

    return (
        <MapContainer
            center={[coords.lat, coords.lng]}
            zoom={coords.zoom}
            className="h-full w-full"
            zoomControl={role === 'tracker'}
        >
            <DynamicTileLayer layerId={activeLayerId} />
            {role === 'tracker' && <TrackerController roomCode={roomCode} />}
            {role === 'follower' && <FollowerController />}
        </MapContainer>
    );
}
