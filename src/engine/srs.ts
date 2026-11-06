/**
 * Repaso inteligente con ts-fsrs. En la interfaz se llama "Repasar".
 * Cada palabra (kind "v") y cada punto de gramática (kind "g") es una tarjeta.
 * Las falladas vuelven antes (Rating.Again) y suman a "Palabras que se te resisten".
 */
import { createEmptyCard, fsrs, generatorParameters, Rating, type Card as FCard, type Grade, type State } from 'ts-fsrs';
import { db, type ReviewCard } from '@/data/db';
import type { Lang } from '@/content/types';

const scheduler = fsrs(
  generatorParameters({ request_retention: 0.9, maximum_interval: 180, enable_fuzz: true, enable_short_term: true }),
);

export function cardId(lang: Lang, kind: 'v' | 'g', ref: string) {
  return `${lang}:${kind}:${ref}`;
}

function toF(c: ReviewCard): FCard {
  return {
    due: new Date(c.due),
    stability: c.stability,
    difficulty: c.difficulty,
    scheduled_days: c.scheduled_days,
    learning_steps: c.learning_steps,
    reps: c.reps,
    lapses: c.lapses,
    state: c.state as State,
    last_review: c.last_review ? new Date(c.last_review) : undefined,
  };
}

export function newCard(lang: Lang, kind: 'v' | 'g', ref: string, now = new Date()): ReviewCard {
  const f = createEmptyCard(now);
  return fromF({ id: cardId(lang, kind, ref), lang, kind, ref, misses: 0 } as ReviewCard, f);
}

function fromF(base: ReviewCard, f: FCard): ReviewCard {
  return {
    ...base,
    due: f.due.getTime(),
    stability: f.stability,
    difficulty: f.difficulty,
    scheduled_days: f.scheduled_days,
    learning_steps: f.learning_steps,
    reps: f.reps,
    lapses: f.lapses,
    state: f.state,
    last_review: f.last_review?.getTime(),
  };
}

/** Calcula la siguiente fecha de repaso (función pura, se usa en tests). */
export function schedule(card: ReviewCard, ok: boolean, hesitated = false, now = new Date()): ReviewCard {
  const grade: Grade = !ok ? Rating.Again : hesitated ? Rating.Hard : Rating.Good;
  const next = scheduler.next(toF(card), now, grade).card;
  return { ...fromF(card, next), misses: ok ? Math.max(0, card.misses - 1) : card.misses + 1 };
}

/** Registra un acierto o fallo de una palabra o estructura. */
export async function review(lang: Lang, kind: 'v' | 'g', ref: string, ok: boolean, hesitated = false) {
  const id = cardId(lang, kind, ref);
  await db.transaction('rw', db.cards, async () => {
    const cur = (await db.cards.get(id)) ?? newCard(lang, kind, ref);
    await db.cards.put(schedule(cur, ok, hesitated));
  });
}

/** Añade tarjetas nuevas (al terminar una lección) sin tocar las que ya existen. */
export async function addCards(lang: Lang, kind: 'v' | 'g', refs: string[]) {
  const ids = refs.map((r) => cardId(lang, kind, r));
  const existing = new Set((await db.cards.bulkGet(ids)).filter(Boolean).map((c) => c!.id));
  const fresh = refs.filter((r) => !existing.has(cardId(lang, kind, r))).map((r) => newCard(lang, kind, r));
  if (fresh.length) await db.cards.bulkPut(fresh);
}

export async function dueCards(lang: Lang, now = Date.now(), limit = 40) {
  return db.cards.where('[lang+due]').between([lang, 0], [lang, now]).limit(limit).toArray();
}

export async function dueCount(lang: Lang, now = Date.now()) {
  return db.cards.where('[lang+due]').between([lang, 0], [lang, now]).count();
}

/** "Palabras que se te resisten": las que más se han fallado. */
export async function hardWords(lang: Lang, limit = 30) {
  const all = await db.cards.where('[lang+kind]').equals([lang, 'v']).toArray();
  return all
    .filter((c) => c.misses > 0 || c.lapses > 1)
    .sort((a, b) => b.misses + b.lapses - (a.misses + a.lapses))
    .slice(0, limit);
}
