# Especificación del contenido

Todo el contenido vive en `content/` como JSON y cumple los tipos de `src/content/types.ts`.
`npm run content:check` lo valida. **Léelo entero antes de escribir contenido.**

```
content/
  gift.json                     mensaje de cumpleaños, PIN del Modo Hugo
  photos.json                   claves de foto → consulta de búsqueda (las descarga scripts/photos.ts)
  credits.json                  generado: autor/licencia de cada foto
  en/ it/
    units.json                  Unit[] (orden del curso)
    lessons/<lessonId>.json     Lesson
    grammar/<grammarId>.json    GrammarPoint
    chats/<chatId>.json         Chat (Charla con Emma / Giulia)
    videos.json                 Video[] (solo ids verificados con oEmbed)
    daily.json                  DailyPhrase[] (frase del día)
    level-test.json             LevelTestItem[] (solo inglés)
```

## Ids

| Cosa | Formato | Ejemplo |
|---|---|---|
| Unidad | `<lang>-<nivel>-uNN` | `en-a1-u03`, `it-a0-u00` |
| Lección | `<unidad>-lN` | `en-a1-u03-l2` |
| Gramática | `<lang>-g-<slug>` | `en-g-present-simple`, `it-g-articoli-det` |
| Charla | `<unidad>-cN` | `it-a1-u02-c1` |
| Vocabulario | slug único en todo el idioma | `grandson`, `il-nonno`, `how-much-is-it` |

Los ids de ejercicios son únicos **dentro de su archivo** (`e1`, `e2`…).

## Reglas de calidad (obligatorias)

1. **Todo original.** No copies textos ni ejercicios de libros, webs ni apps.
2. Español **de España**, natural y cariñoso ("Muy bien", "Fíjate en…", "¡Ojo!"). Tuteo. Sin jerga técnica:
   nunca "MCER", "flashcard", "FSRS", "input", "chunk". Términos gramaticales sencillos y explicados.
3. Inglés **británico** por defecto (colour, mum, flat, holiday); si una palabra cambia en EE. UU., añádelo en `note` ("En EE. UU.: apartment").
   Italiano estándar.
4. Destinataria: **Yolanda, madre española adulta**, con hijos (Hugo) y quizá nietos, que viaja. Personaliza los ejemplos con su vida:
   familia, cocina, viajes, médico, móvil, WhatsApp, nietos, amigas, el pueblo, el mercado. Nada infantil.
5. Frases cortas y naturales (A1: ≤ 8 palabras; A2: ≤ 12; B1: ≤ 16).
6. Cada `why` explica con calma la regla ("Con *she* el verbo lleva -s: she work**s**."). Máx. 2 frases.
7. Las respuestas deben ser coherentes: `answer` está entre `options`; `fill.answer` encaja en el hueco `___`;
   en `order`, `answer` es la frase completa; `error.wrong` aparece literalmente en `q`.
   Incluye en `answer` (array) todas las variantes razonables (contracciones: "she's" / "she is"; con o sin artículo cuando ambos son correctos).
8. `reviewed: false` siempre.
9. Sin datos falsos sobre el mundo (curiosidades verificables y conocidas).

## Qué escribir por unidad

Las unidades, sus lecciones (`l1…l5`, `l1…l6` en `it-a0-u00`), sus puntos de gramática y sus charlas (`c1…c3`) ya están en
`content/<lang>/units.json` (generado desde `docs/TEMARIO.md`). Para cada unidad hay que escribir:

- 5 lecciones siguiendo la plantilla de TEMARIO.md: l1 Palabras · l2 Gramática 1 · l3 Frases y diálogo · l4 Gramática 2 + sonidos ·
  l5 Reto de la parada (situación real, repaso). Si la unidad tiene 1 punto gramatical, l2 y l4 lo trabajan en dos partes;
  si tiene 3, l3 también lleva uno. Cada lección: campo `grammar` con un id de la unidad (l1 y l5 pueden repasar uno ya visto).
- Todos los puntos de gramática de la unidad (`grammar/<id>.json`, ≥30 ejercicios cada uno).
- 3 charlas (`chats/<unidad>-c1..c3.json`).
- En cada lección, `photoQuery`: búsqueda en inglés (3–5 palabras, sin personas famosas ni marcas) para una foto bonita de la
  lección; un script la descarga de Openverse. No pongas `photo` a mano.
- Usa las columnas de TEMARIO.md (tema, vocabulario, pronunciación, falso amigo, parada) como guion.

Comprueba tu trabajo con `npm run content:check -- --only <prefijo-de-unidad>` y corrige hasta que no haya errores.

## Lección (`Lesson`)

Siempre la misma estructura (la app la muestra en este orden):

1. `goal` — "Hoy vas a aprender…" (1 frase, sin ese prefijo: "a presentarte y decir de dónde eres").
2. `vocab` — **6 a 10** palabras o expresiones. Cada una con `emoji` (obligatorio: un emoji Unicode que la represente; para
   palabras abstractas usa uno simbólico: ⏰ para "always", ➡️ para "then"…), `ex` (frase de ejemplo con su traducción), `pos`.
   Puedes añadir `photo` solo si existe esa clave en `content/photos.json` (si quieres una nueva, añádela allí con su consulta en inglés).
   Prioriza bloques de palabras útiles ("How much is it?", "Vorrei un caffè") además de palabras sueltas.
