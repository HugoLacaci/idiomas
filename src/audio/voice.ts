/**
 * Voz: audios pregenerados con msedge-tts (public/audio/<voz>/<hash>.mp3) y, si falta
 * alguno, la Web Speech API del dispositivo. En iOS el audio solo suena tras un toque:
 * `unlockAudio()` se llama en el primer toque y reutiliza un único <audio>.
 */
import type { Lang } from '@/content/types';

export type VoiceKey = 'gb-f' | 'gb-m' | 'us-f' | 'us-m' | 'it-f' | 'it-m' | 'es-f';

export const EDGE_VOICES: Record<VoiceKey, { name: string; bcp47: string }> = {
  'gb-f': { name: 'en-GB-SoniaNeural', bcp47: 'en-GB' },
  'gb-m': { name: 'en-GB-RyanNeural', bcp47: 'en-GB' },
  'us-f': { name: 'en-US-JennyNeural', bcp47: 'en-US' },
  'us-m': { name: 'en-US-GuyNeural', bcp47: 'en-US' },
  'it-f': { name: 'it-IT-ElsaNeural', bcp47: 'it-IT' },
  'it-m': { name: 'it-IT-DiegoNeural', bcp47: 'it-IT' },
  'es-f': { name: 'es-ES-ElviraNeural', bcp47: 'es-ES' },
};

/** FNV-1a de 32 bits: el mismo en el script que genera el audio y en la app. */
export function hashText(text: string): string {
  let h = 0x811c9dc5;
  const s = text.trim().normalize('NFC');
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

/** Normaliza el texto que se envía a la voz (quita marcas ==…== y **…**, guiones bajos de huecos). */
export function speakable(text: string): string {
  return text
    .replace(/==|\*\*/g, '')
    .replace(/_{2,}/g, '…')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export interface VoicePrefs {
  accent: 'gb' | 'us';
  gender: 'f' | 'm';
  rate: number; // 0.7 – 1.2, velocidad general
}

let prefs: VoicePrefs = { accent: 'gb', gender: 'f', rate: 1 };
export function setVoicePrefs(p: Partial<VoicePrefs>) {
  prefs = { ...prefs, ...p };
}

export function voiceFor(lang: Lang | 'es', alt = false): VoiceKey {
  const g = alt ? (prefs.gender === 'f' ? 'm' : 'f') : prefs.gender;
  if (lang === 'es') return 'es-f';
  if (lang === 'it') return `it-${g}` as VoiceKey;
  return `${prefs.accent}-${g}` as VoiceKey;
}

// ───────── manifiesto de audios disponibles ─────────
let manifest: Set<string> | null = null;
let manifestPromise: Promise<Set<string>> | null = null;

export function loadManifest(): Promise<Set<string>> {
  if (manifest) return Promise.resolve(manifest);
  manifestPromise ??= fetch('./audio/manifest.json')
    .then((r) => (r.ok ? r.json() : []))
    .catch(() => [])
    .then((list: string[]) => (manifest = new Set(list)));
  return manifestPromise;
}

export function audioUrl(voice: VoiceKey, text: string) {
  return `./audio/${voice}/${hashText(speakable(text))}.mp3`;
}

// ───────── reproducción ─────────
let el: HTMLAudioElement | null = null;
let unlocked = false;
let token = 0;

function audioEl() {
  if (!el) {
    el = new Audio();
    el.preload = 'auto';
    (el as HTMLAudioElement & { playsInline?: boolean }).playsInline = true;
  }
  return el;
}

/** Llamar dentro de un gesto del usuario (primer toque). */
export function unlockAudio() {
  if (unlocked) return;
  unlocked = true;
  try {
    const a = audioEl();
    a.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQxAADB8AhSmxhIIEVCSiJrDCQBTcu3UrAIwUdkRgQbFAZC1CQEwTJ9mjRvBA4UOLD8nKVOWfh+UlK3z/177OXrfOdKl7pyn3Xf//WreyTRUoAWgBgkOAGbZHBgG1OF6zM82DWbZaUmMBptgQhGjsyYqc9ae9XFz280948NMBWInljyzsNRFLPWdnZGWrddDsjK1unuSrVN9jJsK8KuQtQCtMBjCEtImISdNKJOopIpBFpNSMbIHCSRpRR5iakjTiyzLhchUUBwCgyKiweBv/7UsQbg8isVNoMPMjAAAA0gAAABEVFGmgqK////9bP/6XCykxBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq';
    a.play().catch(() => {});
  } catch {
    /* nada */
  }
  try {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      window.speechSynthesis.speak(u);
    }
  } catch {
    /* nada */
  }
}

export function stopAudio() {
  token++;
  if (el) el.pause();
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

function playUrl(url: string, rate: number, my: number): Promise<boolean> {
  return new Promise((resolve) => {
    const a = audioEl();
    a.onended = () => resolve(true);
    a.onerror = () => resolve(false);
    a.src = url;
    a.playbackRate = rate;
    (a as HTMLAudioElement & { preservesPitch?: boolean }).preservesPitch = true;
    a.play().then(
      () => {
        if (my !== token) a.pause();
      },
      () => resolve(false),
    );
  });
}

let cachedVoices: SpeechSynthesisVoice[] = [];
function listVoices() {
  if (!('speechSynthesis' in window)) return [];
  const v = window.speechSynthesis.getVoices();
  if (v.length) cachedVoices = v;
  return cachedVoices;
}
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  listVoices();
  window.speechSynthesis.onvoiceschanged = () => listVoices();
}

/** Mejor voz del sistema: en iPhone prioriza las "mejoradas" o "premium" si están descargadas. */
export function bestSystemVoice(bcp47: string): SpeechSynthesisVoice | undefined {
  const base = bcp47.slice(0, 2).toLowerCase();
  const voices = listVoices().filter((v) => v.lang.replace('_', '-').toLowerCase().startsWith(base));
  const score = (v: SpeechSynthesisVoice) => {
    let s = 0;
    if (v.lang.replace('_', '-').toLowerCase() === bcp47.toLowerCase()) s += 10;
    if (/premium|enhanced|mejorada|natural|neural|online/i.test(v.name)) s += 8;
    if (/google/i.test(v.name)) s += 3;
    if (/novelty|bells|whisper|bad news|zarvox|trinoids|organ|bubbles|cellos|albert|jester|superstar|wobble|boing/i.test(v.name)) s -= 20;
    return s;
  };
  return voices.sort((a, b) => score(b) - score(a))[0];
}

export function systemVoicesFor(bcp47: string) {
  const base = bcp47.slice(0, 2).toLowerCase();
  return listVoices().filter((v) => v.lang.toLowerCase().startsWith(base));
}

function speakSystem(text: string, bcp47: string, rate: number, my: number): Promise<void> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) return resolve();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = bcp47;
    u.rate = Math.max(0.5, Math.min(1.4, rate * 0.95));
    const v = bestSystemVoice(bcp47);
    if (v) u.voice = v;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.cancel();
    if (my === token) window.speechSynthesis.speak(u);
    else resolve();
  });
}

