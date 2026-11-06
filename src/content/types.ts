/**
 * Contrato del contenido. Toda la carpeta /content cumple estos tipos y
 * `npm run content:check` lo valida. Ver docs/CONTENIDO.md.
 */

export type Lang = 'en' | 'it';
export type Level = 'A0' | 'A1' | 'A2' | 'B1';

/** Texto en el idioma que se aprende con su traducción al español. */
export interface Phrase {
  t: string; // texto en inglés / italiano
  es: string; // traducción natural al español de España
}

export interface VocabItem {
  id: string; // único dentro del idioma, kebab-case: "grandson", "il-nonno"
  t: string; // palabra o expresión ("the grandson", "il nonno")
  es: string; // "el nieto"
  emoji?: string; // icono (se pinta con Twemoji)
  photo?: string; // clave de foto en content/photos.json (opcional)
  ex: Phrase; // frase de ejemplo
  pos?: 'n' | 'v' | 'adj' | 'adv' | 'phrase' | 'other';
  /** Notas breves que aparecen al tocar ("¡Ojo! falso amigo"…). */
  note?: string;
}

/** Una pantalla de la "historia" de gramática. */
export interface StoryScreen {
  title: string;
  text: string; // español, corto. **negrita** y ==resaltado== permitidos
  /** Tabla visual opcional. Las celdas pueden llevar ==parte que cambia==. */
  table?: { head?: string[]; rows: string[][] };
  examples?: (Phrase & { hl?: string })[];
  emoji?: string;
  /** "es": comparación con el español. */
  kind?: 'intro' | 'rule' | 'table' | 'compare' | 'errors' | 'tip';
}

export interface ErrorExample {
  wrong: string;
  right: string;
  why: string;
}

// ───────── Ejercicios escritos a mano ─────────

interface ExBase {
  id: string; // único dentro del archivo
  /** Explicación amable que se muestra al fallar (y al acertar, si se toca "¿Por qué?"). */
  why?: string;
  /** Punto de gramática relacionado: enlaza a su historia. */
  g?: string;
}

/** Elegir la opción correcta (forma gramatical, a/an, il/lo/la…). q lleva ___ */
export interface ExChoose extends ExBase {
  type: 'choose';
  q: string;
  es?: string;
  options: string[];
  answer: string;
}
/** Completar el hueco. Con `bank` se elige de un banco; sin él, se escribe. */
export interface ExFill extends ExBase {
  type: 'fill';
  q: string; // "She ___ a teacher."
  es?: string;
  answer: string[]; // variantes aceptadas
  bank?: string[];
  hint?: string;
}
/** Ordenar la frase tocando palabras. */
export interface ExOrder extends ExBase {
  type: 'order';
  es: string;
  answer: string; // frase correcta; se trocea por espacios
  alt?: string[]; // otros órdenes válidos
  extra?: string[]; // palabras de distracción
}
/** Escribir la traducción. */
export interface ExTranslate extends ExBase {
  type: 'translate';
  dir: 'to' | 'from'; // to: español → idioma; from: idioma → español
  q: string;
  answer: string[];
}
/** Transformar una frase (negativa, pregunta, pasado…). */
export interface ExTransform extends ExBase {
  type: 'transform';
  instr: string; // "Hazla negativa"
  q: string;
  answer: string[];
}
/** Encontrar la palabra que está mal. */
export interface ExError extends ExBase {
  type: 'error';
  q: string; // frase con un error
  wrong: string; // la palabra incorrecta tal y como aparece
  fix: string; // la palabra correcta
  es?: string;
}
/** Conjugar un verbo. */
export interface ExConjugate extends ExBase {
  type: 'conjugate';
  verb: string; // "to have" / "avere"
  person: string; // "she" / "lui"
  tense: string; // "presente", "pasado"…
  q: string; // "She ___ two grandchildren."
  answer: string[];
  table?: string[][]; // tabla de ayuda opcional
}
/** Situación de la vida real: ¿qué dices? */
export interface ExSituation extends ExBase {
  type: 'situation';
  context: string; // español
  emoji?: string;
  options: string[];
  answer: string;
}
/** Lectura breve (menú, mensaje, cartel, email) con preguntas. */
export interface ExReading extends ExBase {
  type: 'reading';
  kind: 'menu' | 'message' | 'sign' | 'email' | 'text' | 'ticket';
  title?: string;
  text: string;
  questions: { q: string; options: string[]; answer: string }[]; // preguntas en español
}
/** Pares mínimos: ¿cuál has oído? */
export interface ExMinimal extends ExBase {
  type: 'minimal';
  pair: [string, string];
  answer: string; // la que suena
  es?: [string, string];
}
/** Escuchar y repetir / decir la frase. */
export interface ExSpeak extends ExBase {
  type: 'speak';
  t: string;
  es: string;
}
/** Emparejar (pregunta–respuesta, palabra–traducción…). */
export interface ExMatch extends ExBase {
  type: 'match';
  pairs: [string, string][];
}

