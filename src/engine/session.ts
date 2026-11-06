/**
 * Construye las sesiones de ejercicios: mezcla los escritos a mano con los que se
 * generan del vocabulario (foto→palabra, escuchar→foto, dictado, emparejar…).
 */
import type { AuthoredExercise, Dialog, Lang, VocabItem } from '@/content/types';

/** Ejercicios generados a partir del vocabulario. */
export type GeneratedExercise =
  | { id: string; type: 'pic2word'; item: VocabItem; options: VocabItem[] }
  | { id: string; type: 'listen2pic'; item: VocabItem; options: VocabItem[] }
  | { id: string; type: 'listen2text'; item: VocabItem; options: string[]; answer: string }
  | { id: string; type: 'pickTrans'; dir: 'to' | 'from'; item: VocabItem; options: string[]; answer: string }
  | { id: string; type: 'pairs'; items: VocabItem[] }
  | { id: string; type: 'dictation'; item: VocabItem; text: string; es: string }
  | { id: string; type: 'listenDialog'; dialog: Dialog; q: Dialog['questions'][number] };

export type Exercise = (AuthoredExercise | GeneratedExercise) & { lang?: Lang; source?: string };

/** Etiqueta en español (tipo de ejercicio) para la ayuda y la instrucción. */
export const INSTRUCTIONS: Record<Exercise['type'], string> = {
  pic2word: 'Mira el dibujo y elige la palabra',
  listen2pic: 'Escucha y elige el dibujo',
  listen2text: 'Escucha y elige la frase que has oído',
  pickTrans: 'Elige la traducción correcta',
  pairs: 'Toca las parejas que van juntas',
  dictation: 'Escucha y escribe lo que oyes',
  listenDialog: 'Escucha el diálogo y contesta',
  choose: 'Elige la opción correcta',
  fill: 'Completa el hueco',
  order: 'Ordena la frase tocando las palabras',
  translate: 'Escribe la traducción',
  transform: 'Transforma la frase',
  error: 'Toca la palabra que está mal',
  conjugate: 'Conjuga el verbo',
  situation: '¿Qué dices en esta situación?',
  reading: 'Lee el texto y contesta',
  minimal: '¿Cuál de las dos has oído?',
  speak: 'Escucha y repite en voz alta',
  match: 'Toca las parejas que van juntas',
};

// ───────── aleatoriedad reproducible ─────────
export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}
export function shuffle<T>(arr: T[], rand: () => number = Math.random): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function seedFrom(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function pickDistractors(item: VocabItem, pool: VocabItem[], n: number, rand: () => number) {
  const others = pool.filter((v) => v.id !== item.id && v.t !== item.t && v.es !== item.es);
  return shuffle(others, rand).slice(0, n);
}

/** Genera ejercicios de vocabulario para unas palabras, con distractores del `pool`. */
export function vocabExercises(items: VocabItem[], pool: VocabItem[], rand: () => number): GeneratedExercise[] {
  const out: GeneratedExercise[] = [];
  const kinds = ['pic2word', 'listen2pic', 'pickTrans-from', 'pickTrans-to', 'listen2text', 'dictation'] as const;
  items.forEach((item, i) => {
    // Los ejercicios con dibujo solo tienen sentido con cosas que se pueden dibujar (sustantivos).
    const concrete = (v: VocabItem) => v.pos === 'n' || (!v.pos && v.t.split(' ').length <= 3);
    let kind: (typeof kinds)[number] = kinds[i % kinds.length];
    if ((kind === 'pic2word' || kind === 'listen2pic') && !concrete(item)) kind = 'pickTrans-from';
    const base = pool.length >= 4 ? pool : [...pool, ...items];
    const pic = kind === 'pic2word' || kind === 'listen2pic';
    const nounPool = base.filter(concrete);
    const d = pickDistractors(item, pic && nounPool.length >= 4 ? nounPool : base, 3, rand);
    const id = `g-${kind}-${item.id}`;
    if (kind === 'pic2word') out.push({ id, type: 'pic2word', item, options: shuffle([item, ...d], rand) });
    else if (kind === 'listen2pic') out.push({ id, type: 'listen2pic', item, options: shuffle([item, ...d], rand) });
    else if (kind === 'pickTrans-from')
      out.push({ id, type: 'pickTrans', dir: 'from', item, answer: item.es, options: shuffle([item.es, ...d.map((x) => x.es)], rand) });
    else if (kind === 'pickTrans-to')
      out.push({ id, type: 'pickTrans', dir: 'to', item, answer: item.t, options: shuffle([item.t, ...d.map((x) => x.t)], rand) });
    else if (kind === 'listen2text') {
      const ds = d.map((x) => x.ex.t).filter((t) => t !== item.ex.t);
      out.push({ id, type: 'listen2text', item, answer: item.ex.t, options: shuffle([item.ex.t, ...ds.slice(0, 2)], rand) });
    } else {
      // dictado: palabras cortas o la expresión (no frases largas)
      const text = item.t.split(' ').length <= 4 ? item.t : item.ex.t.split(' ').length <= 6 ? item.ex.t : item.t;
      out.push({ id, type: 'dictation', item, text, es: text === item.t ? item.es : item.ex.es });
    }
  });
  if (items.length >= 4) {
    out.push({ id: `g-pairs-${items[0].id}`, type: 'pairs', items: shuffle(items, rand).slice(0, 5) });
  }
  return out;
}

/** Intercala dos listas sin repetir el mismo tipo dos veces seguidas cuando sea posible. */
export function interleave(a: Exercise[], b: Exercise[], rand: () => number): Exercise[] {
  const all = shuffle([...a, ...b], rand);
  const out: Exercise[] = [];
  while (all.length) {
    const last = out[out.length - 1]?.type;
    let idx = all.findIndex((e) => e.type !== last);
    if (idx < 0) idx = 0;
    out.push(all.splice(idx, 1)[0]);
  }
  return out;
}

/** Ejercicios de una lección: 10–15, empezando por vocabulario fácil. */
export function lessonExercises(
  vocab: VocabItem[],
  authored: AuthoredExercise[],
  pool: VocabItem[],
  seed: string,
  target = 14,
): Exercise[] {
  const rand = rng(seedFrom(seed));
  const gen = vocabExercises(vocab, pool, rand);
  const nGen = Math.min(gen.length, Math.max(5, Math.round(target * 0.4)));
  const genPick = shuffle(gen, rand).slice(0, nGen);
  const easyFirst: GeneratedExercise[] = genPick.filter((e) => e.type === 'pic2word' || e.type === 'listen2pic').slice(0, 2);
  const restGen = genPick.filter((e) => !easyFirst.includes(e));
  const auth = authored.slice(0, Math.max(0, target - nGen));
  return [...easyFirst, ...interleave(restGen, auth, rand)];
}

/** ¿Qué palabra o estructura entrena este ejercicio? (para el repaso) */
export function exerciseRef(e: Exercise): { kind: 'v' | 'g'; ref: string } | null {
  if ('item' in e && e.item) return { kind: 'v', ref: e.item.id };
  if ('g' in e && e.g) return { kind: 'g', ref: e.g };
  return null;
}

export function needsTyping(e: Exercise) {
  return (
    e.type === 'translate' ||
    e.type === 'transform' ||
    e.type === 'dictation' ||
    e.type === 'conjugate' ||
    (e.type === 'fill' && !e.bank)
  );
}
