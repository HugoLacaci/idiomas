/** Progreso del curso: lecciones hechas, unidad actual, siguiente lección, racha… */
import { useLiveQuery } from 'dexie-react-hooks';
import type { Lang, Level, Unit } from '@/content/types';
import { units } from '@/content/load';
import { db, streakFrom, todayKey, type LessonProgress, bumpDay } from './db';
import { useStore } from './settings';

export type ProgressMap = Map<string, LessonProgress>;

export function useProgress(lang: Lang): ProgressMap | undefined {
  return useLiveQuery(async () => {
    const rows = await db.lessons.where('lang').equals(lang).toArray();
    return new Map(rows.map((r) => [r.id, r]));
  }, [lang]);
}

export function unitDone(u: Unit, p: ProgressMap) {
  return u.lessons.length > 0 && u.lessons.every((l) => p.get(l)?.done);
}

export function unitFraction(u: Unit, p: ProgressMap) {
  if (!u.lessons.length) return 0;
  return u.lessons.filter((l) => p.get(l)?.done).length / u.lessons.length;
}

/** Una unidad está abierta si es la primera, la anterior está terminada, o la prueba de nivel la ha abierto. */
export function unitOpen(lang: Lang, u: Unit, p: ProgressMap): boolean {
  const list = units(lang);
  const idx = list.findIndex((x) => x.id === u.id);
  const prof = useStore.getState().profile;
  if (prof.unlockAll[lang]) return true;
  if (idx <= 0) return true;
  const start = prof.startUnit[lang];
  if (start) {
    const sIdx = list.findIndex((x) => x.id === start);
    if (idx <= sIdx) return true;
  }
  const prev = list[idx - 1];
  return unitDone(prev, p) || unitFraction(u, p) > 0;
}

/** La siguiente lección pendiente (respetando la unidad de inicio de la prueba de nivel). */
export function nextLesson(lang: Lang, p: ProgressMap): { unit: Unit; lessonId: string } | null {
  const list = units(lang);
  const start = useStore.getState().profile.startUnit[lang];
  const sIdx = Math.max(0, start ? list.findIndex((u) => u.id === start) : 0);
  for (let i = sIdx; i < list.length; i++) {
    const u = list[i];
    const l = u.lessons.find((id) => !p.get(id)?.done);
    if (l) return { unit: u, lessonId: l };
  }
  for (let i = 0; i < sIdx; i++) {
    const u = list[i];
    const l = u.lessons.find((id) => !p.get(id)?.done);
    if (l) return { unit: u, lessonId: l };
  }
  return null;
}

export function currentUnit(lang: Lang, p: ProgressMap): Unit | undefined {
  return nextLesson(lang, p)?.unit ?? units(lang).at(-1);
}

export function levelFraction(lang: Lang, level: Level, p: ProgressMap) {
  const us = units(lang).filter((u) => u.level === level);
  const all = us.flatMap((u) => u.lessons);
  if (!all.length) return 0;
  return all.filter((l) => p.get(l)?.done).length / all.length;
}

export function levelDone(lang: Lang, level: Level, p: ProgressMap) {
  const us = units(lang).filter((u) => u.level === level);
  return us.length > 0 && us.every((u) => unitDone(u, p));
}

export function courseFraction(lang: Lang, p: ProgressMap) {
  const all = units(lang).flatMap((u) => u.lessons);
  if (!all.length) return 0;
  return all.filter((l) => p.get(l)?.done).length / all.length;
}

export function starsFor(pct: number) {
  return pct >= 90 ? 3 : pct >= 70 ? 2 : 1;
}

export async function completeLesson(lang: Lang, id: string, unit: string, pct: number, seconds: number) {
  const cur = await db.lessons.get([lang, id]);
  const stars = starsFor(pct);
  await db.lessons.put({
    lang,
    id,
    unit,
    done: true,
    stars: Math.max(stars, cur?.stars ?? 0),
    best: Math.max(pct, cur?.best ?? 0),
    count: (cur?.count ?? 0) + 1,
    completedAt: Date.now(),
  });
  await bumpDay(lang, { lessons: 1, seconds });
}

export function useStreak(lang?: Lang) {
  return useLiveQuery(async () => {
    const rows = lang ? await db.days.where('lang').equals(lang).toArray() : await db.days.toArray();
    const days = [...new Set(rows.filter((r) => r.exercises > 0 || r.lessons > 0).map((r) => r.day))];
    const today = rows.filter((r) => r.day === todayKey());
    return {
      streak: streakFrom(days),
      totalDays: days.length,
      todaySeconds: today.reduce((s, r) => s + r.seconds, 0),
      todayExercises: today.reduce((s, r) => s + r.exercises, 0),
      days,
    };
  }, [lang]);
}

export async function awardBadge(lang: Lang, id: string) {
  const has = await db.badges.get([lang, id]);
  if (has) return false;
  await db.badges.put({ lang, id, at: Date.now() });
  return true;
}
