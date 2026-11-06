/**
 * npm run audio [-- --only en-a1-u01 --voices gb-f,it-f]
 * Pregenera con msedge-tts (voces neuronales de Microsoft Edge, gratis) el audio de todo el texto
 * en inglés/italiano del contenido, y en español las instrucciones e historias de gramática.
 * Caché por hash: public/audio/<voz>/<fnv>.mp3 y public/audio/manifest.json ("voz/hash").
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, statSync, unlinkSync } from 'node:fs';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import type { AuthoredExercise, Chat, DailyPhrase, GrammarPoint, Lang, Lesson, Unit, Video } from '../src/content/types';
import { EDGE_VOICES, hashText, speakable, type VoiceKey } from '../src/audio/voice';
import { INSTRUCTIONS } from '../src/engine/session';
import { HELP } from '../src/exercises/help';

const args = process.argv.slice(2);
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : '';
const voicesArg = args.includes('--voices') ? args[args.indexOf('--voices') + 1].split(',') : null;

const jobs = new Map<string, { voice: VoiceKey; text: string }>();
function add(voices: VoiceKey[], text?: string) {
  if (!text) return;
  const t = speakable(text);
  if (!t || t.length > 600) return;
  for (const v of voices) {
    if (voicesArg && !voicesArg.includes(v)) continue;
    jobs.set(`${v}/${hashText(t)}`, { voice: v, text: t });
  }
}
// el texto con huecos se lee completando el hueco con la respuesta
const fillBlank = (q: string, a?: string) => (a ? q.replace(/_{2,}/, a) : q);

function exerciseTexts(e: AuthoredExercise): string[] {
  switch (e.type) {
    case 'choose':
      return [fillBlank(e.q, e.answer), ...e.options];
    case 'fill':
    case 'conjugate':
      return [fillBlank(e.q, e.answer[0]), ...(e.type === 'fill' ? (e.bank ?? []) : [])];
    case 'order':
      return [e.answer, ...e.answer.replace(/[.!?]$/, '').split(/\s+/), ...(e.extra ?? [])];
    case 'translate':
      return e.dir === 'from' ? [e.q] : [];
    case 'transform':
      return [e.q, e.answer[0]];
    case 'error':
      return [e.q.replace(e.wrong, e.fix)];
    case 'situation':
      return e.options;
    case 'reading':
      return [[e.title, e.text].filter(Boolean).join('. ')];
    case 'minimal':
      return e.pair;
    case 'speak':
      return [e.t];
    case 'match':
      return e.pairs.map((p) => p[0]);
  }
}

const read = <T>(p: string): T | null => (existsSync(p) ? (JSON.parse(readFileSync(p, 'utf8')) as T) : null);

for (const lang of ['en', 'it'] as Lang[]) {
  // El acento americano solo para el vocabulario (si falta, la app usa la voz británica).
  const main: VoiceKey[] = lang === 'en' ? ['gb-f'] : ['it-f'];
  const vocabVoices: VoiceKey[] = lang === 'en' ? ['gb-f', 'us-f'] : ['it-f'];
  const alt: VoiceKey[] = lang === 'en' ? ['gb-m'] : ['it-m'];
  const units = read<Unit[]>(`content/${lang}/units.json`) ?? [];
  for (const u of units) {
    if (only && !u.id.startsWith(only)) continue;
    for (const lid of u.lessons) {
      const l = read<Lesson>(`content/${lang}/lessons/${lid}.json`);
      if (!l) continue;
      for (const v of l.vocab) {
        add(vocabVoices, v.t);
        add(vocabVoices, v.ex.t);
      }
      l.exercises.forEach((e) => exerciseTexts(e).forEach((t) => add(main, t)));
      const speakers = [...new Set(l.dialog.lines.map((x) => x.who))];
      l.dialog.lines.forEach((x) => add(speakers.indexOf(x.who) % 2 ? alt : main, x.t));
      add(main, l.realLife.t);
      l.same?.examples.forEach((x) => add(main, x.t));
      if (l.falseFriend) add(main, l.falseFriend.word);
      l.pron?.words?.forEach((w) => add(main, w));
      l.pron?.pairs?.forEach((p) => p.forEach((w) => add(main, w)));
    }
    for (const gid of u.grammar) {
      const g = read<GrammarPoint>(`content/${lang}/grammar/${gid}.json`);
      if (!g) continue;
      g.story.forEach((s) => {
        s.examples?.forEach((x) => add(main, x.t));
        add(['es-f'], `${s.title}. ${s.text}`.replace(/\n+/g, ' '));
      });
      g.errors.forEach((x) => add(main, x.right));
      g.exercises.forEach((e) => exerciseTexts(e).forEach((t) => add(main, t)));
    }
    for (const cid of u.chats ?? []) {
      const c = read<Chat>(`content/${lang}/chats/${cid}.json`);
      if (!c) continue;
      c.nodes.forEach((n) => {
        add(main, n.says.t);
        n.options?.forEach((o) => add(alt, o.t));
      });
    }
  }
  if (!only) {
    (read<DailyPhrase[]>(`content/${lang}/daily.json`) ?? []).forEach((d) => add(main, d.t));
    (read<{ q: string; answer: string }[]>(`content/${lang}/level-test.json`) ?? []).forEach((d) => add(main, fillBlank(d.q, d.answer)));
    void (read<Video[]>(`content/${lang}/videos.json`) ?? []);
  }
}
// Instrucciones y ayuda en español
if (!only) {
  Object.values(INSTRUCTIONS).forEach((t) => add(['es-f'], t));
  ['¿Qué significa?', '¿Cómo se dice?', 'Escribe la frase en el otro idioma', 'Escribe qué significa en español'].forEach((t) => add(['es-f'], t));
  void HELP;
}

// ───── generación ─────
const ROOT = 'public/audio';
mkdirSync(ROOT, { recursive: true });
const exists = (k: string) => existsSync(`${ROOT}/${k}.mp3`) && statSync(`${ROOT}/${k}.mp3`).size > 500;
const todo = [...jobs.entries()].filter(([k]) => !exists(k));
console.log(`Audio: ${jobs.size} clips en el contenido, ${todo.length} por generar`);
if (args.includes('--dry')) process.exit(0);

const byVoice = new Map<VoiceKey, [string, { voice: VoiceKey; text: string }][]>();
for (const j of todo) byVoice.set(j[1].voice, [...(byVoice.get(j[1].voice) ?? []), j]);

let done = 0;
let failed = 0;
async function worker(voice: VoiceKey, list: [string, { text: string }][]) {
  mkdirSync(`${ROOT}/${voice}`, { recursive: true });
  let tts: MsEdgeTTS | null = null;
  const connect = async () => {
    tts = new MsEdgeTTS();
    await tts.setMetadata(EDGE_VOICES[voice].name, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
  };
  for (const [key, { text }] of list) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        if (!tts) await connect();
        const { audioStream } = tts!.toStream(text, { rate: voice === 'es-f' ? '+0%' : '-8%' });
        const chunks: Buffer[] = [];
        await new Promise<void>((res, rej) => {
          const t = setTimeout(() => rej(new Error('timeout')), 20000);
          audioStream.on('data', (c: Buffer) => chunks.push(c));
          audioStream.on('end', () => {
            clearTimeout(t);
            res();
          });
          audioStream.on('error', rej);
        });
        const buf = Buffer.concat(chunks);
        if (buf.length < 500) throw new Error('audio vacío');
        writeFileSync(`${ROOT}/${key}.mp3`, buf);
        done++;
        break;
      } catch {
        tts = null;
        if (attempt === 2) failed++;
        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
      }
    }
    if ((done + failed) % 200 === 0) console.log(`  ${done + failed}/${todo.length}`);
  }
}

// 2 conexiones por voz
const workers: Promise<void>[] = [];
for (const [voice, list] of byVoice) {
  const half = Math.ceil(list.length / 2);
  workers.push(worker(voice, list.slice(0, half)), worker(voice, list.slice(half)));
}
await Promise.all(workers);

// limpieza: audios que ya no usa ningún contenido (solo en una pasada completa)
if (!only && !voicesArg) {
  let removed = 0;
  for (const v of readdirSync(ROOT)) {
    if (!statSync(`${ROOT}/${v}`).isDirectory()) continue;
    for (const f of readdirSync(`${ROOT}/${v}`))
      if (f.endsWith('.mp3') && !jobs.has(`${v}/${f.slice(0, -4)}`)) {
        unlinkSync(`${ROOT}/${v}/${f}`);
        removed++;
      }
  }
  if (removed) console.log(`Eliminados ${removed} audios que ya no se usan`);
}

// manifiesto con todo lo que existe en disco
const manifest: string[] = [];
for (const v of readdirSync(ROOT)) {
  if (!statSync(`${ROOT}/${v}`).isDirectory()) continue;
  for (const f of readdirSync(`${ROOT}/${v}`)) if (f.endsWith('.mp3')) manifest.push(`${v}/${f.slice(0, -4)}`);
}
writeFileSync(`${ROOT}/manifest.json`, JSON.stringify(manifest.sort()));
console.log(`Generados ${done}, fallidos ${failed}. Manifiesto: ${manifest.length} audios.`);
process.exit(0);
