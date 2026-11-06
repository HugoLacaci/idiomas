/**
 * npm run content:check [-- --only en-a1-u01 --strict --videos --audio]
 * Valida la estructura del contenido (docs/CONTENIDO.md). Sale con código 1 si hay errores.
 *  --only <prefijo>  solo unidades/gramática/charlas cuyo id empiece así (p. ej. it-a1-u0)
 *  --strict          las lecciones o puntos que faltan cuentan como error (no aviso)
 *  --audio           exige audio pregenerado para cada palabra y ejemplo
 *  --videos          comprueba cada vídeo con el oEmbed de YouTube (necesita red)
 */
import { existsSync, readFileSync } from 'node:fs';
import type { AuthoredExercise, Chat, GrammarPoint, Lang, Lesson, Unit, Video } from '../src/content/types';
import { hashText, speakable } from '../src/audio/voice';

const args = process.argv.slice(2);
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : '';
const strict = args.includes('--strict');
const wantAudio = args.includes('--audio');
const wantVideos = args.includes('--videos');

const errors: string[] = [];
const warnings: string[] = [];
const err = (where: string, msg: string) => errors.push(`✗ ${where}: ${msg}`);
const warn = (where: string, msg: string) => warnings.push(`! ${where}: ${msg}`);

const read = <T>(p: string): T | null => {
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, 'utf8')) as T;
  } catch (e) {
    err(p, `JSON no válido: ${(e as Error).message}`);
    return null;
  }
};

const manifest = new Set<string>(read<string[]>('public/audio/manifest.json') ?? []);
const norm = (s: string) => s.toLowerCase().replace(/[‘’]/g, "'").replace(/[.,!?¿¡]/g, '').replace(/\s+/g, ' ').trim();

function checkExercise(where: string, e: AuthoredExercise, ids: Set<string>, seen: Set<string>) {
  const w = `${where}#${e.id ?? '?'}`;
  if (!e.id) err(w, 'falta id');
  else if (ids.has(e.id)) err(w, 'id repetido');
  ids.add(e.id);
  const { id: _id, why: _why, ...rest } = e as AuthoredExercise & { why?: string };
  void _id;
  void _why;
  const sig = JSON.stringify(rest);
  if (seen.has(sig)) err(w, 'ejercicio duplicado');
  seen.add(sig);
  const hasBlank = (q: string) => /_{2,}/.test(q);
  switch (e.type) {
    case 'choose':
      if (!hasBlank(e.q)) err(w, 'choose sin hueco ___');
      if (!e.options?.includes(e.answer)) err(w, 'answer no está en options');
      if (new Set(e.options).size !== e.options.length) err(w, 'opciones repetidas');
      break;
    case 'situation':
      if (!e.options?.includes(e.answer)) err(w, 'answer no está en options');
      break;
    case 'fill':
    case 'conjugate':
      if (!hasBlank(e.q)) err(w, `${e.type} sin hueco ___`);
      if ((e.q.match(/_{2,}/g) ?? []).length > 1) err(w, 'más de un hueco');
      if (!Array.isArray(e.answer) || !e.answer.length) err(w, 'answer debe ser un array no vacío');
      if (e.type === 'fill' && e.bank && !e.bank.some((b) => e.answer.map(norm).includes(norm(b)))) err(w, 'la respuesta no está en el banco');
      break;
    case 'order':
      if (!e.answer || e.answer.split(/\s+/).length < 2) err(w, 'order necesita una frase');
      if (!e.es) err(w, 'order sin traducción es');
      break;
    case 'translate':
    case 'transform':
      if (!Array.isArray(e.answer) || !e.answer.length) err(w, 'answer debe ser un array no vacío');
      if (e.type === 'translate' && !['to', 'from'].includes(e.dir)) err(w, 'dir debe ser to/from');
      break;
    case 'error':
      if (!e.q.split(/\s+/).some((x) => norm(x) === norm(e.wrong))) err(w, `«${e.wrong}» no aparece como palabra en q`);
      if (norm(e.wrong) === norm(e.fix)) err(w, 'wrong y fix son iguales');
      break;
    case 'reading':
      if (!e.questions?.length) err(w, 'reading sin preguntas');
      e.questions?.forEach((q, i) => !q.options.includes(q.answer) && err(w, `pregunta ${i + 1}: answer no está en options`));
      break;
    case 'minimal':
      if (!e.pair?.includes(e.answer)) err(w, 'answer no está en pair');
      break;
    case 'speak':
      if (!e.t || !e.es) err(w, 'speak necesita t y es');
      break;
    case 'match':
      if (!e.pairs || e.pairs.length < 3) err(w, 'match necesita ≥3 pares');
      break;
    default:
      err(w, `tipo desconocido ${(e as { type: string }).type}`);
  }
  if (!('why' in e) || !e.why) {
    if (!['speak', 'match', 'reading', 'minimal'].includes(e.type)) warn(w, 'sin "why"');
  }
}

