/**
 * Genera content/<lang>/index.json: títulos de lecciones, vocabulario completo (para repasos
 * y distractores), puntos de gramática y charlas. Asigna `photo` a las lecciones con foto descargada.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import type { Chat, GrammarPoint, Lang, Lesson, PhotoCredit, Unit } from '../src/content/types';
import type { ContentIndex } from '../src/content/load';

const credits: PhotoCredit[] = existsSync('content/credits.json') ? JSON.parse(readFileSync('content/credits.json', 'utf8')) : [];
const photoKeys = new Set(credits.map((c) => c.key));

for (const lang of ['en', 'it'] as Lang[]) {
  const units: Unit[] = JSON.parse(readFileSync(`content/${lang}/units.json`, 'utf8'));
  const idx: ContentIndex = { lessons: {}, grammar: {}, vocab: {}, chats: {} };
  const grammarUnits = new Map<string, string[]>();
  for (const u of units) for (const g of u.grammar) grammarUnits.set(g, [...(grammarUnits.get(g) ?? []), u.id]);

  for (const u of units) {
    for (const lid of u.lessons) {
      const p = `content/${lang}/lessons/${lid}.json`;
      if (!existsSync(p)) continue;
      const l: Lesson = JSON.parse(readFileSync(p, 'utf8'));
      // la foto descargada se guarda con la clave = id de la lección
      const photo = photoKeys.has(lid) ? lid : undefined;
      if (photo && l.photo !== photo) {
        l.photo = photo;
        writeFileSync(p, JSON.stringify(l, null, 2) + '\n');
      }
      idx.lessons[lid] = { unit: u.id, title: l.title, emoji: l.emoji, grammar: l.grammar, vocab: l.vocab.map((v) => v.id), n: l.exercises.length, photo };
      for (const v of l.vocab) if (!idx.vocab[v.id]) idx.vocab[v.id] = { ...v, lesson: lid };
    }
  }
  const gdir = `content/${lang}/grammar`;
  if (existsSync(gdir))
    for (const f of readdirSync(gdir)) {
      const g: GrammarPoint = JSON.parse(readFileSync(`${gdir}/${f}`, 'utf8'));
      idx.grammar[g.id] = { title: g.title, short: g.short, level: g.level, n: g.exercises.length, units: grammarUnits.get(g.id) ?? [] };
    }
  const cdir = `content/${lang}/chats`;
  if (existsSync(cdir))
    for (const f of readdirSync(cdir)) {
      const c: Chat = JSON.parse(readFileSync(`${cdir}/${f}`, 'utf8'));
      idx.chats[c.id] = { unit: c.unit, title: c.title, emoji: c.emoji };
    }
  writeFileSync(`content/${lang}/index.json`, JSON.stringify(idx));
  console.log(`${lang}: ${Object.keys(idx.lessons).length} lecciones, ${Object.keys(idx.vocab).length} palabras, ${Object.keys(idx.grammar).length} gramática, ${Object.keys(idx.chats).length} charlas`);
}
