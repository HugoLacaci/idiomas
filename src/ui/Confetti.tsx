import { useEffect, useRef } from 'react';
import { reducedMotion } from '@/data/settings';

/** Confeti suave en canvas (sin librerías). No aparece con "reducir animaciones". */
export function Confetti({ colors = ['#D7262E', '#F2B33D', '#1D2B53', '#3E7C59'], pieces = 90 }: { colors?: string[]; pieces?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (reducedMotion()) return;
    const c = ref.current!;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      c.width = window.innerWidth * dpr;
      c.height = window.innerHeight * dpr;
    };
    resize();
    const W = () => c.width;
    const ps = Array.from({ length: pieces }, () => ({
      x: Math.random() * W(),
      y: -Math.random() * c.height * 0.6,
      w: (6 + Math.random() * 6) * dpr,
      h: (8 + Math.random() * 8) * dpr,
      vy: (1.5 + Math.random() * 2.5) * dpr,
      vx: (Math.random() - 0.5) * 1.5 * dpr,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      ctx.clearRect(0, 0, c.width, c.height);
      const fade = Math.max(0, 1 - (t - t0 - 2500) / 1200);
      ctx.globalAlpha = fade;
      for (const p of ps) {
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (fade > 0) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [colors, pieces]);
  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-[60] h-full w-full" />;
}