function audioOk(voice: string, text: string) {
  return manifest.has(`${voice}/${hashText(speakable(text))}`);
}

async function main() {
  const totals: Record<string, number> = {};
  for (const lang of ['en', 'it'] as Lang[]) {
    const units = read<Unit[]>(`content/${lang}/units.json`) ?? [];
    const vocabIds = new Map<string, string>();
    const grammarDone = new Set<string>();
    let lessonsFound = 0;
    let lessonsTotal = 0;
    for (const u of units) {
      if (only && !u.id.startsWith(only)) continue;
      let unitExercises = 0;
      for (const lid of u.lessons) {
        lessonsTotal++;
        const p = `content/${lang}/lessons/${lid}.json`;
        const l = read<Lesson>(p);
        if (!l) {
          (strict ? err : warn)(lid, 'falta la lección');
          continue;
        }
        lessonsFound++;
        if (l.id !== lid) err(p, `id ${l.id} ≠ ${lid}`);
        if (l.unit !== u.id) err(p, `unit ${l.unit} ≠ ${u.id}`);
        if (l.reviewed !== false) err(p, 'reviewed debe ser false');
        for (const k of ['title', 'goal', 'dialog', 'realLife', 'summary', 'vocab', 'exercises'] as const)
          if (!l[k]) err(p, `falta ${k}`);
        if (!l.vocab || l.vocab.length < 6 || l.vocab.length > 10) err(p, `vocab debe tener 6–10 (tiene ${l.vocab?.length ?? 0})`);
        l.vocab?.forEach((v) => {
          if (!v.id || !v.t || !v.es || !v.ex?.t || !v.ex?.es) err(`${p}#${v.id}`, 'palabra incompleta (id, t, es, ex)');
          if (!v.emoji && !v.photo) err(`${p}#${v.id}`, 'palabra sin imagen (emoji o photo)');
          const prev = vocabIds.get(v.id);
          if (prev && prev !== lid) warn(`${p}#${v.id}`, `vocab repetido (ya en ${prev})`);
          vocabIds.set(v.id, lid);
          if (wantAudio) {
            const vk = lang === 'en' ? 'gb-f' : 'it-f';
            if (!audioOk(vk, v.t)) err(`${p}#${v.id}`, 'falta audio de la palabra');
            if (!audioOk(vk, v.ex.t)) err(`${p}#${v.id}`, 'falta audio del ejemplo');
          }
        });
        const ids = new Set<string>();
        const seen = new Set<string>();
        l.exercises?.forEach((e) => checkExercise(p, e, ids, seen));
        const n = l.exercises?.length ?? 0;
        unitExercises += n;
        if (n < 12) err(p, `necesita ≥12 ejercicios (tiene ${n})`);
        const types = new Set(l.exercises?.map((e) => e.type));
        if (types.size < 7) err(p, `necesita ≥7 tipos de ejercicio (tiene ${types.size})`);
        if (!l.dialog?.lines || l.dialog.lines.length < 6) err(p, 'el diálogo necesita ≥6 líneas');
        if (!l.dialog?.questions || l.dialog.questions.length < 2) err(p, 'el diálogo necesita ≥2 preguntas');
        l.dialog?.questions?.forEach((q, i) => !q.options.includes(q.answer) && err(p, `diálogo pregunta ${i + 1}: answer no está en options`));
        if (!l.summary || l.summary.length < 3) err(p, 'summary necesita ≥3 viñetas');
        if (l.grammar && !u.grammar.includes(l.grammar) && !existsSync(`content/${lang}/grammar/${l.grammar}.json`))
          warn(p, `grammar ${l.grammar} no es de esta unidad ni existe`);
        if (lang === 'it' && !l.same && !l.falseFriend) warn(p, 'italiano: sin "same" ni "falseFriend"');
      }
      for (const gid of u.grammar) {
        const p = `content/${lang}/grammar/${gid}.json`;
        const g = read<GrammarPoint>(p);
        if (!g) {
          (strict ? err : warn)(gid, 'falta el punto de gramática');
          continue;
        }
        grammarDone.add(gid);
        if (g.id !== gid) err(p, `id ${g.id} ≠ ${gid}`);
        if (g.reviewed !== false) err(p, 'reviewed debe ser false');
        if (!g.story || g.story.length < 5 || g.story.length > 9) err(p, `story debe tener 5–8 pantallas (tiene ${g.story?.length ?? 0})`);
        g.story?.forEach((s, i) => {
          if (!s.title) err(p, `pantalla ${i + 1} sin título`);
          if (s.text && s.text.split(/\s+/).length > 45) warn(p, `pantalla ${i + 1} con mucho texto (${s.text.split(/\s+/).length} palabras)`);
        });
        if (!g.compare?.es || !g.compare?.target) err(p, 'falta compare');
        if (!g.errors || g.errors.length < 3) err(p, 'necesita ≥3 errores típicos');
        const ids = new Set<string>();
        const seen = new Set<string>();
        g.exercises?.forEach((e) => checkExercise(p, e, ids, seen));
        const n = g.exercises?.length ?? 0;
        unitExercises += n;
        if (n < 30) err(p, `necesita ≥30 ejercicios (tiene ${n})`);
        const types = new Set(g.exercises?.map((e) => e.type));
        if (types.size < 6) err(p, `necesita ≥6 tipos (tiene ${types.size})`);
      }
      for (const cid of u.chats ?? []) {
        const p = `content/${lang}/chats/${cid}.json`;
        const c = read<Chat>(p);
        if (!c) {
          (strict ? err : warn)(cid, 'falta la charla');
          continue;
        }
        const nodes = new Set(c.nodes.map((n) => n.id));
        if (!nodes.has(c.start)) err(p, 'start no existe');
        c.nodes.forEach((n) => {
          n.options?.forEach((o) => o.next !== 'end' && !nodes.has(o.next) && err(p, `nodo ${n.id}: next ${o.next} no existe`));
          if (n.next && n.next !== 'end' && !nodes.has(n.next)) err(p, `nodo ${n.id}: next ${n.next} no existe`);
          if (n.options && !n.options.some((o) => o.ok !== false)) err(p, `nodo ${n.id}: ninguna opción correcta`);
        });
      }
      totals[u.id] = unitExercises;
      const present = u.lessons.every((l) => existsSync(`content/${lang}/lessons/${l}.json`)) && u.grammar.every((g) => existsSync(`content/${lang}/grammar/${g}.json`));
      if (present && unitExercises < 120) err(u.id, `la unidad necesita ≥120 ejercicios (tiene ${unitExercises})`);
    }
    console.log(`${lang}: ${lessonsFound}/${lessonsTotal} lecciones · ${grammarDone.size} puntos de gramática · ${vocabIds.size} palabras`);

    const videos = read<Video[]>(`content/${lang}/videos.json`) ?? [];
    const vids = new Set<string>();
    for (const v of videos) {
      if (vids.has(v.id)) err(`videos ${lang}`, `vídeo repetido ${v.id}`);
      vids.add(v.id);
      if (v.questions?.length !== 3) err(`video ${v.id}`, 'necesita 3 preguntas');
      v.questions?.forEach((q, i) => !q.options.includes(q.answer) && err(`video ${v.id}`, `pregunta ${i + 1}: answer no está en options`));
      if (wantVideos) {
        const r = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${v.id}&format=json`);
        if (!r.ok) err(`video ${v.id}`, `oEmbed ${r.status}: el vídeo no existe o no se puede incrustar`);
        await new Promise((res) => setTimeout(res, 150));
      }
    }
    if (videos.length) console.log(`${lang}: ${videos.length} vídeos${wantVideos ? ' comprobados con oEmbed' : ''}`);
  }
  const unitsWithEx = Object.entries(totals).filter(([, n]) => n > 0);
  if (unitsWithEx.length)
    console.log(`Ejercicios escritos por unidad: mín ${Math.min(...unitsWithEx.map(([, n]) => n))}, total ${unitsWithEx.reduce((s, [, n]) => s + n, 0)}`);
  if (warnings.length) console.log(`\n${warnings.length} avisos${warnings.length > 40 ? ' (primeros 40)' : ''}:\n${warnings.slice(0, 40).join('\n')}`);
  if (errors.length) {
    console.log(`\n${errors.length} errores:\n${errors.join('\n')}`);
    process.exit(1);
  }
  console.log('\n✓ Contenido correcto');
}

void main();
