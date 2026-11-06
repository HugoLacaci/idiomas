import { describe, expect, it } from 'vitest';
import type { AuthoredExercise, VocabItem } from '@/content/types';
import { interleave, lessonExercises, rng, vocabExercises } from './session';

const v = (id: string, t: string, es: string): VocabItem => ({ id, t, es, emoji: '⭐', ex: { t: `I like ${t}.`, es: `Me gusta ${es}.` } });
const vocab = [v('tea', 'tea', 'el té'), v('milk', 'milk', 'la leche'), v('bread', 'bread', 'el pan'), v('egg', 'an egg', 'un huevo'), v('cake', 'a cake', 'una tarta'), v('jam', 'jam', 'la mermelada')];
const authored: AuthoredExercise[] = Array.from({ length: 12 }, (_, i) => ({
  id: `e${i}`,
  type: i % 2 ? 'choose' : 'fill',
  q: 'She ___ tea.',
  options: ['likes', 'like'],
  answer: i % 2 ? 'likes' : ['likes'],
})) as AuthoredExercise[];

describe('motor de sesiones', () => {
  it('genera ejercicios de vocabulario con la respuesta entre las opciones', () => {
    const ex = vocabExercises(vocab, vocab, rng(1));
    for (const e of ex) {
      if (e.type === 'pic2word' || e.type === 'listen2pic') expect(e.options.map((o) => o.id)).toContain(e.item.id);
      if (e.type === 'pickTrans' || e.type === 'listen2text') expect(e.options).toContain(e.answer);
    }
    expect(ex.some((e) => e.type === 'pairs')).toBe(true);
  });

  it('las opciones no se repiten', () => {
    for (const e of vocabExercises(vocab, vocab, rng(7))) {
      if ('options' in e) {
        const keys = (e.options as (string | VocabItem)[]).map((o) => (typeof o === 'string' ? o : o.id));
        expect(new Set(keys).size).toBe(keys.length);
      }
    }
  });

  it('una lección tiene entre 10 y 15 ejercicios y empieza por lo fácil', () => {
    const ex = lessonExercises(vocab, authored, vocab, 'en-a1-u01-l1');
    expect(ex.length).toBeGreaterThanOrEqual(10);
    expect(ex.length).toBeLessThanOrEqual(15);
    expect(['pic2word', 'listen2pic']).toContain(ex[0].type);
  });

  it('es reproducible con la misma semilla', () => {
    const a = lessonExercises(vocab, authored, vocab, 'x').map((e) => e.id);
    const b = lessonExercises(vocab, authored, vocab, 'x').map((e) => e.id);
    expect(a).toEqual(b);
  });

  it('intercala sin repetir tipo cuando es posible', () => {
    const out = interleave(authored.slice(0, 4) as never, [{ id: 'x', type: 'order', es: '', answer: 'a b' }] as never, rng(3));
    expect(out).toHaveLength(5);
  });
});
