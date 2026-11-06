import type { Exercise } from '@/engine/session';

type Ex = { q: string; a: string };
/** Ayuda "?" de cada tipo de ejercicio, con un ejemplo resuelto en cada idioma. */
export const HELP: Record<Exercise['type'], { how: string; en: Ex; it: Ex }> = {
  pic2word: {
    how: 'Mira el dibujo y toca la palabra que le corresponde. Al tocarla, la oirás. Luego pulsa «Comprobar».',
    en: { q: '🍎 → apple · bread · milk', a: 'apple' },
    it: { q: '🍎 → la mela · il pane · il latte', a: 'la mela' },
  },
  listen2pic: {
    how: 'Escucha la palabra (puedes repetirla, o oírla despacio con la tortuga 🐢) y toca el dibujo que corresponde.',
    en: { q: '🔊 «cat» → 🐶 🐱 🐦', a: '🐱' },
    it: { q: '🔊 «il gatto» → 🐶 🐱 🐦', a: '🐱' },
  },
  listen2text: {
    how: 'Escucha la frase y toca la que has oído.',
    en: { q: '🔊 «I like tea.»', a: 'I like tea.' },
    it: { q: '🔊 «Mi piace il tè.»', a: 'Mi piace il tè.' },
  },
  pickTrans: {
    how: 'Lee la palabra y toca su traducción.',
    en: { q: 'the grandson → el nieto · la abuela', a: 'el nieto' },
    it: { q: 'il nipote → el nieto · la abuela', a: 'el nieto' },
  },
  pairs: {
    how: 'Toca una palabra de la izquierda y después su pareja de la derecha. Cuando aciertes, se quedan marcadas.',
    en: { q: 'mother ↔ madre · father ↔ padre', a: 'Todas emparejadas' },
    it: { q: 'madre ↔ madre · padre ↔ padre', a: 'Todas emparejadas' },
  },
  match: {
    how: 'Toca un elemento de la izquierda y después su pareja de la derecha.',
    en: { q: 'How are you? ↔ Fine, thanks.', a: 'Pregunta y respuesta juntas' },
    it: { q: 'Come stai? ↔ Bene, grazie.', a: 'Pregunta y respuesta juntas' },
  },
  dictation: {
    how: 'Escucha y escribe exactamente lo que oyes. Puedes oírlo las veces que quieras. No importan las mayúsculas ni las tildes.',
    en: { q: '🔊 «good morning»', a: 'good morning' },
    it: { q: '🔊 «buongiorno»', a: 'buongiorno' },
  },
  listenDialog: {
    how: 'Escucha el diálogo y contesta la pregunta.',
    en: { q: '¿Qué pide Tom? «A tea, please.»', a: 'Un té' },
    it: { q: '¿Qué pide Marco? «Un caffè, per favore.»', a: 'Un café' },
  },
  choose: {
    how: 'Lee la frase con el hueco y toca la palabra que falta. Luego pulsa «Comprobar».',
    en: { q: 'She ___ my sister. (am · ==is== · are)', a: 'She ==is== my sister.' },
    it: { q: '___ casa è grande. (Il · ==La== · Lo)', a: '==La== casa è grande.' },
  },
  fill: {
    how: 'Completa el hueco: escribe la palabra o tócala en el banco de palabras.',
    en: { q: 'I ___ two grandchildren. (have)', a: 'I ==have== two grandchildren.' },
    it: { q: 'Io ___ due figli. (avere)', a: 'Io ==ho== due figli.' },
  },
  order: {
    how: 'Toca las palabras en el orden correcto para formar la frase. Si te equivocas, toca la palabra de arriba para quitarla, o pulsa «Deshacer».',
    en: { q: 'is · name · My · Yolanda', a: 'My name is Yolanda' },
    it: { q: 'chiamo · Mi · Yolanda', a: 'Mi chiamo Yolanda' },
  },
  translate: {
    how: 'Escribe la traducción. Se aceptan distintas formas correctas, y te señalo la diferencia si algo no encaja.',
    en: { q: 'Tengo dos hijos.', a: 'I have two children.' },
    it: { q: 'Tengo dos hijos.', a: 'Ho due figli.' },
  },
  transform: {
    how: 'Cambia la frase como te pide la etiqueta amarilla (por ejemplo, a negativa o a pregunta) y escríbela entera.',
    en: { q: 'Hazla negativa: She likes coffee.', a: 'She ==doesn’t like== coffee.' },
    it: { q: 'Hazla negativa: Parlo inglese.', a: '==Non== parlo inglese.' },
  },
  error: {
    how: 'Hay una palabra que está mal. Tócala y pulsa «Comprobar».',
    en: { q: 'People ==is== very nice here.', a: 'People ==are== very nice here.' },
    it: { q: '==Il== acqua è fredda.', a: '==L’==acqua è fredda.' },
  },
  conjugate: {
    how: 'Escribe la forma correcta del verbo para esa persona. Si lo necesitas, abre la tabla de ayuda.',
    en: { q: 'to work · he · presente: He ___ in a bank.', a: 'He ==works== in a bank.' },
    it: { q: 'parlare · lei · presente: Lei ___ italiano.', a: 'Lei ==parla== italiano.' },
  },
  situation: {
    how: 'Imagina la situación y toca lo que dirías.',
    en: { q: 'Quieres la cuenta en un restaurante.', a: 'Could I have the bill, please?' },
    it: { q: 'Quieres un café en un bar de Roma.', a: 'Un caffè, per favore.' },
  },
  reading: {
    how: 'Lee el texto (puedes escucharlo) y contesta las preguntas tocando la respuesta.',
    en: { q: 'MENU — Tea £2 · ¿Cuánto cuesta el té?', a: '2 libras' },
    it: { q: 'MENÙ — Caffè 1,20 € · ¿Cuánto cuesta el café?', a: '1,20 euros' },
  },
  minimal: {
    how: 'Escucha una palabra y toca cuál de las dos has oído. Se parecen mucho: ¡escucha con calma!',
    en: { q: '🔊 → ship · sheep', a: 'sheep (oveja, con i larga)' },
    it: { q: '🔊 → pala · palla', a: 'palla (con doble l)' },
  },
  speak: {
    how: 'Escucha la frase, toca el micrófono y repítela en voz alta. Si tu teléfono no puede escucharte, grábate o dime qué tal te ha salido.',
    en: { q: '🎤 «Nice to meet you.»', a: '¡Muy bien dicho!' },
    it: { q: '🎤 «Piacere di conoscerti.»', a: '¡Muy bien dicho!' },
  },
};
