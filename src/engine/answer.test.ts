import { describe, expect, it } from 'vitest';
import { diffAnswer, isCorrect, normalize, orderIsCorrect, tokenize } from './answer';

describe('normalize / isCorrect', () => {
  it('ignora mayúsculas, puntuación y espacios', () => {
    expect(isCorrect('  she IS   a teacher!! ', 'She is a teacher.', 'en')).toBe(true);
  });
  it('acepta el apóstrofo tipográfico de iOS', () => {
    expect(isCorrect('I’m Yolanda', "I'm Yolanda", 'en')).toBe(true);
    expect(isCorrect('l’acqua', "l'acqua", 'it')).toBe(true);
  });
  it('acepta contracciones equivalentes en inglés', () => {
    expect(isCorrect('I am tired', "I'm tired", 'en')).toBe(true);
    expect(isCorrect("She doesn't like tea", 'She does not like tea', 'en')).toBe(true);
    expect(isCorrect("I can't swim", 'I cannot swim', 'en')).toBe(true);
    expect(isCorrect("They're here", 'They are here', 'en')).toBe(true);
  });
  it('ignora tildes (español e italiano)', () => {
    expect(isCorrect('perche', 'perché', 'it')).toBe(true);
    expect(isCorrect('cafe con leche', 'café con leche')).toBe(true);
    expect(isCorrect('citta', 'città', 'it')).toBe(true);
  });
  it('rechaza respuestas vacías o distintas', () => {
    expect(isCorrect('', 'is', 'en')).toBe(false);
    expect(isCorrect('are', 'is', 'en')).toBe(false);
  });
  it("normaliza l' con espacio en italiano", () => {
    expect(normalize("l' amica", 'it')).toBe("l'amica");
  });
});

describe('diffAnswer', () => {
  it('marca la palabra que sobra y la que falta', () => {
    const d = diffAnswer('She work in a hospital', 'She works in a hospital', 'en');
    expect(d.tokens.map((t) => t.status)).toEqual(['ok', 'wrong', 'missing', 'ok', 'ok', 'ok']);
  });
  it('detecta palabras que faltan', () => {
    const d = diffAnswer('Is raining', 'It is raining', 'en');
    expect(d.tokens.find((t) => t.status === 'missing')?.text).toBe('It');
  });
  it('elige la variante más parecida', () => {
    const d = diffAnswer('I am fine', ["I'm fine, thanks", 'I am fine'], 'en');
    expect(d.tokens.every((t) => t.status === 'ok')).toBe(true);
  });
});

describe('ordenar palabras', () => {
  it('trocea sin la puntuación final', () => {
    expect(tokenize('Where is the station?')).toEqual(['Where', 'is', 'the', 'station']);
  });
  it('acepta órdenes alternativos', () => {
    expect(orderIsCorrect(['Usually', 'I', 'cook'], 'I usually cook', ['Usually I cook'], 'en')).toBe(true);
    expect(orderIsCorrect(['I', 'cook', 'usually'], 'I usually cook', [], 'en')).toBe(false);
  });
});

import { fixSentence } from '@/exercises/bodies';
describe('corregir el error', () => {
  it('sustituye la palabra exacta y une el apóstrofo', () => {
    expect(fixSentence('Sono al bar con una amica.', 'una', "un'")).toBe("Sono al bar con un'amica.");
    expect(fixSentence('She have a son.', 'have', 'has')).toBe('She has a son.');
    expect(fixSentence('The people is nice.', 'is', 'are')).toBe('The people are nice.');
  });
});
