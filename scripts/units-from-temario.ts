/**
 * Genera content/<lang>/units.json a partir de las tablas de docs/TEMARIO.md.
 * Conserva los campos editados a mano (emoji, challenge, chats, photo) si el archivo ya existe.
 * Uso: npx tsx scripts/units-from-temario.ts
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import type { Lang, Level, Unit } from '../src/content/types';

const md = readFileSync('docs/TEMARIO.md', 'utf8');

const EMOJI: Record<string, [string, string, string]> = {
  // id: [emoji de la unidad, nombre del sello, emoji del sello]
  'en-a1-u01': ['👋', 'Saludos', '🤝'],
  'en-a1-u02': ['👨‍👩‍👧‍👦', 'Familia', '💂'],
  'en-a1-u03': ['👜', 'Cosas', '🔔'],
  'en-a1-u04': ['🏠', 'Hogar', '🏡'],
  'en-a1-u05': ['🕒', 'Hora exacta', '🕰️'],
  'en-a1-u06': ['☀️', 'Rutina', '⛪'],
  'en-a1-u07': ['💼', 'Trabajo', '🛍️'],
  'en-a1-u08': ['🌦️', 'Frecuencia', '🌳'],
  'en-a1-u09': ['🍽️', 'Buen provecho', '🧀'],
  'en-a1-u10': ['🎨', 'Habilidades', '🎡'],
  'en-a1-u11': ['🗺️', 'Orientación', '🧭'],
  'en-a1-u12': ['💬', 'Conversación', '🎭'],
  'en-a2-u01': ['📱', 'Ahora mismo', '🌉'],
  'en-a2-u02': ['🛒', 'Compras', '🥫'],
  'en-a2-u03': ['👗', 'Moda', '🛍️'],
  'en-a2-u04': ['📅', 'Fin de semana', '🏰'],
  'en-a2-u05': ['📖', 'Historias', '🛡️'],
  'en-a2-u06': ['🧳', 'Planes', '🎓'],
  'en-a2-u07': ['💃', 'Aficiones', '🎸'],
  'en-a2-u08': ['🩺', 'Salud', '♨️'],
  'en-a2-u09': ['☎️', 'Teléfono', '📜'],
  'en-a2-u10': ['✈️', 'Viajera', '🗽'],
  'en-b1-u01': ['🌍', 'Experiencias', '🍁'],
  'en-b1-u02': ['💻', 'Tecnología', '🏔️'],
  'en-b1-u03': ['🧸', 'Recuerdos', '🦘'],
  'en-b1-u04': ['☔', 'Condiciones', '🚋'],
  'en-b1-u05': ['🍀', 'Sueños', '🥝'],
  'en-b1-u06': ['🎄', 'Celebraciones', '⛰️'],
  'en-b1-u07': ['❤️', 'Emociones', '🌁'],
  'en-b1-u08': ['🗣️', 'Gran viaje', '🚄'],
  'it-a0-u00': ['🔤', 'Primeros sonidos', '🚉'],
  'it-a1-u01': ['👋', 'Ciao!', '🏛️'],
  'it-a1-u02': ['☕', 'Al bar', '☕'],
  'it-a1-u03': ['💶', 'Números', '🌋'],
  'it-a1-u04': ['👨‍👩‍👧‍👦', 'Famiglia', '🍋'],
  'it-a1-u05': ['⏰', 'Giornata', '🎅'],
  'it-a1-u06': ['🏠', 'Casa', '🪨'],
  'it-a1-u07': ['🍝', 'Ristorante', '⛪'],
  'it-a1-u08': ['🚆', 'In treno', '⛴️'],
  'it-a1-u09': ['🍅', 'Mercato', '🍙'],
  'it-a1-u10': ['🛎️', 'Albergo', '🌋'],
  'it-a1-u11': ['🧭', 'Direzioni', '💡'],
  'it-a1-u12': ['🎶', 'Tempo libero', '🎭'],
  'it-a2-u01': ['🖼️', 'Museo', '📜'],
  'it-a2-u02': ['🎉', 'Feste', '🐎'],
  'it-a2-u03': ['🛏️', 'Buongiorno', '🗼'],
  'it-a2-u04': ['🧸', 'Ricordi', '🌿'],
  'it-a2-u05': ['⛅', 'Che tempo', '🌊'],
  'it-a2-u06': ['👗', 'Shopping', '🖌️'],
  'it-a2-u07': ['📞', 'Pronto', '🚗'],
  'it-a2-u08': ['💊', 'Farmacia', '⛵'],
  'it-a2-u09': ['🏆', 'Il più bello', '🎶'],
  'it-a2-u10': ['🧳', 'Viaggio', '🛶'],
  'it-b1-u01': ['💭', 'Desideri', '☕'],
  'it-b1-u02': ['🎁', 'Regali', '🏔️'],
  'it-b1-u03': ['🍲', 'Cucina', '🎓'],
  'it-b1-u04': ['🤔', 'Opinioni', '🧀'],
  'it-b1-u05': ['📚', 'Storie', '✨'],
  'it-b1-u06': ['🎯', 'Obiettivi', '🍫'],
  'it-b1-u07': ['🏖️', 'Sogni', '🗿'],
  'it-b1-u08': ['❤️', 'Arrivederci', '⛲'],
};

function strip(s: string) {
  return s.replace(/\*\*/g, '').replace(/\*/g, '').trim();
}

