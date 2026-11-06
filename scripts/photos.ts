/**
 * npm run photos — descarga fotos libres en tiempo de construcción.
 * Fuentes: Openverse (sin clave) y Wikimedia Commons; Pexels/Unsplash si hay claves en .env.local
 * (PEXELS_API_KEY / UNSPLASH_ACCESS_KEY). Optimiza a WebP y AVIF (480 y 960 px) en public/img/photos/
 * y guarda autor, licencia y enlace en content/credits.json.
 * Fotos: paradas del mapa (stop-<unidad>), lecciones (photoQuery → clave = id de lección) y frase del día.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';
import type { DailyPhrase, Lang, Lesson, PhotoCredit, Unit } from '../src/content/types';

const OUT = 'public/img/photos';
mkdirSync(OUT, { recursive: true });
const UA = 'IdiomasYolanda/1.0 (educational, non-commercial; build script)';
const env: Record<string, string> = {};
if (existsSync('.env.local'))
  for (const l of readFileSync('.env.local', 'utf8').split('\n')) {
    const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.+)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }

const credits: PhotoCredit[] = existsSync('content/credits.json') ? JSON.parse(readFileSync('content/credits.json', 'utf8')) : [];
const have = new Set(credits.map((c) => c.key));
const usedSources = new Set(credits.map((c) => c.source));
const limit = process.argv.includes('--limit') ? Number(process.argv[process.argv.indexOf('--limit') + 1]) : Infinity;

interface Job {
  key: string;
  query: string;
}
const jobs: Job[] = [];
const STOP_HINT: Record<Lang, string> = { en: '', it: ' Italy' };
for (const lang of ['en', 'it'] as Lang[]) {
  const units: Unit[] = JSON.parse(readFileSync(`content/${lang}/units.json`, 'utf8'));
  for (const u of units) {
    jobs.push({ key: `stop-${u.id}`, query: `${u.stop.name.replace(/\(.*?\)/g, '').split(/[—,]/)[0].trim()}${STOP_HINT[lang]}` });
    for (const lid of u.lessons) {
      const p = `content/${lang}/lessons/${lid}.json`;
      if (!existsSync(p)) continue;
      const l: Lesson = JSON.parse(readFileSync(p, 'utf8'));
      if (l.photoQuery) jobs.push({ key: lid, query: l.photoQuery });
    }
  }
  const dp = `content/${lang}/daily.json`;
  if (existsSync(dp)) for (const d of JSON.parse(readFileSync(dp, 'utf8')) as (DailyPhrase & { photoQuery?: string })[]) if (d.photo && d.photoQuery) jobs.push({ key: d.photo, query: d.photoQuery });
}

interface Found {
  url: string;
  author: string;
  license: string;
  licenseUrl?: string;
  source: string;
  title?: string;
}

const OK_LICENSES = /^(cc0|pdm|by|by-sa|cc by|cc by-sa|public domain|cc-by|cc-by-sa)/i;

async function openverse(q: string): Promise<Found[]> {
  const u = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(q)}&license=cc0,pdm,by,by-sa&mature=false&page_size=20&aspect_ratio=wide,square`;
  const r = await fetch(u, { headers: { 'User-Agent': UA } });
  if (r.status === 429) throw new Error('429');
  if (!r.ok) return [];
  const d = (await r.json()) as { results: { url: string; creator?: string; license: string; license_version?: string; license_url?: string; foreign_landing_url: string; title?: string; width?: number; height?: number }[] };
  return d.results
    .filter((x) => (x.width ?? 1000) >= 800)
    .map((x) => ({
      url: x.url,
      author: x.creator || 'Autor desconocido',
      license: `${x.license.toUpperCase()}${x.license_version ? ` ${x.license_version}` : ''}`.replace(/^PDM.*/, 'Dominio público').replace(/^CC0.*/, 'CC0'),
      licenseUrl: x.license_url,
      source: x.foreign_landing_url,
      title: x.title,
    }));
}