export interface SayOptions {
  slow?: boolean;
  alt?: boolean; // segunda voz (diálogos)
  voice?: VoiceKey;
}

/** Dice un texto en inglés, italiano o español. Se resuelve al terminar. */
export async function say(text: string, lang: Lang | 'es', opts: SayOptions = {}): Promise<void> {
  const clean = speakable(text);
  if (!clean) return;
  stopAudio();
  const my = ++token;
  const voice = opts.voice ?? voiceFor(lang, opts.alt);
  const rate = (opts.slow ? 0.72 : 1) * prefs.rate;
  const m = await loadManifest();
  const h = hashText(clean);
  if (m.has(`${voice}/${h}`)) {
    if (my !== token) return;
    const ok = await playUrl(`./audio/${voice}/${h}.mp3`, rate, my);
    if (ok || my !== token) return;
  }
  // Respaldo: otra voz pregenerada del mismo idioma (el acento americano solo existe para el
  // vocabulario; si falta se usa el británico) y, si no hay ninguna, la voz del sistema.
  const other = (k: string) => (k.endsWith('f') ? k.slice(0, -1) + 'm' : k.slice(0, -1) + 'f');
  const fallbacks: string[] = [other(voice)];
  if (voice.startsWith('us')) fallbacks.push(voice.replace('us', 'gb'), other(voice.replace('us', 'gb')));
  for (const fb of fallbacks) {
    if (my !== token) return;
    if (m.has(`${fb}/${h}`) && (await playUrl(`./audio/${fb}/${h}.mp3`, rate, my))) return;
  }
  await speakSystem(clean, EDGE_VOICES[voice].bcp47, rate, my);
}

export function hasSpeechSynthesis() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}
