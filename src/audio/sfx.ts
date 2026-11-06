/**
 * Sonidos suaves de acierto y fallo generados con Web Audio (sin archivos ni licencias).
 * Volumen bajo por defecto; se desactivan en Ajustes.
 */
let ctx: AudioContext | null = null;
let volume = 0.25;
let enabled = true;

export function setSfx(opts: { enabled?: boolean; volume?: number }) {
  if (opts.enabled !== undefined) enabled = opts.enabled;
  if (opts.volume !== undefined) volume = opts.volume;
}

function getCtx() {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** Desbloquea el contexto de audio en iOS (llamar en el primer toque). */
export function unlockSfx() {
  const c = getCtx();
  if (!c) return;
  const b = c.createBuffer(1, 1, 22050);
  const s = c.createBufferSource();
  s.buffer = b;
  s.connect(c.destination);
  s.start(0);
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', gain = 1) {
  const c = getCtx();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  const t = c.currentTime + start;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(volume * gain, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

export function playCorrect() {
  if (!enabled) return;
  tone(659.25, 0, 0.18, 'sine');
  tone(987.77, 0.09, 0.28, 'sine', 0.8);
}

export function playWrong() {
  if (!enabled) return;
  tone(311.13, 0, 0.22, 'triangle', 0.7);
  tone(261.63, 0.12, 0.3, 'triangle', 0.6);
}

export function playFanfare() {
  if (!enabled) return;
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.11, 0.35, 'sine', 0.8));
}

export function playStamp() {
  if (!enabled) return;
  tone(110, 0, 0.12, 'square', 0.4);
  tone(80, 0.02, 0.2, 'sine', 0.8);
}