async function commons(q: string): Promise<Found[]> {
  const u = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=15&gsrsearch=${encodeURIComponent(q + ' filetype:bitmap')}&prop=imageinfo&iiprop=url|extmetadata|size&iiurlwidth=1200`;
  const r = await fetch(u, { headers: { 'User-Agent': UA } });
  if (!r.ok) return [];
  const d = (await r.json()) as { query?: { pages: Record<string, { title: string; imageinfo?: { thumburl?: string; url: string; width: number; descriptionurl: string; extmetadata?: Record<string, { value: string }> }[] }> } };
  const strip = (s?: string) => (s ?? '').replace(/<[^>]+>/g, '').trim();
  return Object.values(d.query?.pages ?? {})
    .map((p) => ({ p, i: p.imageinfo?.[0] }))
    .filter(({ i }) => i && i.width >= 800 && OK_LICENSES.test(strip(i.extmetadata?.LicenseShortName?.value)))
    .map(({ p, i }) => ({
      url: i!.thumburl ?? i!.url,
      author: strip(i!.extmetadata?.Artist?.value) || 'Wikimedia Commons',
      license: strip(i!.extmetadata?.LicenseShortName?.value),
      licenseUrl: strip(i!.extmetadata?.LicenseUrl?.value) || undefined,
      source: i!.descriptionurl,
      title: p.title.replace(/^File:/, '').replace(/\.[a-z]+$/i, ''),
    }));
}

async function pexels(q: string): Promise<Found[]> {
  if (!env.PEXELS_API_KEY) return [];
  const r = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=10&orientation=landscape`, { headers: { Authorization: env.PEXELS_API_KEY } });
  if (!r.ok) return [];
  const d = (await r.json()) as { photos: { src: { large: string }; photographer: string; url: string; alt?: string }[] };
  return d.photos.map((x) => ({ url: x.src.large, author: x.photographer, license: 'Licencia Pexels', licenseUrl: 'https://www.pexels.com/license/', source: x.url, title: x.alt }));
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let openverseBlocked = false;

async function find(q: string): Promise<Found[]> {
  const p = await pexels(q);
  if (p.length) return p;
  if (!openverseBlocked) {
    try {
      const o = await openverse(q);
      if (o.length) return o;
    } catch {
      openverseBlocked = true;
      console.log('Openverse limita las peticiones: sigo con Wikimedia Commons');
    }
  }
  return commons(q);
}

let done = 0;
const pending = jobs.filter((j) => !have.has(j.key)).slice(0, limit);
console.log(`Fotos: ${jobs.length} en total, ${pending.length} por descargar`);
for (const j of pending) {
  try {
    const list = (await find(j.query)).filter((f) => !usedSources.has(f.source));
    let saved = false;
    for (const f of list.slice(0, 4)) {
      const r = await fetch(f.url, { headers: { 'User-Agent': UA } });
      if (!r.ok) continue;
      const buf = Buffer.from(await r.arrayBuffer());
      const base = j.key.replace(/[^a-z0-9-]/gi, '-');
      try {
        const img = sharp(buf).rotate();
        const meta = await img.metadata();
        if (!meta.width || meta.width < 600) continue;
        for (const w of [480, 960]) {
          const pipe = sharp(buf).rotate().resize({ width: w, height: Math.round(w * 0.66), fit: 'cover', position: 'attention' });
          await pipe.clone().webp({ quality: 72 }).toFile(`${OUT}/${base}-${w}.webp`);
          await pipe.clone().avif({ quality: 50 }).toFile(`${OUT}/${base}-${w}.avif`);
        }
      } catch {
        continue;
      }
      credits.push({ key: j.key, file: base, w: 960, h: Math.round(960 * 0.66), author: f.author.slice(0, 80), license: f.license, licenseUrl: f.licenseUrl, source: f.source, title: f.title?.slice(0, 100) });
      usedSources.add(f.source);
      saved = true;
      break;
    }
    done++;
    if (!saved) console.log(`  sin foto: ${j.key} («${j.query}»)`);
    if (done % 10 === 0) {
      writeFileSync('content/credits.json', JSON.stringify(credits, null, 1) + '\n');
      console.log(`  ${done}/${pending.length}`);
    }
    await sleep(openverseBlocked ? 400 : 1200);
  } catch (e) {
    console.log(`  error en ${j.key}: ${(e as Error).message}`);
  }
}
writeFileSync('content/credits.json', JSON.stringify(credits, null, 1) + '\n');
// limpieza: archivos sin crédito
const files = new Set(credits.map((c) => c.file));
const orphans = readdirSync(OUT).filter((f) => !files.has(f.replace(/-(480|960)\.(webp|avif)$/, '')));
console.log(`Listo: ${credits.length} fotos con crédito${orphans.length ? `; ${orphans.length} archivos huérfanos` : ''}`);
