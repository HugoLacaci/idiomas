import { describe, expect, it } from 'vitest';
import { newCard, schedule } from './srs';

describe('repaso (FSRS)', () => {
  const t0 = new Date('2026-11-06T10:00:00Z');

  it('una tarjeta nueva se debe repasar ya', () => {
    const c = newCard('en', 'v', 'grandson', t0);
    expect(c.due).toBeLessThanOrEqual(t0.getTime());
    expect(c.id).toBe('en:v:grandson');
  });

  it('acertar aleja el repaso; fallar lo acerca', () => {
    let ok = newCard('en', 'v', 'tea', t0);
    let ko = newCard('en', 'v', 'tea', t0);
    ok = schedule(ok, true, false, t0);
    ko = schedule(ko, false, false, t0);
    expect(ok.due).toBeGreaterThan(ko.due);
    expect(ko.misses).toBe(1);
  });

  it('varios aciertos seguidos llevan el repaso a días vista', () => {
    let c = newCard('it', 'v', 'il-nonno', t0);
    let now = t0;
    for (let i = 0; i < 4; i++) {
      c = schedule(c, true, false, now);
      now = new Date(c.due);
    }
    expect(c.due - t0.getTime()).toBeGreaterThan(3 * 24 * 3600 * 1000);
  });

  it('acertar después de fallar reduce los fallos recientes', () => {
    let c = newCard('en', 'v', 'cup', t0);
    c = schedule(c, false, false, t0);
    c = schedule(c, true, false, new Date(c.due));
    expect(c.misses).toBe(0);
  });
});
