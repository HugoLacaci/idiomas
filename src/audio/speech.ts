/**
 * Hablar: reconocimiento de voz (Web Speech API) con respaldo a grabar con
 * MediaRecorder y autoevaluarse. La valoración es orientativa y amable:
 * el reconocimiento tiende a "corregir" lo que oye.
 */
import { normalize } from '@/engine/answer';

type SR = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string; confidence: number }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function SRClass(): (new () => SR) | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function canRecognize() {
  return !!SRClass();
}

export function canRecord() {
  return typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined';
}

export function isStandalone() {
  return (
    typeof window !== 'undefined' &&
    (window.matchMedia?.('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

export interface RecognitionResult {
  heard: string[];
  error?: string;
}

/** Escucha una frase (hasta ~8 s). */
export function recognizeOnce(bcp47: string, timeoutMs = 8000): Promise<RecognitionResult> {
  return new Promise((resolve) => {
    const C = SRClass();
    if (!C) return resolve({ heard: [], error: 'unsupported' });
    const r = new C();
    r.lang = bcp47;
    r.interimResults = false;
    r.maxAlternatives = 5;
    r.continuous = false;
    let done = false;
    const finish = (res: RecognitionResult) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      try {
        r.abort();
      } catch {
        /* nada */
      }
      resolve(res);
    };
    r.onresult = (e) => {
      const alts: string[] = [];
      const first = e.results[0];
      for (let i = 0; i < first.length; i++) alts.push(first[i].transcript);
      finish({ heard: alts });
    };
    r.onerror = (e) => finish({ heard: [], error: e.error });
    r.onend = () => finish({ heard: [] });
    const timer = setTimeout(() => finish({ heard: [], error: 'timeout' }), timeoutMs);
    try {
      r.start();
    } catch {
      finish({ heard: [], error: 'start-failed' });
    }
  });
}

/** Parecido entre lo que se esperaba y lo que se ha oído (0–1), por palabras. */
export function similarity(expected: string, heard: string, lang?: string) {
  const a = normalize(expected, lang).split(' ').filter(Boolean);
  const b = normalize(heard, lang).split(' ').filter(Boolean);
  if (!a.length) return 0;
  const bag = [...b];
  let hit = 0;
  for (const w of a) {
    const i = bag.indexOf(w);
    if (i >= 0) {
      hit++;
      bag.splice(i, 1);
    }
  }
  return hit / Math.max(a.length, b.length);
}

export function bestSimilarity(expected: string, heard: string[], lang?: string) {
  return heard.reduce((m, h) => Math.max(m, similarity(expected, h, lang)), 0);
}

// ───────── Grabación (respaldo) ─────────
export interface Recording {
  stop: () => Promise<string>; // devuelve URL del audio grabado
}

export async function startRecording(): Promise<Recording> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const type = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm'].find((t) => MediaRecorder.isTypeSupported?.(t));
  const rec = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  rec.start();
  return {
    stop: () =>
      new Promise((resolve) => {
        rec.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
          resolve(URL.createObjectURL(new Blob(chunks, { type: rec.mimeType || 'audio/mp4' })));
        };
        rec.stop();
      }),
  };
}

const MIC_KEY = 'yolanda-mic-explained';
export function micExplained() {
  try {
    return localStorage.getItem(MIC_KEY) === '1';
  } catch {
    return false;
  }
}
export function setMicExplained() {
  try {
    localStorage.setItem(MIC_KEY, '1');
  } catch {
    /* nada */
  }
}
