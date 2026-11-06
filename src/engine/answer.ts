/**
 * Corrección flexible: ignora mayúsculas, tildes, puntuación, espacios dobles y
 * el apóstrofo tipográfico del teclado de iOS (’ frente a '). Acepta contracciones
 * equivalentes en inglés (I'm = I am) y señala la diferencia exacta palabra a palabra.
 */

const APOS = /[‘’ʼ`´]/g;

export function baseNormalize(s: string): string {
  return s
    .replace(APOS, "'")
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[¿¡!?.,;:"«»“”()…\-–—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const EN_CONTRACTIONS: [RegExp, string][] = [
  [/\bi'm\b/g, 'i am'],
  [/\b(you|we|they)'re\b/g, '$1 are'],
  [/\b(he|she|it|that|there|what|where|who|how)'s\b/g, '$1 is'],
  [/\b(i|you|we|they)'ve\b/g, '$1 have'],
  [/\b(i|you|he|she|it|we|they)'ll\b/g, '$1 will'],
  [/\b(i|you|he|she|it|we|they)'d\b/g, '$1 would'],
  [/\bcan't\b/g, 'cannot'],
  [/\bcan not\b/g, 'cannot'],
  [/\bwon't\b/g, 'will not'],
  [/\bshan't\b/g, 'shall not'],
  [/\b(do|does|did|is|are|was|were|have|has|had|could|would|should|must|need)n't\b/g, '$1 not'],
  [/\blet's\b/g, 'let us'],
];

/** Normaliza para comparar: con `lang: 'en'` expande contracciones. */
export function normalize(s: string, lang?: string): string {
  let n = baseNormalize(s);
  if (lang === 'en') {
    for (const [re, rep] of EN_CONTRACTIONS) n = n.replace(re, rep);
  }
  if (lang === 'it') {
    // l' acqua / l'acqua; un' amica / un'amica
    n = n.replace(/' +/g, "'");
  }
  return n.replace(/'/g, "'").replace(/\s+/g, ' ').trim();
}

export function isCorrect(given: string, accepted: string | string[], lang?: string): boolean {
  const g = normalize(given, lang);
  if (!g) return false;
  const list = Array.isArray(accepted) ? accepted : [accepted];
  return list.some((a) => normalize(a, lang) === g);
}

export interface DiffToken {
  text: string;
  status: 'ok' | 'wrong' | 'missing' | 'extra';
}

/** Compara palabra a palabra (LCS) contra la respuesta aceptada más parecida. */
export function diffAnswer(given: string, accepted: string | string[], lang?: string) {
  const list = Array.isArray(accepted) ? accepted : [accepted];
  let best: { target: string; tokens: DiffToken[]; score: number } | null = null;
  for (const target of list) {
    const tokens = diffWords(given, target, lang);
    const score = tokens.filter((t) => t.status === 'ok').length - tokens.filter((t) => t.status !== 'ok').length;
    if (!best || score > best.score) best = { target, tokens, score };
  }
  return best!;
}

export function diffWords(given: string, target: string, lang?: string): DiffToken[] {
  const a = normalize(given, lang).split(' ').filter(Boolean);
  const bRaw = target.replace(APOS, "'").split(/\s+/).filter(Boolean);
  const b = bRaw.map((w) => normalize(w, lang));
  // La expansión de contracciones puede partir una palabra: comparamos sobre la versión normalizada.
  const bN = normalize(target, lang).split(' ').filter(Boolean);
  const useRaw = bN.length === b.length;
  const tb = useRaw ? b : bN;
  const shown = useRaw ? bRaw.map((w) => w.replace(/[.,!?¿¡]/g, '')) : bN;

  const m = a.length;
  const n = tb.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--)
    for (let j = n - 1; j >= 0; j--)
      dp[i][j] = a[i] === tb[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);

  const out: DiffToken[] = [];
  let i = 0;
  let j = 0;
  while (i < m || j < n) {
    if (i < m && j < n && a[i] === tb[j]) {
      out.push({ text: shown[j], status: 'ok' });
      i++;
      j++;
    } else if (i < m && j < n && dp[i + 1][j + 1] >= Math.max(dp[i + 1][j], dp[i][j + 1])) {
      // sustitución: palabra que sobra y la que faltaba
      out.push({ text: a[i], status: 'wrong' });
      out.push({ text: shown[j], status: 'missing' });
      i++;
      j++;
    } else if (j < n && (i >= m || dp[i][j + 1] >= dp[i + 1][j])) {
      out.push({ text: shown[j], status: 'missing' });
      j++;
    } else {
      out.push({ text: a[i], status: 'extra' });
      i++;
    }
  }
  return out;
}

/** Trocea una frase para "ordenar palabras" conservando la forma original. */
export function tokenize(sentence: string): string[] {
  return sentence
    .replace(APOS, "'")
    .replace(/[.!?¿¡]+$/g, '')
    .split(/\s+/)
    .filter(Boolean);
}

/** ¿Las palabras elegidas forman una de las frases válidas? */
export function orderIsCorrect(chosen: string[], answer: string, alt: string[] = [], lang?: string) {
  return isCorrect(chosen.join(' '), [answer, ...alt], lang);
}