3. `grammar` — id del punto de gramática que se explica (o se repasa) en la lección. Normalmente 1 o 2 lecciones por punto.
4. `pron` — mini-sección de pronunciación (inglés: sonidos difíciles, pares mínimos, -ed, acento, entonación; italiano: c/g, gl, gn, sc, dobles…).
5. `exercises` — **12 a 16** ejercicios escritos a mano, de al menos **7 tipos distintos** (ver abajo), mezclados.
   La app añade automáticamente ejercicios de vocabulario (foto→palabra, escuchar→foto, dictado, emparejar…), así que aquí
   céntrate en gramática en contexto, situaciones, lectura y frases.
6. `dialog` — 6–10 líneas entre 2 personajes con nombre, `setting` en español, y 3 preguntas de comprensión en español.
7. `realLife` — una frase útil para viajar o hablar con la familia, con `context` ("Para pedir la cuenta en un restaurante").
8. Italiano: `same` ("Igual que en español", 2–4 ejemplos) y `falseFriend` (uno por lección cuando tenga sentido; al menos uno por unidad).
9. `summary` — 3–5 viñetas de lo aprendido.

## Gramática (`GrammarPoint`)

- `story`: **5 a 8 pantallas** tipo "historia de Instagram": `intro` → `rule`/`table` → `compare` → `errors` → `tip`.
  Muy poco texto por pantalla (≤ 35 palabras). Marca con `==…==` la parte que cambia ("I ==am==, you ==are==, she ==is==").
  En tablas: columnas típicas `["", "Afirmativa", "Negativa", "Pregunta"]` o persona/forma. Ejemplos con traducción.
- `compare`: cómo se dice en español y cómo en el otro idioma.
- `errors`: 3–6 errores típicos de hispanohablantes (`wrong` ❌, `right` ✅, `why`).
- `exercises`: **mínimo 30**, de **al menos 6 tipos**: choose, fill (con y sin `bank`), order, transform, error,
  conjugate, translate, situation, match. Dificultad creciente. Todas llevan `why` y `g` = el id del punto.

## Tipos de ejercicio escritos a mano

| type | Para qué | Campos clave |
|---|---|---|
| `choose` | Elegir la forma correcta | `q` con `___`, `options` (2–4), `answer` |
| `fill` | Completar el hueco (escribiendo, o con `bank`) | `q` con un `___`, `answer[]`, `bank?` (incluye la respuesta + 2–3 distractores) |
| `order` | Ordenar tocando palabras | `es`, `answer` (frase; se trocea por espacios), `extra?` (1–2 distractores) |
| `translate` | Escribir la traducción | `dir: "to"` (español→idioma) o `"from"`, `q`, `answer[]` con variantes |
| `transform` | Transformar la frase | `instr` ("Hazla negativa"), `q`, `answer[]` |
| `error` | Encontrar la palabra que está mal | `q`, `wrong` (palabra literal de q), `fix` |
| `conjugate` | Conjugar el verbo | `verb`, `person`, `tense`, `q` con `___`, `answer[]`, `table?` |
| `situation` | ¿Qué dices en esta situación? | `context` (español), `options`, `answer` |
| `reading` | Texto corto realista | `kind`, `text` (en el idioma), `questions[]` en español |
| `minimal` | Pares mínimos | `pair: [a, b]`, `answer` |
| `speak` | Decir la frase | `t`, `es` |
| `match` | Emparejar | `pairs: [[a, b], …]` (4–5 pares) |

Escribe `q`/`answer` en el idioma que se aprende salvo en `translate dir:"from"` (answer en español).
En `order` no uses puntuación pegada que complique trocear: la app ignora `.,?!` al comparar.

## Charla (`Chat`)

Diálogo ramificado con Emma (Londres) o Giulia (Roma). 6–10 nodos. Cada nodo del personaje (`says`) ofrece 2–3 `options`
(una correcta `ok: true`, otras plausibles con `feedback` amable que explica). `next: "end"` termina.

## Ejemplo mínimo de lección

```json
{
  "id": "en-a1-u01-l1",
  "unit": "en-a1-u01",
  "title": "¡Hola! Me llamo Yolanda",
  "goal": "a saludar y decir tu nombre",
  "emoji": "👋",
  "vocab": [
    { "id": "hello", "t": "Hello", "es": "Hola", "emoji": "👋", "pos": "phrase",
      "ex": { "t": "Hello, I'm Yolanda.", "es": "Hola, soy Yolanda." } }
  ],
  "grammar": "en-g-to-be",
  "pron": { "title": "La h de hello", "tip": "La h inglesa suena como un suspiro suave, no como nuestra jota.", "words": ["hello", "house", "happy"] },
  "exercises": [
    { "id": "e1", "type": "choose", "q": "I ___ Yolanda.", "options": ["am", "is", "are"], "answer": "am",
      "why": "Con I siempre usamos am: I am (I'm).", "g": "en-g-to-be" }
  ],
  "dialog": { "title": "En la recepción", "setting": "En un hotel de Londres", "lines": [
      { "who": "Emma", "t": "Hello! What's your name?", "es": "¡Hola! ¿Cómo te llamas?" } ],
    "questions": [ { "q": "¿Dónde están?", "options": ["En un hotel", "En un bar"], "answer": "En un hotel" } ] },
  "realLife": { "t": "Nice to meet you.", "es": "Encantada de conocerte.", "context": "Cuando te presentan a alguien" },
  "summary": ["Saludar: Hello / Hi", "Decir tu nombre: I'm Yolanda"],
  "reviewed": false
}
```