const out: Record<Lang, Unit[]> = { en: [], it: [] };
for (const line of md.split('\n')) {
  const m = line.match(/^\|\s*((en|it)-(a0|a1|a2|b1)-u(\d\d))\s*\|/);
  if (!m) continue;
  const cells = line.split('|').slice(1, -1).map((c) => c.trim());
  const [id, title, theme, grammar, , , , stop] = cells;
  const lang = m[2] as Lang;
  const level = m[3].toUpperCase() as Level;
  const n = Number(m[4]);
  const g = grammar.includes('it-g') || grammar.includes('en-g') ? grammar.split('·').map((x) => x.trim()).filter((x) => /^(en|it)-g-/.test(x)) : [];
  const stopM = stop.match(/^\*\*(.+?)\*\*\s*[—-]\s*(.+)$/);
  const nLessons = id === 'it-a0-u00' ? 6 : 5;
  const [emoji, badge, badgeEmoji] = EMOJI[id] ?? ['📘', title, '🏅'];
  out[lang].push({
    id,
    lang,
    level,
    n: id === 'it-a0-u00' ? 0 : n,
    title: strip(title),
    theme: strip(theme),
    emoji,
    stop: { name: stopM ? strip(stopM[1]) : strip(stop), curiosity: stopM ? strip(stopM[2]) : '', photo: `stop-${id}` },
    grammar: g,
    lessons: Array.from({ length: nLessons }, (_, i) => `${id}-l${i + 1}`),
    challenge: { title: `Mini-reto: ${strip(title)}`, badge, badgeEmoji },
    chats: [1, 2, 3].map((k) => `${id}-c${k}`),
  });
}

for (const lang of ['en', 'it'] as Lang[]) {
  const file = `content/${lang}/units.json`;
  const prev: Unit[] = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : [];
  const merged = out[lang].map((u) => {
    const p = prev.find((x) => x.id === u.id);
    return p ? { ...u, emoji: p.emoji ?? u.emoji, challenge: p.challenge ?? u.challenge, chats: p.chats ?? u.chats } : u;
  });
  writeFileSync(file, JSON.stringify(merged, null, 2) + '\n');
  console.log(`${lang}: ${merged.length} unidades, ${merged.reduce((s, u) => s + u.lessons.length, 0)} lecciones, ${merged.reduce((s, u) => s + u.grammar.length, 0)} puntos de gramática`);
}
