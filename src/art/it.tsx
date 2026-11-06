/** Ilustraciones originales del tema italiano "La dolce vita" (SVG propio). */
import type { SVGProps } from 'react';

const TERRA = '#C8553D';
const LEMON = '#F4D35E';
const BLUE = '#2A7DB8';
const OLIVE = '#7A8B3C';
const CREAM = '#FFF8EC';
const INK = '#40261C';

type P = SVGProps<SVGSVGElement> & { title?: string };

export function Lemon({ title = 'Limones', ...p }: P) {
  return (
    <svg viewBox="0 0 140 110" role="img" aria-label={title} {...p}>
      <path d="M60 20 Q76 4 98 12 Q84 22 72 26 Z" fill={OLIVE} />
      <path d="M78 24 Q104 16 120 32 Q100 38 84 34 Z" fill="#94A64A" />
      <ellipse cx="50" cy="62" rx="36" ry="28" fill={LEMON} transform="rotate(-20 50 62)" />
      <ellipse cx="94" cy="70" rx="30" ry="24" fill="#F7DD72" transform="rotate(15 94 70)" />
      <circle cx="40" cy="54" r="5" fill="#FFF3B0" />
      <circle cx="88" cy="62" r="4" fill="#FFF3B0" />
    </svg>
  );
}

export function Vespa({ title = 'Vespa', ...p }: P) {
  return (
    <svg viewBox="0 0 200 130" role="img" aria-label={title} {...p}>
      <circle cx="46" cy="104" r="20" fill="#333" />
      <circle cx="46" cy="104" r="8" fill="#AAA" />
      <circle cx="158" cy="104" r="20" fill="#333" />
      <circle cx="158" cy="104" r="8" fill="#AAA" />
      <path d="M20 96 Q22 66 60 62 H112 Q136 62 140 92 L120 100 H60 Q40 100 20 96 Z" fill="#7FC8C0" />
      <path d="M134 92 L150 34 H160 L150 92 Z" fill="#7FC8C0" />
      <path d="M140 100 Q158 76 180 96" fill="#7FC8C0" />
      <rect x="62" y="52" width="44" height="12" rx="6" fill={INK} />
      <path d="M144 34 H174" stroke="#333" strokeWidth="5" strokeLinecap="round" />
      <circle cx="160" cy="44" r="7" fill={LEMON} stroke="#333" strokeWidth="2" />
    </svg>
  );
}

export function Espresso({ title = 'Taza de espresso', ...p }: P) {
  return (
    <svg viewBox="0 0 120 110" role="img" aria-label={title} {...p}>
      <ellipse cx="58" cy="96" rx="48" ry="9" fill="#E9D9C0" />
      <path d="M26 46 H90 Q88 88 58 90 Q28 88 26 46 Z" fill="white" stroke={INK} strokeWidth="3" />
      <path d="M90 54 Q106 54 104 66 Q102 78 86 76" fill="none" stroke={INK} strokeWidth="5" />
      <ellipse cx="58" cy="47" rx="32" ry="6" fill="#6B3A22" />
      <ellipse cx="54" cy="46" rx="14" ry="2.5" fill="#B9773C" />
      <path d="M46 34 Q40 22 48 12 M64 34 Q58 22 66 10" stroke="#C9B49A" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function Colosseum({ title = 'El Coliseo', ...p }: P) {
  return (
    <svg viewBox="0 0 220 120" role="img" aria-label={title} {...p}>
      <path d="M10 116 V40 Q110 6 210 40 V116 Z" fill="#E2B98A" />
      <path d="M150 20 Q190 26 210 40 V116 H160 Z" fill="#CFA06E" />
      {[0, 1, 2].map((r) =>
        Array.from({ length: 9 }).map((_, i) => (
          <path key={`${r}-${i}`} d={`M${20 + i * 20} ${108 - r * 26} v-14 a6 6 0 0 1 12 0 v14 z`} fill="#8A5A3A" opacity={0.85 - r * 0.1} />
        )),
      )}
    </svg>
  );
}

export function Pisa({ title = 'Torre de Pisa', ...p }: P) {
  return (
    <svg viewBox="0 0 90 200" role="img" aria-label={title} {...p}>
      <g transform="rotate(5 45 196)">
        <rect x="24" y="20" width="42" height="176" rx="4" fill="#F3EBDD" stroke="#C9B9A0" strokeWidth="2" />
        {Array.from({ length: 7 }).map((_, i) => (
          <g key={i}>
            <rect x="22" y={30 + i * 24} width="46" height="4" fill="#C9B9A0" />
            {[0, 1, 2].map((c) => (
              <rect key={c} x={30 + c * 12} y={36 + i * 24} width="6" height="14" rx="3" fill="#B7A68A" />
            ))}
          </g>
        ))}
        <rect x="30" y="6" width="30" height="16" rx="3" fill="#F3EBDD" stroke="#C9B9A0" strokeWidth="2" />
      </g>
    </svg>
  );
}

export function Gondola({ title = 'Góndola en Venecia', ...p }: P) {
  return (
    <svg viewBox="0 0 220 110" role="img" aria-label={title} {...p}>
      <path d="M0 90 Q55 80 110 90 T220 90 V110 H0 Z" fill={BLUE} opacity=".7" />
      <path d="M10 76 Q100 100 196 66 L206 50 Q200 70 186 72 Q100 88 18 70 Z" fill="#222" />
      <rect x="128" y="20" width="4" height="60" fill="#8A5A3A" transform="rotate(18 130 50)" />
      <circle cx="146" cy="30" r="6" fill="#E6B98A" />
      <path d="M140 38 H152 V58 H140 Z" fill="white" />
      <path d="M140 42 H152 M140 48 H152 M140 54 H152" stroke={TERRA} strokeWidth="2" />
      <ellipse cx="146" cy="24" rx="9" ry="3" fill="#E9D6A0" />
    </svg>
  );
}

export function Duomo({ title = 'El Duomo de Florencia', ...p }: P) {
  return (
    <svg viewBox="0 0 160 140" role="img" aria-label={title} {...p}>
      <rect x="20" y="88" width="120" height="48" fill="#F3EBDD" />
      <path d="M44 88 Q44 30 80 26 Q116 30 116 88 Z" fill={TERRA} />
      {[56, 68, 80, 92, 104].map((x) => (
        <path key={x} d={`M80 26 Q${x} 50 ${x} 88`} stroke="#F3EBDD" strokeWidth="2" fill="none" opacity=".7" />
      ))}
      <rect x="74" y="12" width="12" height="16" fill="#F3EBDD" />
      <circle cx="80" cy="9" r="4" fill="#C9A86A" />
      {[30, 50, 70, 90, 110].map((x) => (
        <rect key={x} x={x} y="100" width="10" height="24" rx="5" fill={OLIVE} opacity=".6" />
      ))}
    </svg>
  );
}

/** Azulejo de Positano/Amalfi (fondo o tarjeta). */
export function Tile({ size = 80, color = BLUE, accent = LEMON }: { size?: number; color?: string; accent?: string }) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size} aria-hidden>
      <rect width="80" height="80" fill={CREAM} />
      <rect x="2" y="2" width="76" height="76" fill="none" stroke={color} strokeWidth="3" />
      <circle cx="40" cy="40" r="14" fill={accent} stroke={color} strokeWidth="3" />
      {[0, 90, 180, 270].map((a) => (
        <path key={a} d="M40 6 Q50 18 40 26 Q30 18 40 6 Z" fill={color} transform={`rotate(${a} 40 40)`} />
      ))}
      {[45, 135, 225, 315].map((a) => (
        <circle key={a} cx="40" cy="12" r="4" fill={OLIVE} transform={`rotate(${a} 40 40)`} />
      ))}
    </svg>
  );
}

