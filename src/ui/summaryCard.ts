/**
 * Tarjeta-resumen de la lección como imagen PNG (canvas), para guardarla o compartirla.
 */
import type { Lang, Lesson } from '@/content/types';

const THEME: Record<Lang, { bg: string; ink: string; primary: string; accent: string; pop: string; font: string }> = {
  en: { bg: '#FAF7F0', ink: '#1D2B53', primary: '#D7262E', accent: '#1D2B53', pop: '#F2B33D', font: '"DM Serif Display", Georgia, serif' },
  it: { bg: '#FFF8EC', ink: '#40261C', primary: '#C8553D', accent: '#2A7DB8', pop: '#F4D35E', font: '"Playfair Display Variable", Georgia, serif' },
};

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number) {
  const words = text.split(' ');
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, y);
      line = w;
      y += lh;
    } else line = test;
  }
  if (line) ctx.fillText(line, x, y);
  return y + lh;
}

export async function makeSummaryCard(lesson: Lesson, lang: Lang, name: string): Promise<Blob> {
  const t = THEME[lang];
  const W = 1080;
  const H = 1350;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d')!;
  await document.fonts?.ready;
  ctx.fillStyle = t.bg;
  ctx.fillRect(0, 0, W, H);
  // borde de postal
  for (let x = 0; x < W; x += 60) {
    ctx.fillStyle = (x / 60) % 2 ? t.accent : t.primary;
    ctx.fillRect(x, 0, 30, 18);
    ctx.fillRect(x + 30, H - 18, 30, 18);
  }
  ctx.strokeStyle = t.pop;
  ctx.lineWidth = 10;
  ctx.strokeRect(50, 60, W - 100, H - 120);

  ctx.fillStyle = t.primary;
  ctx.font = `bold 40px Nunito, sans-serif`;
  ctx.fillText(lang === 'en' ? 'ENGLISH 🇬🇧' : 'ITALIANO 🇮🇹', 100, 150);
  ctx.fillStyle = t.ink;
  ctx.font = `76px ${t.font}`;
  let y = wrap(ctx, lesson.title, 100, 250, W - 200, 88);

  ctx.font = `bold 38px Nunito, sans-serif`;
  ctx.fillStyle = t.accent;
  ctx.fillText('Lo que he aprendido hoy:', 100, y + 30);
  y += 100;
  ctx.fillStyle = t.ink;
  ctx.font = `36px Nunito, sans-serif`;
  for (const s of lesson.summary.slice(0, 5)) {
    y = wrap(ctx, `• ${s.replace(/==|\*\*/g, '')}`, 100, y, W - 200, 48) + 10;
  }
  y += 20;
  ctx.font = `bold 38px Nunito, sans-serif`;
  ctx.fillStyle = t.accent;
  ctx.fillText('Palabras nuevas:', 100, y);
  y += 60;
  ctx.font = `34px Nunito, sans-serif`;
  ctx.fillStyle = t.ink;
  const words = lesson.vocab.slice(0, 8);
  words.forEach((v, k) => {
    const col = k % 2;
    const row = Math.floor(k / 2);
    ctx.fillText(`${v.emoji ?? ''} ${v.t}`.slice(0, 26), 100 + col * 450, y + row * 56);
  });
  ctx.font = `italic 34px Nunito, sans-serif`;
  ctx.fillStyle = t.primary;
  ctx.fillText(`— ${name}, ${new Date().toLocaleDateString('es-ES')}`, 100, H - 110);
  return new Promise((res) => c.toBlob((b) => res(b!), 'image/png'));
}

export async function shareOrSaveImage(blob: Blob, filename: string) {
  const file = new File([blob], filename, { type: 'image/png' });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file] });
      return;
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
