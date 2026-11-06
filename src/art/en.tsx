/** Ilustraciones originales del tema inglés "London & beyond" (SVG propio, sin licencias de terceros). */
import type { SVGProps } from 'react';

const NAVY = '#1D2B53';
const RED = '#D7262E';
const MUSTARD = '#F2B33D';
const GREEN = '#3E7C59';
const CREAM = '#FAF7F0';

type P = SVGProps<SVGSVGElement> & { title?: string };

export function Bus({ title = 'Autobús de dos pisos', ...p }: P) {
  return (
    <svg viewBox="0 0 220 150" role="img" aria-label={title} {...p}>
      <rect x="10" y="12" width="196" height="112" rx="16" fill={RED} />
      <rect x="10" y="66" width="196" height="6" fill="#B01E25" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={`u${i}`} x={22 + i * 36} y="24" width="28" height="30" rx="5" fill="#CFE3F1" stroke={NAVY} strokeWidth="2" />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <rect key={`d${i}`} x={58 + i * 36} y="80" width="28" height="26" rx="5" fill="#CFE3F1" stroke={NAVY} strokeWidth="2" />
      ))}
      <rect x="20" y="78" width="30" height="40" rx="4" fill={MUSTARD} stroke={NAVY} strokeWidth="2" />
      <rect x="70" y="58" width="76" height="8" rx="2" fill={CREAM} />
      <text x="108" y="64.5" textAnchor="middle" fontSize="7" fontFamily="sans-serif" fontWeight="700" fill={NAVY}>
        LONDON
      </text>
      <circle cx="52" cy="126" r="15" fill={NAVY} />
      <circle cx="52" cy="126" r="6" fill="#9AA3BD" />
      <circle cx="166" cy="126" r="15" fill={NAVY} />
      <circle cx="166" cy="126" r="6" fill="#9AA3BD" />
      <rect x="196" y="96" width="8" height="10" rx="2" fill={MUSTARD} />
    </svg>
  );
}

export function BigBen({ title = 'Big Ben', ...p }: P) {
  return (
    <svg viewBox="0 0 80 220" role="img" aria-label={title} {...p}>
      <polygon points="40,4 50,40 30,40" fill={NAVY} />
      <rect x="28" y="40" width="24" height="16" fill="#C9A86A" />
      <rect x="22" y="56" width="36" height="44" fill="#D9BC7E" />
      <circle cx="40" cy="78" r="15" fill={CREAM} stroke={NAVY} strokeWidth="3" />
      <line x1="40" y1="78" x2="40" y2="68" stroke={NAVY} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="40" y1="78" x2="47" y2="81" stroke={NAVY} strokeWidth="2.5" strokeLinecap="round" />
      <rect x="18" y="100" width="44" height="116" fill="#C9A86A" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x="26" y={108 + i * 17} width="28" height="9" rx="2" fill="#A88A52" />
      ))}
    </svg>
  );
}

export function PhoneBox({ title = 'Cabina telefónica', ...p }: P) {
  return (
    <svg viewBox="0 0 80 170" role="img" aria-label={title} {...p}>
      <path d="M10 26 Q40 4 70 26 V164 H10 Z" fill={RED} />
      <rect x="16" y="28" width="48" height="10" fill={NAVY} />
      <text x="40" y="36" textAnchor="middle" fontSize="7" fontFamily="sans-serif" fontWeight="800" fill={CREAM}>
        TELEPHONE
      </text>
      {[0, 1, 2].map((r) =>
        [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={18 + c * 15} y={46 + r * 18} width="12" height="14" rx="1.5" fill="#CFE3F1" />),
      )}
      <rect x="16" y="104" width="48" height="54" rx="3" fill="#B01E25" />
      <rect x="56" y="122" width="4" height="14" rx="2" fill={MUSTARD} />
    </svg>
  );
}

export function Cab({ title = 'Taxi negro', ...p }: P) {
  return (
    <svg viewBox="0 0 200 110" role="img" aria-label={title} {...p}>
      <path d="M20 70 Q24 40 60 36 L80 18 H140 L162 40 Q186 44 188 70 V84 H20 Z" fill="#1E1E24" />
      <rect x="92" y="10" width="24" height="9" rx="3" fill={MUSTARD} />
      <path d="M86 24 H112 V42 H74 Z" fill="#CFE3F1" />
      <path d="M118 24 H138 L154 42 H118 Z" fill="#CFE3F1" />
      <circle cx="58" cy="86" r="15" fill="#333" />
      <circle cx="58" cy="86" r="6" fill="#999" />
      <circle cx="152" cy="86" r="15" fill="#333" />
      <circle cx="152" cy="86" r="6" fill="#999" />
      <circle cx="182" cy="60" r="5" fill={MUSTARD} />
    </svg>
  );
}

