/**
 * Progreso en IndexedDB (Dexie). Cada registro lleva `lang`, así que cada idioma
 * guarda su propio progreso. Todo se puede exportar e importar (copia de seguridad).
 */
import Dexie, { type Table } from 'dexie';
import type { Lang } from '@/content/types';

export interface KV {
  key: string;
  value: unknown;
}

export interface LessonProgress {
  lang: Lang;
  id: string; // id de lección, o "<unitId>:challenge" para el mini-reto
  unit: string;
  done: boolean;
  stars: number; // 1–3
  best: number; // % de aciertos
  count: number;
  completedAt: number;
}

/** Tarjeta de repaso (palabra o estructura), programada con FSRS. */
export interface ReviewCard {
  id: string; // "en:v:grandson" | "en:g:en-g-to-be"
  lang: Lang;
  kind: 'v' | 'g';
  ref: string;
  due: number;
  stability: number;
  difficulty: number;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  state: number;
  last_review?: number;
  /** fallos recientes, para "Palabras que se te resisten" */
  misses: number;
}

export interface Attempt {
  id?: number;
  lang: Lang;
  at: number;
  type: string;
  ref: string; // id de vocab o de gramática o de ejercicio
  ok: boolean;
}

export interface DayStat {
  lang: Lang;
  day: string; // YYYY-MM-DD local
  seconds: number;
  exercises: number;
  correct: number;
  lessons: number;
}

export interface Favorite {
  lang: Lang;
  ref: string; // id de vocab
  at: number;
}

export interface Badge {
  lang: Lang;
  id: string;
  at: number;
}

export class YolandaDB extends Dexie {
  kv!: Table<KV, string>;
  lessons!: Table<LessonProgress, [Lang, string]>;
  cards!: Table<ReviewCard, string>;
  attempts!: Table<Attempt, number>;
  days!: Table<DayStat, [Lang, string]>;
  favorites!: Table<Favorite, [Lang, string]>;
  badges!: Table<Badge, [Lang, string]>;

  constructor(name = 'yolanda') {
    super(name);
    this.version(1).stores({
      kv: 'key',
      lessons: '[lang+id], lang, unit',
      cards: 'id, lang, [lang+due], [lang+kind]',
      attempts: '++id, lang, at, [lang+ref]',
      days: '[lang+day], lang',
      favorites: '[lang+ref], lang',
      badges: '[lang+id], lang',
    });
  }
}

export const db = new YolandaDB();

export const TABLES = ['kv', 'lessons', 'cards', 'attempts', 'days', 'favorites', 'badges'] as const;

export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export async function getKV<T>(key: string, fallback: T): Promise<T> {
  const r = await db.kv.get(key);
  return (r?.value as T) ?? fallback;
}

export async function setKV(key: string, value: unknown) {
  await db.kv.put({ key, value });
}

export async function bumpDay(lang: Lang, patch: Partial<Omit<DayStat, 'lang' | 'day'>>) {
  const day = todayKey();
  await db.transaction('rw', db.days, async () => {
    const cur = (await db.days.get([lang, day])) ?? { lang, day, seconds: 0, exercises: 0, correct: 0, lessons: 0 };
    await db.days.put({
      ...cur,
      seconds: cur.seconds + (patch.seconds ?? 0),
      exercises: cur.exercises + (patch.exercises ?? 0),
      correct: cur.correct + (patch.correct ?? 0),
      lessons: cur.lessons + (patch.lessons ?? 0),
    });
  });
}

/** Días seguidos practicando (hoy cuenta si ya ha practicado; si no, se mira desde ayer). */
export function streakFrom(days: string[], today = new Date()): number {
  const set = new Set(days);
  const d = new Date(today);
  if (!set.has(todayKey(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (set.has(todayKey(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

/** Pide a Safari/Chrome que no borre los datos (más eficaz con la web instalada). */
export async function requestPersistence(): Promise<boolean> {
  try {
    if (!navigator.storage?.persist) return false;
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}