export function Awning({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 34" preserveAspectRatio="none" className={className} aria-hidden>
      {Array.from({ length: 20 }).map((_, i) => (
        <path key={i} d={`M${i * 20} 0 H${i * 20 + 20} V24 Q${i * 20 + 10} 34 ${i * 20} 24 Z`} fill={i % 2 ? CREAM : TERRA} />
      ))}
    </svg>
  );
}

/** Mascota: Lina, la gaviota del Mediterráneo con gafas de sol. */
export function Lina({ mood = 'happy', size = 96, title = 'Lina, la gaviota' }: { mood?: 'happy' | 'think' | 'cheer'; size?: number; title?: string }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} role="img" aria-label={title}>
      <ellipse cx="60" cy="112" rx="30" ry="5" fill="rgba(0,0,0,.12)" />
      <path d="M26 76 Q24 46 56 42 Q88 40 94 70 Q96 98 64 104 Q32 106 26 76 Z" fill="#FFFFFF" stroke="#D9D2C5" strokeWidth="2" />
      {mood === 'cheer' ? (
        <path d="M34 66 Q8 40 22 26 Q38 50 52 60 Z" fill="#9AA6B2" />
      ) : (
        <path d="M34 70 Q54 56 80 70 Q60 86 38 80 Z" fill="#9AA6B2" />
      )}
      <path d="M34 72 Q56 64 76 72" stroke="#3B4650" strokeWidth="3" fill="none" />
      <circle cx="62" cy="34" r="19" fill="#FFFFFF" stroke="#D9D2C5" strokeWidth="2" />
      {/* gafas de sol */}
      <rect x="52" y="27" width="14" height="9" rx="4" fill="#222" />
      <rect x="68" y="27" width="12" height="9" rx="4" fill="#222" />
      <path d="M66 30 H68" stroke="#222" strokeWidth="2" />
      <path d="M54 29 L60 29" stroke="#666" strokeWidth="1.5" />
      <path d="M78 40 L96 43 L80 47 Z" fill={LEMON} stroke="#D9A520" strokeWidth="1" />
      <circle cx="91" cy="44" r="2" fill={TERRA} />
      {mood === 'cheer' && <path d="M60 46 Q64 50 70 46" stroke="#40261C" strokeWidth="2" fill="none" />}
      {/* pañuelo */}
      <path d="M48 50 Q62 58 76 50 L72 60 Q62 64 52 60 Z" fill={TERRA} />
      <path d="M52 104 V112 M66 104 V112" stroke="#F0A040" strokeWidth="4" strokeLinecap="round" />
      {mood === 'think' && (
        <g>
          <circle cx="98" cy="18" r="4" fill="#fff" stroke="#C9B49A" />
          <circle cx="106" cy="8" r="6" fill="#fff" stroke="#C9B49A" />
        </g>
      )}
    </svg>
  );
}

export function ItalySkyline(p: P) {
  return (
    <svg viewBox="0 0 400 120" preserveAspectRatio="xMidYMax slice" aria-hidden {...p}>
      <path d="M0 120 V92 H40 V80 Q70 50 100 80 V92 H130 V40 L138 34 L146 40 V92 H170 V74 H200 V92 Q240 60 280 92 H300 V60 Q310 50 320 60 V92 H400 V120 Z" fill={TERRA} opacity=".14" />
    </svg>
  );
}

export const IT_COLORS = { TERRA, LEMON, BLUE, OLIVE, CREAM, INK };
