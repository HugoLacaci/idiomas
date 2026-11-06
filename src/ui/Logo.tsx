import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/** Logo de la app. Cinco toques seguidos abren el Modo Hugo (oculto). */
export function Logo({ size = 64 }: { size?: number }) {
  const nav = useNavigate();
  const taps = useRef<number[]>([]);
  return (
    <button
      type="button"
      aria-label="Idiomas de Yolanda"
      onClick={() => {
        const now = Date.now();
        taps.current = [...taps.current.filter((t) => now - t < 2500), now];
        if (taps.current.length >= 5) {
          taps.current = [];
          nav('/hugo');
        }
      }}
      className="inline-flex flex-col items-center gap-1 rounded-2xl p-2"
    >
      <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden>
        <rect x="4" y="4" width="92" height="92" rx="22" fill="#FAF7F0" stroke="#1D2B53" strokeWidth="4" />
        <path d="M4 50 V26 Q4 4 26 4 H50 V50 Z" fill="#1D2B53" />
        <path d="M50 4 H74 Q96 4 96 26 V50 H50 Z" fill="#C8553D" />
        <path d="M4 50 H50 V96 H26 Q4 96 4 74 Z" fill="#F4D35E" />
        <path d="M50 50 H96 V74 Q96 96 74 96 H50 Z" fill="#D7262E" />
        <circle cx="50" cy="50" r="26" fill="#FAF7F0" stroke="#1D2B53" strokeWidth="4" />
        <text x="50" y="60" textAnchor="middle" fontFamily="'DM Serif Display', Georgia, serif" fontSize="30" fill="#1D2B53">
          Y
        </text>
      </svg>
      <span className="text-sm font-bold text-ink-soft">Idiomas de Yolanda</span>
    </button>
  );
}