export type AuthoredExercise =
  | ExChoose
  | ExFill
  | ExOrder
  | ExTranslate
  | ExTransform
  | ExError
  | ExConjugate
  | ExSituation
  | ExReading
  | ExMinimal
  | ExSpeak
  | ExMatch;

export interface DialogLine {
  who: string; // nombre del personaje
  t: string;
  es: string;
}

export interface Dialog {
  title: string;
  setting: string; // "En una cafetería de Londres"
  emoji?: string;
  lines: DialogLine[];
  questions: { q: string; options: string[]; answer: string }[];
}

export interface Pronunciation {
  title: string; // "La h de house"
  tip: string; // explicación sencilla en español
  words?: string[]; // palabras para escuchar
  pairs?: [string, string][]; // pares mínimos
}

export interface Lesson {
  id: string; // "en-a1-u01-l1"
  unit: string;
  title: string;
  goal: string; // "Hoy vas a aprender…"
  photo?: string; // la pone scripts/photos.ts a partir de photoQuery
  /** Búsqueda en inglés para la foto de la lección (Openverse), p. ej. "london red bus street". */
  photoQuery?: string;
  emoji?: string;
  vocab: VocabItem[];
  grammar?: string; // id del punto de gramática que se explica en esta lección
  pron?: Pronunciation;
  exercises: AuthoredExercise[];
  dialog: Dialog;
  realLife: Phrase & { context: string };
  /** Solo italiano: "Igual que en español" y "¡Ojo! Falso amigo". */
  same?: { text: string; examples: Phrase[] };
  falseFriend?: { word: string; means: string; looksLike: string; emoji?: string; tip: string };
  summary: string[];
  reviewed: boolean;
}

export interface GrammarPoint {
  id: string; // "en-g-to-be"
  lang: Lang;
  level: Level;
  title: string; // "El verbo to be (ser / estar)"
  short: string; // una línea
  story: StoryScreen[];
  compare: { es: string; target: string }; // "En español decimos…" / "En inglés…"
  errors: ErrorExample[];
  /** Al menos 30 ejercicios para el Laboratorio. */
  exercises: AuthoredExercise[];
  /** Vídeo explicativo propio (Remotion) o de YouTube, opcional. */
  video?: string;
  reviewed: boolean;
}

export interface Unit {
  id: string; // "en-a1-u01"
  lang: Lang;
  level: Level;
  n: number;
  title: string;
  theme: string;
  emoji: string;
  stop: { name: string; curiosity: string; photo?: string };
  grammar: string[];
  lessons: string[];
  /** Mini-reto final */
  challenge: { title: string; badge: string; badgeEmoji: string };
  /** Charlas con Emma / Giulia (diálogos ramificados) */
  chats?: string[];
}

export interface ChatNode {
  id: string;
  says: Phrase; // lo que dice el personaje
  /** Opciones de respuesta; next = id del siguiente nodo (o "end"). */
  options?: { t: string; es: string; next: string; ok?: boolean; feedback?: string }[];
  next?: string;
}
export interface Chat {
  id: string;
  unit: string;
  title: string;
  setting: string;
  emoji: string;
  start: string;
  nodes: ChatNode[];
  reviewed: boolean;
}

export interface Video {
  id: string; // id de YouTube (verificado vía oEmbed)
  lang: Lang;
  level: Level;
  title: string; // título original
  channel: string;
  topic: string; // de qué trata (español)
  minutes: number;
  unit?: string;
  grammar?: string;
  questions: { q: string; options: string[]; answer: string }[];
}

export interface PhotoCredit {
  key: string;
  file: string; // nombre base en public/img (sin tamaño ni extensión)
  w: number;
  h: number;
  author: string;
  license: string;
  licenseUrl?: string;
  source: string; // URL de la página de la foto
  title?: string;
}

export interface LevelTestItem {
  id: string;
  level: Level;
  q: string;
  es?: string;
  options: string[];
  answer: string;
  unit: string; // unidad a la que mandar si falla
}

export interface DailyPhrase extends Phrase {
  photo?: string;
  emoji?: string;
  note?: string;
}
