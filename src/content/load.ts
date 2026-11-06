/**
 * Carga del contenido (JSON de /content). Las unidades y el índice son pequeños;
 * lecciones, gramática y charlas se cargan bajo demanda (un trozo por archivo).
 */
import type {
  Chat,
  DailyPhrase,
  GrammarPoint,
  Lang,
  LevelTestItem,
  Lesson,
  PhotoCredit,
  Unit,
  Video,
  VocabItem,
} from './types';

type Loader<T> = () => Promise<{ default: T }>;

const unitFiles = import.meta.glob<Unit[]>('/content/*/units.json', { eager: true, import: 'default' });
const lessonFiles = import.meta.glob<{ default: Lesson }>('/content/*/lessons/*.json') as Record<string, Loader<Lesson>>;
const grammarFiles = import.meta.glob<{ default: GrammarPoint }>('/content/*/grammar/*.json') as Record<
  string,
  Loader<GrammarPoint>
>;
const chatFiles = import.meta.glob<{ default: Chat }>('/content/*/chats/*.json') as Record<string, Loader<Chat>>;
const indexFiles = import.meta.glob<{ default: ContentIndex }>('/content/*/index.json') as Record<
  string,
  Loader<ContentIndex>
>;
const videoFiles = import.meta.glob<{ default: Video[] }>('/content/*/videos.json') as Record<string, Loader<Video[]>>;
const dailyFiles = import.meta.glob<{ default: DailyPhrase[] }>('/content/*/daily.json') as Record<
  string,
  Loader<DailyPhrase[]>
>;
const testFiles = import.meta.glob<{ default: LevelTestItem[] }>('/content/*/level-test.json') as Record<
  string,
  Loader<LevelTestItem[]>
>;
const creditFiles = import.meta.glob<{ default: PhotoCredit[] }>('/content/credits.json') as Record<
  string,
  Loader<PhotoCredit[]>
>;

/** Índice generado por `npm run content:index`: lo mínimo para mapas y repasos. */
export interface ContentIndex {
  lessons: Record<
    string,
    { unit: string; title: string; emoji?: string; grammar?: string; vocab: string[]; n: number; photo?: string }
  >;
  grammar: Record<string, { title: string; short: string; level: string; n: number; units: string[] }>;
  vocab: Record<string, VocabItem & { lesson: string }>;
  chats: Record<string, { unit: string; title: string; emoji: string }>;
}

export function units(lang: Lang): Unit[] {
  return unitFiles[`/content/${lang}/units.json`] ?? [];
}

export function unitById(lang: Lang, id: string) {
  return units(lang).find((u) => u.id === id);
}

export function lessonExists(lang: Lang, id: string) {
  return `/content/${lang}/lessons/${id}.json` in lessonFiles;
}

export function grammarExists(lang: Lang, id: string) {
  return `/content/${lang}/grammar/${id}.json` in grammarFiles;
}

const cache = new Map<string, unknown>();
async function cached<T>(key: string, loader?: Loader<T>): Promise<T | null> {
  if (cache.has(key)) return cache.get(key) as T;
  if (!loader) return null;
  const v = (await loader()).default;
  cache.set(key, v);
  return v;
}

export const loadLesson = (lang: Lang, id: string) =>
  cached<Lesson>(`l:${id}`, lessonFiles[`/content/${lang}/lessons/${id}.json`]);
export const loadGrammar = (lang: Lang, id: string) =>
  cached<GrammarPoint>(`g:${id}`, grammarFiles[`/content/${lang}/grammar/${id}.json`]);
export const loadChat = (lang: Lang, id: string) => cached<Chat>(`c:${id}`, chatFiles[`/content/${lang}/chats/${id}.json`]);
export const loadIndex = async (lang: Lang): Promise<ContentIndex> =>
  (await cached<ContentIndex>(`i:${lang}`, indexFiles[`/content/${lang}/index.json`])) ?? {
    lessons: {},
    grammar: {},
    vocab: {},
    chats: {},
  };
export const loadVideos = async (lang: Lang) =>
  (await cached<Video[]>(`v:${lang}`, videoFiles[`/content/${lang}/videos.json`])) ?? [];
export const loadDaily = async (lang: Lang) =>
  (await cached<DailyPhrase[]>(`d:${lang}`, dailyFiles[`/content/${lang}/daily.json`])) ?? [];
export const loadLevelTest = async (lang: Lang) =>
  (await cached<LevelTestItem[]>(`t:${lang}`, testFiles[`/content/${lang}/level-test.json`])) ?? [];

let creditMap: Map<string, PhotoCredit> | null = null;
export async function loadCredits(): Promise<Map<string, PhotoCredit>> {
  if (creditMap) return creditMap;
  const list = (await cached<PhotoCredit[]>('credits', creditFiles['/content/credits.json'])) ?? [];
  creditMap = new Map(list.map((c) => [c.key, c]));
  return creditMap;
}

/** Todas las lecciones del idioma en orden del curso. */
export function lessonOrder(lang: Lang): { unit: Unit; lessonId: string }[] {
  return units(lang).flatMap((u) => u.lessons.map((l) => ({ unit: u, lessonId: l })));
}

export const LANG_INFO: Record<Lang, { name: string; flag: string; bcp47: string; tutor: string; mascot: string }> = {
  en: { name: 'English', flag: '🇬🇧', bcp47: 'en-GB', tutor: 'Emma', mascot: 'Percy' },
  it: { name: 'Italiano', flag: '🇮🇹', bcp47: 'it-IT', tutor: 'Giulia', mascot: 'Lina' },
};

export const LEVEL_LABEL: Record<string, string> = {
  A0: 'Primeros pasos',
  A1: 'A1 · Principiante',
  A2: 'A2 · Básico',
  B1: 'B1 · Intermedio',
};