export function TeaCup({ title = 'Té con galletas', ...p }: P) {
  return (
    <svg viewBox="0 0 160 120" role="img" aria-label={title} {...p}>
      <ellipse cx="74" cy="104" rx="62" ry="10" fill="#E6DCCB" />
      <path d="M30 46 H118 Q116 96 74 98 Q32 96 30 46 Z" fill={CREAM} stroke={NAVY} strokeWidth="3" />
      <path d="M118 56 Q140 56 136 72 Q132 86 112 82" fill="none" stroke={NAVY} strokeWidth="5" />
      <ellipse cx="74" cy="47" rx="44" ry="7" fill="#B9773C" />
      <path d="M40 66 H108" stroke={RED} strokeWidth="5" />
      <path d="M60 30 Q54 20 62 12 M80 32 Q74 20 82 10" stroke="#9AA3BD" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="140" cy="104" r="14" fill={MUSTARD} stroke="#B98520" strokeWidth="2" />
      <circle cx="136" cy="100" r="1.8" fill="#B98520" />
      <circle cx="144" cy="106" r="1.8" fill="#B98520" />
    </svg>
  );
}

export function Umbrella({ title = 'Paraguas y lluvia', ...p }: P) {
  return (
    <svg viewBox="0 0 140 140" role="img" aria-label={title} {...p}>
      {[16, 40, 100, 124].map((x, i) => (
        <line key={i} x1={x} y1={i % 2 ? 6 : 14} x2={x - 4} y2={i % 2 ? 22 : 30} stroke="#6E8BB8" strokeWidth="3" strokeLinecap="round" />
      ))}
      <path d="M14 70 Q70 0 126 70 Q112 60 98 70 Q84 60 70 70 Q56 60 42 70 Q28 60 14 70 Z" fill={NAVY} />
      <path d="M70 70 V118 Q70 130 58 128" fill="none" stroke="#5B4636" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

export function YellowCab({ title = 'Taxi amarillo de Nueva York', ...p }: P) {
  return (
    <svg viewBox="0 0 200 100" role="img" aria-label={title} {...p}>
      <path d="M14 64 Q16 46 44 42 L66 22 H134 L158 42 Q186 46 188 64 V80 H14 Z" fill="#F7C531" />
      <rect x="86" y="12" width="28" height="10" rx="3" fill="#222" />
      <path d="M72 28 H98 V44 H56 Z M104 28 H130 L146 44 H104 Z" fill="#CFE3F1" />
      <path d="M14 60 H188" stroke="#222" strokeWidth="4" strokeDasharray="8 6" />
      <circle cx="52" cy="82" r="14" fill="#333" />
      <circle cx="152" cy="82" r="14" fill="#333" />
    </svg>
  );
}

export function Kangaroo({ title = 'Canguro', ...p }: P) {
  return (
    <svg viewBox="0 0 120 120" role="img" aria-label={title} {...p}>
      <path d="M30 110 Q16 112 10 100 Q30 104 44 92 Q40 70 56 56 Q60 34 74 26 L72 12 L80 22 L86 12 L86 28 Q98 32 96 42 L84 44 Q78 62 86 80 L98 108 H84 L74 90 L66 108 H52 Q60 96 56 88 Q46 104 30 110 Z" fill="#C2793E" />
      <circle cx="84" cy="34" r="2.5" fill="#222" />
    </svg>
  );
}

export function MapleLeaf({ title = 'Hoja de arce', ...p }: P) {
  return (
    <svg viewBox="0 0 100 100" role="img" aria-label={title} {...p}>
      <path
        d="M50 6 L58 26 L70 20 L66 44 L82 34 L80 46 L94 48 L82 60 L86 66 L60 64 L54 92 H46 L40 64 L14 66 L18 60 L6 48 L20 46 L18 34 L34 44 L30 20 L42 26 Z"
        fill={RED}
      />
    </svg>
  );
}

export function PostStamp({ children, color = RED, size = 96 }: { children?: React.ReactNode; color?: string; size?: number }) {
  return (
    <svg viewBox="0 0 100 120" width={size} height={size * 1.2} aria-hidden>
      <defs>
        <mask id="perf">
          <rect width="100" height="120" fill="white" />
          {Array.from({ length: 10 }).map((_, i) => (
            <g key={i}>
              <circle cx={5 + i * 10} cy="0" r="4" fill="black" />
              <circle cx={5 + i * 10} cy="120" r="4" fill="black" />
            </g>
          ))}
          {Array.from({ length: 12 }).map((_, i) => (
            <g key={`v${i}`}>
              <circle cx="0" cy={5 + i * 10} r="4" fill="black" />
              <circle cx="100" cy={5 + i * 10} r="4" fill="black" />
            </g>
          ))}
        </mask>
      </defs>
      <rect width="100" height="120" fill={CREAM} mask="url(#perf)" />
      <rect x="9" y="9" width="82" height="102" fill="none" stroke={color} strokeWidth="3" />
      {children}
    </svg>
  );
}

/** Mascota: Percy, la paloma londinense con bombín. */
export function Percy({ mood = 'happy', size = 96, title = 'Percy, la paloma' }: { mood?: 'happy' | 'think' | 'cheer'; size?: number; title?: string }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} role="img" aria-label={title}>
      <ellipse cx="60" cy="112" rx="30" ry="5" fill="rgba(0,0,0,.12)" />
      {/* cuerpo */}
      <path d="M28 78 Q24 46 54 40 Q84 36 92 66 Q98 94 70 104 Q38 110 28 78 Z" fill="#8E99B3" />
      <path d="M40 80 Q48 96 72 96 Q86 92 88 78 Q72 90 56 84 Z" fill="#B7C0D4" />
      {/* cuello tornasolado */}
      <path d="M50 44 Q62 40 74 46 Q74 58 62 60 Q50 58 50 44 Z" fill="#5FA38A" />
      <path d="M52 50 Q62 56 72 50" stroke="#9A6FB0" strokeWidth="3" fill="none" />
      {/* cabeza */}
      <circle cx="62" cy="34" r="18" fill="#9AA5BE" />
      <circle cx="68" cy="31" r="5" fill="white" />
      <circle cx="69" cy="31" r="2.6" fill="#1D2B53" />
      <path d="M78 36 L90 39 L78 42 Z" fill={MUSTARD} />
      {mood === 'cheer' && <path d="M56 40 Q60 44 64 40" stroke="#1D2B53" strokeWidth="2" fill="none" />}
      {/* bombín */}
      <ellipse cx="60" cy="20" rx="22" ry="5" fill="#1E1E24" />
      <path d="M46 20 Q46 2 60 2 Q74 2 74 20 Z" fill="#1E1E24" />
      <rect x="46" y="14" width="28" height="4" fill={RED} />
      {/* ala */}
      {mood === 'cheer' ? (
        <path d="M34 66 Q14 40 30 30 Q40 52 50 62 Z" fill="#7A86A2" />
      ) : (
        <path d="M36 70 Q50 58 70 72 Q56 84 38 80 Z" fill="#7A86A2" />
      )}
      {/* patas */}
      <path d="M54 104 V112 M66 104 V112" stroke="#D96B6B" strokeWidth="4" strokeLinecap="round" />
      {mood === 'think' && (
        <g>
          <circle cx="98" cy="18" r="4" fill="#fff" stroke="#9AA3BD" />
          <circle cx="106" cy="8" r="6" fill="#fff" stroke="#9AA3BD" />
        </g>
      )}
    </svg>
  );
}

/** Fondo decorativo lateral para escritorio. */
export function LondonSkyline(p: P) {
  return (
    <svg viewBox="0 0 400 120" preserveAspectRatio="xMidYMax slice" aria-hidden {...p}>
      <path d="M0 120 V90 H30 V70 H50 V90 H70 V60 H90 V90 H120 V40 L126 30 L132 40 V90 H160 V75 Q175 50 190 75 V90 H220 V66 H240 V90 H270 V50 H280 V90 H310 V72 H340 V90 H400 V120 Z" fill={NAVY} opacity=".12" />
      <circle cx="350" cy="40" r="22" fill="none" stroke={NAVY} strokeWidth="3" opacity=".12" />
    </svg>
  );
}

export const EN_COLORS = { NAVY, RED, MUSTARD, GREEN, CREAM };
