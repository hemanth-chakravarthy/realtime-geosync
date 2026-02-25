'use client';
import { useEffect, useRef } from 'react';
import createGlobe from 'cobe';

export default function GlobeAnimation() {
  const canvasRef = useRef(null);
  const phi = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Match exactly: cobe will set canvas.width = width * dpr internally.
    // We let CSS control display size via width/height on the element.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = 300; // rendered globe size in logical px

    const globe = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width: size * dpr,
      height: size * dpr,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 1.1,
      mapSamples: 20000,
      mapBrightness: 7,
      baseColor: [0.12, 0.12, 0.12],
      markerColor: [1, 1, 1],
      glowColor: [0.25, 0.25, 0.25],
      markers: [],
      onRender(state) {
        state.phi = phi.current;
        phi.current += 0.003;
      },
    });

    // Fade in
    requestAnimationFrame(() => {
      if (canvas) canvas.style.opacity = '1';
    });

    return () => globe.destroy();
  }, []);

  return (
    <div
      style={{
        width: 300,
        height: 300,
        overflow: 'hidden',
        borderRadius: '50%',
        margin: '0 auto',
        flexShrink: 0,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: 300,
          height: 300,
          opacity: 0,
          transition: 'opacity 1s ease',
          display: 'block',
        }}
      />
    </div>
  );
}
