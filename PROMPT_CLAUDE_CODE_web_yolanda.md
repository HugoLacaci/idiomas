# PROMPT PARA CLAUDE CODE: web para aprender inglés e italiano (regalo para mi madre, Yolanda)

> **Cómo usarlo:** abre Claude Code en `C:\CHINA\IDIOMA` y pega este documento entero.
>
> **Dónde va el proyecto:** crea la carpeta nueva **`C:\CHINA\IDIOMA\yolanda`**, al lado de la carpeta de la web de chino (`C:\CHINA\IDIOMA\xueban`). Todo el proyecto va dentro de `yolanda`. No modifiques nada de `xueban`. Solo puedes leerlo para reutilizar ideas o código, copiándolo a `yolanda`.

---

## 0. Qué quiero y para quién

Quiero regalarle a mi madre, **Yolanda**, por su cumpleaños una **web para aprender idiomas**.

**Los idiomas y su nivel:**
- **Inglés:** tiene un nivel básico. Quiero que la web haga **mucho hincapié en la gramática**, además de enseñarle vocabulario nuevo.
- **Italiano:** empieza de cero, pero quiere aprender.

**Requisitos:**
- Elige el idioma al entrar y puede cambiarlo cuando quiera. Cada idioma guarda su propio progreso.
- **Se usará sobre todo en su iPhone, en vertical.** También debe funcionar bien en ordenador.
- Interfaz en **español**, **muy intuitiva y llamativa**. Pensada para una persona adulta que no es experta en tecnología.
- **Temática visual inglesa** en la parte de inglés y **temática italiana** en la de italiano.
- Puedes usar **fotos y vídeos** para explicar el temario.
- **No hace falta un apartado de apuntes**, pero sí **muchos ejercicios**.
- Todo **gratuito**. Puedes instalar lo que necesites mientras sea gratis.
- Tienes libertad para añadir todo lo que creas que la hará mejor.

Actúa como un equipo de:
- profesora de inglés y de italiano para hispanohablantes adultos;
- diseñador de producto especializado en apps para todos los públicos (nivel Duolingo, Babbel y Busuu, pero más clara y sin agobiar);
- ingeniero frontend senior.

---

## 1. Antes de programar: investiga y documenta

Busca en la web y escribe `docs/INVESTIGACION.md` con enlaces a fuentes fiables. Debe cubrir:

1. **Temario por niveles del MCER (A1 → B1):**
   - **Inglés:** British Council / EAQUALS *Core Inventory for General English*, las listas de gramática de Cambridge English (A1 Movers/Flyers, A2 Key, B1 Preliminary) y la English Grammar Profile (solo como referencia; no copies sus textos).
   - **Italiano:** *Profilo della lingua italiana*, sílabos PLIDA (Società Dante Alighieri), CILS (Università per Stranieri di Siena) y CELI, y programas A1/A2 de los Istituti Italiani di Cultura.
2. **Métodos de aprendizaje que funcionan con adultos:**
   - repetición espaciada;
   - práctica de recuperación (recordar antes de ver la respuesta);
   - enfoque comunicativo con gramática explícita y ejemplos;
   - aprender en bloques de palabras (chunks) y en contexto;
   - mucho input comprensible (audio y lectura fáciles);
   - práctica oral temprana;
   - sesiones cortas y diarias;
   - apoyo visual (imagen + palabra + audio);
   - feedback positivo y explicativo;
   - personalización con temas de su vida.
3. **Dificultades típicas de hispanohablantes:**
   - **En inglés:**
     - pronunciación: vocales cortas y largas, schwa, la terminación -ed, la s de la tercera persona, los sonidos th y h, sh frente a ch, y el acento de las palabras;
     - falsos amigos;
     - omitir el sujeto ("Is raining");
     - el auxiliar do/does;
     - "I have 50 years";
     - el orden del adjetivo;
     - "people is";
     - el uso de the.
   - **En italiano:**
     - aprovechar todo lo que se parece al español: palabras transparentes (cognados) y gramática común;
     - **falsos amigos** (burro, caldo, salire, guardare, imbarazzata, tirare, subito…);
     - cambios de género (il latte, il sale, il fiore);
     - las dobles consonantes;
     - la pronunciación de c/g + e/i, gl, gn y sc;
     - artículos (il/lo/la/l'/i/gli/le) y preposiciones articuladas;
     - essere o avere en el passato prossimo.
4. **Recursos gratuitos y su licencia:**
   - canales de YouTube buenos para principiantes en cada idioma;
   - podcasts;
   - fotos libres;
   - frases de ejemplo (Tatoeba eng-spa y ita-spa, CC BY);
   - listas de frecuencia;
   - diccionarios abiertos (Wiktionary vía kaikki.org).

   **Comprueba la licencia de cada recurso** antes de usarlo y acredítalo en una página de "Créditos".

---

## 2. Experiencia de usuario: lo más importante

Diseña para Yolanda, una adulta que usa WhatsApp y el iPhone con normalidad pero no es experta. **Cada pantalla debe entenderse en 3 segundos.**

**Texto y botones:**
- **Texto grande:** base de 18–20 px; títulos de 28–34 px; nada por debajo de 15 px.
- **Botones enormes:** al menos 56 px de alto, a todo el ancho en móvil, en la **zona del pulgar** (mitad inferior), con iconos y texto. Nunca solo iconos.

**Navegación:**
- **Una acción principal por pantalla:** un botón grande "Continuar" o "Empezar la lección de hoy".
- **Navegación mínima**, con una barra inferior de 4 pestañas como máximo, con icono y texto. Por ejemplo: Hoy · Lecciones · Practicar · Mi progreso.
- Siempre hay un "Volver" claro. Nunca hay pantallas sin salida.

**Lenguaje y feedback:**
- **Lenguaje sencillo en español**, cercano y cariñoso, sin jerga ("FSRS", "MCER" o "flashcards" no deben aparecer en la interfaz).
  - Ejemplos: "Repasar palabras", "Tu nivel: A1, principiante".
- **Feedback positivo y explicativo:** si falla, se explica por qué con calma y se le da la respuesta. Sin vidas, sin castigos y sin cuentas atrás obligatorias.

**Audio:**
- **Botón de audio en todo** lo que esté en inglés o italiano, con velocidad normal y lenta (🐢).
- Las instrucciones de cada ejercicio se pueden escuchar en español.

**Ayuda y comodidad:**
- **Ayuda integrada:**
  - un vídeo o tutorial animado de "¿Cómo funciona?" la primera vez;
  - un botón "?" en cada tipo de ejercicio con un ejemplo resuelto.
- **Sin registro, sin contraseñas y sin anuncios.** Entra y empieza.
- **Ajustes de accesibilidad:** tamaño de letra (normal / grande / muy grande), alto contraste, reducir animaciones y velocidad de la voz.

**Pensado para iPhone en vertical:**
- `safe-area-inset` (notch y barra inferior), `100dvh`, sin scroll horizontal.
- El teclado no debe tapar los campos: usa `scrollIntoView` y un diseño que se adapte al teclado.
- Campos de respuesta con `autocapitalize="off"`, `autocorrect="off"` y `spellcheck="false"`. **Aceptar respuestas sin importar mayúsculas, tildes ni el apóstrofo tipográfico del teclado de iOS (’ frente a ').**
- **Audio en iOS:** solo se reproduce tras un toque del usuario. Desbloquea el contexto de audio en el primer toque.
- Gestos simples: tocar y deslizar entre tarjetas, sin arrastres difíciles.
  - Los ejercicios de "ordenar palabras" funcionan tocando las palabras, no arrastrándolas.
  - Se pueden deshacer.
- **En ordenador**, la interfaz es una columna central cómoda (máximo ~720 px) con ilustraciones laterales. No es una versión estirada del móvil.

---

## 3. Diseño visual: llamativo, alegre y con identidad de cada idioma

### 3.1 Elegir idioma (pantalla de inicio)
- Dos **grandes tarjetas a pantalla casi completa** (apiladas en vertical en el iPhone), cada una con su ilustración o foto, el nombre del idioma y su progreso:
  - **"English 🇬🇧"**;
  - **"Italiano 🇮🇹"**.
- Saludo personalizado: "¡Hola, Yolanda! ¿Qué idioma practicamos hoy?".
- Al tocar una tarjeta hay una transición animada al mundo de ese idioma.

### 3.2 Tema inglés: "London & beyond"
- **Paleta:** azul marino `#1D2B53`, rojo bus de Londres `#D7262E`, mostaza `#F2B33D`, verde parque `#3E7C59` y blanco roto `#FAF7F0`.
- **Motivos** (SVG propios): autobús de dos pisos, cabina telefónica, el Big Ben, el taxi negro, té con galletas, paraguas y lluvia, postales y sellos, y un guiño a otros países de habla inglesa (taxi amarillo de Nueva York, canguro, arce).
- **Estilo:** postal vintage y ticket de metro. Las tarjetas de lección son como postales y las insignias como sellos de correos.
- **Mapa del curso:** un recorrido en autobús por Londres. Cada unidad es una parada.
- **Tipografía:** gratuita (Google Fonts u OFL), con un titular expresivo (por ejemplo DM Serif Display o Fraunces) y una tipografía de interfaz muy legible (Nunito, Atkinson Hyperlegible o Inter).

### 3.3 Tema italiano: "La dolce vita"
- **Paleta:** terracota `#C8553D`, amarillo limón de Amalfi `#F4D35E`, azul Mediterráneo `#2A7DB8`, verde oliva `#7A8B3C` y crema `#FFF8EC`.
- **Motivos:** limones, azulejos de Positano o Amalfi, una Vespa, una taza de espresso, toldos de rayas, una piazza con fuente, pasta y albahaca, y siluetas de lugares famosos (Coliseo, Torre de Pisa, Venecia y góndola, Duomo de Florencia).
- **Estilo:** cartel de viaje retro italiano. Las tarjetas son como baldosas de cerámica o menús de trattoria.
- **Mapa del curso:** un viaje en tren por Italia (Roma → Florencia → Venecia → Milán → Nápoles → Sicilia…). Cada unidad es una ciudad con su foto y una curiosidad.
- **Tipografía:** un titular elegante (Playfair Display o similar) y la misma tipografía de interfaz legible.

### 3.4 Común a los dos temas
- Ilustraciones **originales** en SVG o código.
- Fotos libres (sección 5).
- Nada de personajes, logos ni mascotas con copyright.
- Si quieres una mascota, que sea original y distinta en cada idioma, y que dé ánimos y explicaciones sin ser pesada. Por ejemplo, una paloma londinense con bombín o una gaviota del Mediterráneo con gafas de sol.
- **Microanimaciones** alegres y rápidas (Motion / Framer Motion):
  - confeti suave al terminar una lección;
  - el sello que se estampa al ganar una insignia;
  - todo desactivable con "reducir animaciones" y `prefers-reduced-motion`.
- **Sonidos opcionales** suaves al acertar y al fallar (generados con Web Audio para evitar licencias), con el volumen bajo por defecto.
- **Modo oscuro** opcional. Por defecto, el modo claro.

### 3.5 Toques de regalo (importante)
- **Bienvenida de cumpleaños la primera vez:**
  - una animación con "¡Feliz cumpleaños, mamá! 🎂";
  - un mensaje mío que se pueda editar en un archivo de configuración (`content/gift.json`: texto y foto opcional que pondré en `public/gift/`);
  - después, el onboarding.
- **Onboarding** de 4 pasos:
  - nombre ("Yolanda", ya rellenado);
  - qué idioma quiere empezar;
  - cuántos minutos al día (5 / 10 / 15 / 20);
  - en inglés, una **prueba de nivel** corta y adaptativa (unos 15 ítems) para empezar en la unidad adecuada, con la opción "prefiero empezar desde el principio".
- **Certificados bonitos e imprimibles en PDF** al completar cada nivel: "Yolanda ha completado el nivel A1 de italiano".
- Una **frase del día** en cada idioma con su audio y una foto bonita.
- **Recordatorio diario sin servidor:** un botón "Añadir recordatorio a mi calendario" que descarga un `.ics` con un evento diario a la hora que elija. En el iPhone se abre directamente en Calendario.

---

## 4. Contenido y temario

### 4.1 Estructura común
- **Niveles:** A1 → A2 → B1, con unidades temáticas de 4–6 lecciones de 5–10 minutos.
- Cada unidad termina con un **repaso** y un **mini-reto** con insignia.

**Cada lección sigue siempre la misma estructura**, para que sea predecible:
1. **"Hoy vas a aprender…"**: 1 frase y una foto.
2. **Vocabulario nuevo** (6–10 palabras o expresiones) con **foto o ilustración, audio y ejemplo**.
3. **Explicación de gramática en formato "historia":**
   - pantallas verticales que se pasan tocando, como las historias de Instagram o WhatsApp;
   - cada pantalla con poco texto, una tabla o dibujo, ejemplos con audio y una voz que la lee;
   - mucho color: destaca en un color la parte que cambia ("I **am** / you **are** / she **is**").
4. **Ejercicios** (10–15, variados).
5. **Diálogo o mini-historia** con audio y preguntas.
6. **"Para la vida real":** una frase útil para viajar o para hablar con la familia.
7. **Resumen** de la lección y tarjeta-resumen descargable como imagen.

### 4.2 Inglés: con mucho énfasis en la gramática
**Temas para las unidades:**
- presentarse;
- la familia (hijos, nietos);
- la casa;
- comida y restaurantes;
- compras y ropa;
- el tiempo;
- la rutina diaria;
- aficiones;
- viajes (aeropuerto, hotel, preguntar direcciones);
- la salud y el médico;
- el teléfono y los mensajes;
- celebraciones;
- emociones;
- tecnología básica;
- vacaciones en países de habla inglesa.

**Gramática.** El orden es una propuesta; ajústalo con las fuentes de la investigación:

- **A1:**
  - verbo *to be* (afirmativa, negativa, pregunta y respuestas cortas);
  - pronombres personales;
  - posesivos (my/your… y 's);
  - artículos a/an/the;
  - plurales regulares e irregulares;
  - this/that/these/those;
  - there is / there are;
  - have got / have;
  - **presente simple** (la -s de la tercera persona, do/does, preguntas y negativas);
  - adverbios de frecuencia y su posición;
  - can / can't;
  - imperativo;
  - preposiciones de tiempo (in/on/at) y de lugar;
  - preguntas con wh- (what, where, when, who, why, how, how much/many, which);
  - **orden de la frase en inglés** frente al español.
- **A2:**
  - **presente continuo** y su diferencia con el presente simple;
  - contables e incontables (some/any, much/many, a lot of);
  - **pasado simple** (*was/were*, verbos regulares con la pronunciación de -ed, irregulares frecuentes, preguntas y negativas con did);
  - comparativos y superlativos;
  - *going to* y *will*;
  - *like / love / hate* + -ing;
  - adverbios de modo;
  - *must / have to / should*;
  - *object pronouns*;
  - *too / enough*.
- **B1:**
  - **presente perfecto** (ever/never, just/already/yet, for/since) frente al pasado simple;
  - pasado continuo;
  - *used to*;
  - primer y segundo condicional;
  - pasiva básica;
  - oraciones de relativo (who/which/that);
  - estilo indirecto (introducción);
  - phrasal verbs muy comunes;
  - question tags.

**Cada punto gramatical tiene:**
- su historia explicativa;
- una **tabla visual** (afirmativa / negativa / pregunta / respuesta corta);
- **comparación con el español** ("en español decimos…, en inglés…");
- los **errores típicos de hispanohablantes** marcados con ❌ y ✅;
- al menos **30 ejercicios propios**;
- un **"Laboratorio de gramática"** con práctica intensiva solo de ese punto.

**Pronunciación:**
- una mini-sección en cada lección: sonidos difíciles, pares mínimos (ship/sheep, live/leave), la terminación -ed, el acento de las palabras y la entonación de las preguntas;
- con audio británico y americano a elegir. Por defecto, el británico.

**Vocabulario:**
- unas 1500 palabras y expresiones al terminar el B1, organizadas por temas y frecuencia;
- primero lo que más necesitará: viajar, familia, salud, compras, restaurante.

### 4.3 Italiano: desde cero
**Unidad 0:** pronunciación y alfabeto.
- c/ci/ce, ch, g/gi/ge, gh, gl, gn y sc;
- dobles consonantes, con un audio que muestre la diferencia entre *pala* y *palla*, y *caro* y *carro*;
- el acento y cómo se lee el italiano.

**Temas para las unidades:**
- saludar y presentarse;
- en el bar: pedir un café (cultura del espresso, cappuccino solo por la mañana);
- en el restaurante;
- de compras y en el mercado;
- la familia;
- la casa;
- números, precios y horas;
- el tren y el transporte;
- el hotel;
- preguntar direcciones;
- museos y monumentos;
- el tiempo;
- la rutina;
- aficiones;
- la salud y la farmacia;
- fiestas y tradiciones italianas;
- regiones y ciudades de Italia.

**Gramática** (según el *Profilo della lingua italiana* y los sílabos PLIDA/CILS A1–B1):

- **A1:**
  - pronombres personales;
  - *essere / avere*;
  - **artículos determinados e indeterminados** (il/lo/la/l'/i/gli/le, un/uno/una/un');
  - género y número de sustantivos y adjetivos (y los que cambian respecto al español);
  - **presente de los verbos regulares** -are/-ere/-ire (incluidos los de tipo -isc-);
  - irregulares frecuentes (andare, fare, stare, venire, dare, uscire, potere, volere, dovere, sapere);
  - preposiciones simples y **articuladas** (del, al, nel…);
  - c'è / ci sono;
  - *mi piace / mi piacciono*;
  - *vorrei*;
  - posesivos (con artículo, y sin artículo con los familiares en singular: *mia madre*);
  - interrogativos (chi, che cosa, dove, quando, come, quanto, perché, quale);
  - números;
  - la hora.
- **A2:**
  - **passato prossimo** con essere o avere y la concordancia del participio;
  - verbos reflexivos;
  - imperfetto y su diferencia con el passato prossimo;
  - futuro semplice;
  - imperativo (tú y usted);
  - pronombres directos e indirectos;
  - *ci* y *ne*;
  - *stare + gerundio*;
  - comparativos y superlativos;
  - *condizionale* de cortesía.
- **B1:**
  - condizionale completo;
  - congiuntivo presente (introducción y expresiones frecuentes);
  - pronombres combinados;
  - *si* impersonal;
  - trapassato prossimo;
  - el periodo hipotético (introducción).

**Aprovechar el parecido con el español.** Cada unidad tiene:
- una sección **"Igual que en español"** (para que gane confianza);
- un **"¡Ojo! Falso amigo"**, con una ilustración divertida para cada falso amigo.

### 4.4 Calidad del contenido
- Todo el contenido debe ser **original**: no copies textos ni ejercicios de libros, webs ni apps.
- Español de España, natural y correcto.
- Inglés e italiano revisados con cuidado.
- Marca el contenido con `reviewed: false` en los JSON por si quiero revisarlo.
- Crea un script `npm run content:check` que valide:
  - que cada lección tiene la estructura completa;
  - que hay audio e imagen para cada palabra;
  - que se cumplen los mínimos de ejercicios;
  - que no hay duplicados;
  - que las respuestas son coherentes;
  - que los enlaces de YouTube son válidos (vía oEmbed).

---

## 5. Fotos, vídeos y audio

**Fotos:**
- Usa fuentes libres: **Openverse** (CC, sin clave), **Wikimedia Commons**, **Pexels** y **Unsplash**. Para Pexels y Unsplash crea un `.env.local` con claves gratuitas; si no hay claves, usa solo Openverse y Commons.
- Un script descarga las imágenes **en tiempo de construcción**. Después:
  - optimízalas a WebP/AVIF en varios tamaños;
  - guárdalas en `public/img/`, con su autor, licencia y enlace en `content/credits.json`;
  - muéstralas con `loading="lazy"` y tamaño reservado (sin saltos de diseño).
- No uses fotos de personas famosas ni de marcas.
- Para el vocabulario más abstracto, usa iconos de **OpenMoji** (CC BY-SA) o **Twemoji** (CC BY 4.0), acreditados.

**Vídeos:**
1. **Biblioteca de vídeos de YouTube** por nivel y tema, incrustados con `youtube-nocookie`, para cada idioma.
   - Ejemplos a comprobar:
     - inglés: BBC Learning English, English with Lucy, Easy English, Learn English with TV Series, Speak English with Vanessa;
     - italiano: Learn Italian with Lucrezia, Italy Made Easy, Easy Italian, Podcast Italiano, ItalianPod101.
   - **Verifica que cada vídeo existe** con el endpoint oEmbed de YouTube. **No inventes enlaces.**
   - Cada vídeo lleva una ficha con nivel, duración, de qué trata y 3 preguntas después de verlo.
2. **Vídeos explicativos propios**, en vertical 9:16 y de 1–2 minutos, para los puntos de gramática clave. Se generan con código: animación más voz.
   - Herramienta recomendada: **Remotion**, gratis para uso individual (comprueba su licencia), con voz TTS pregenerada.
   - Si no es viable, las **historias animadas** de la lección 4.1 hacen esa función.

**Audio:**
- **Pregenera el audio** de palabras, frases y diálogos con **edge-tts / msedge-tts** (gratis):
  - varias voces por idioma (hombre y mujer; británica y americana para el inglés; italiana estándar);
  - a velocidad normal y lenta;
  - con caché por hash.
- Si un audio falta, recurre a la Web Speech API. En el iPhone usa las voces de calidad de iOS cuando estén instaladas, y explica en Ajustes cómo descargar las voces "mejoradas".

---

## 6. Ejercicios: muchos y variados (estilo Duolingo / Babbel, pero más claros)

**Mínimos:**

| Qué | Cantidad mínima |
|---|---|
| Ejercicios por unidad | **120** |
| Ejercicios por punto gramatical | **30** |
| Tipos distintos de ejercicio | **15**, usados de forma intercalada |

**Tipos de ejercicio:**
1. Ver una foto → elegir la palabra (con audio).
2. Escuchar → elegir la foto.
3. Escuchar → elegir la frase escrita.
4. Elegir la traducción (español → idioma e idioma → español).
5. **Ordenar la frase tocando palabras** (sin arrastrar).
6. Completar el hueco (con banco de palabras o escribiendo).
7. **Conjugar el verbo** (con la tabla de ayuda opcional).
8. Elegir la forma correcta (a/an, some/any, il/lo/la, essere/avere…).
9. **Corregir el error** ("Encuentra la palabra que está mal").
10. Transformar la frase (afirmativa → negativa → pregunta; presente → pasado).
11. Escribir la traducción (corrección flexible: acepta variantes, ignora mayúsculas y tildes, y señala la diferencia exacta).
12. **Dictado:** escuchar y escribir.
13. **Comprensión oral:** un diálogo con preguntas.
14. **Lectura:** un texto corto (menú, mensaje, cartel, email) con preguntas.
15. Emparejar parejas (palabra–foto, palabra–traducción, pregunta–respuesta).
16. **Pronunciación:**
    - escuchar y repetir;
    - pares mínimos (¿cuál has oído?);
    - **hablar**: decir la frase y que se compruebe con reconocimiento de voz (sección 7).
17. **Situaciones de la vida real:** "Estás en un bar de Roma y quieres un café con leche. ¿Qué dices?".
18. **Mini-conversación:** responder por turnos a un personaje con opciones o hablando.

**Cómo funcionan:**
- **Corrección explicada:** cada fallo muestra la respuesta correcta, por qué y, si es gramática, un enlace a la historia de ese punto.
- **Repaso inteligente:**
  - usa **FSRS** (`ts-fsrs`) para programar el repaso de palabras y estructuras;
  - las palabras falladas vuelven antes;
  - en la interfaz se llama "Repasar" y "Palabras que se te resisten".
- **Sesión de práctica rápida de 5 minutos** con lo que toque repasar.
- **Mis palabras favoritas:** con un ⭐ guarda palabras para repasarlas. No es un apartado de apuntes, solo una lista.

---

## 7. Hablar y escuchar en el iPhone

- **Reconocimiento de voz:**
  - usa la Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`) con `en-GB`/`en-US`/`it-IT`;
  - **comprueba si la función existe antes de usarla**: en iOS Safari funciona, pero en la web instalada en la pantalla de inicio el soporte ha variado. **Pruébalo en un iPhone real** y documenta el resultado;
  - si no está disponible, el ejercicio pasa a "escucha, repite en voz alta y autoevalúate (bien / regular / repetir)", grabando su voz con `MediaRecorder` para que se compare con el modelo;
  - el reconocimiento tiende a "corregir" lo que oye, así que la valoración es orientativa y amable.
- **Permiso del micrófono:** pídelo solo cuando haga falta, con una pantalla previa que explique en español por qué.

---

## 8. Conversación con un personaje (opcional, gratis)

- **"Charla con Emma"** (inglés) y **"Charla con Giulia"** (italiano): diálogos ramificados escritos a mano, al menos 3 por unidad, en los que contesta eligiendo opciones o hablando.
- **Opción avanzada desactivada por defecto:** un tutor de IA conectado a un proveedor con nivel gratuito (por ejemplo, la API de Gemini) que configuraré yo desde el "Modo Hugo" (sección 10).
  - Habla a su nivel, en frases cortas.
  - Corrige con cariño y da la traducción al tocar.
  - Muestra los límites y condiciones del proveedor; no los dejes fijos en el código.
  - La web debe funcionar perfectamente sin él.

---

## 9. Técnica, publicación y datos

**Stack:**
- Vite + React + TypeScript, o Next.js con exportación estática. Elige el que mejor genere un **sitio 100 % estático**.
- Tailwind, Motion y `ts-fsrs`.
- Dexie (IndexedDB) para el progreso.
- PWA con service worker (funciona sin conexión una vez cargada).

**Publicación gratis en GitHub Pages** (o Cloudflare Pages):
- una URL fácil de abrir en su iPhone;
- un **código QR** imprimible para regalárselo en una tarjeta, en `docs/QR.png` y en una página imprimible "Tarjeta regalo";
- una guía paso a paso de cómo publicarla en `README.md`.

**Instalación en el iPhone:**
- Pantalla "Añadir a la pantalla de inicio" con capturas o una animación de los pasos en Safari (Compartir → Añadir a pantalla de inicio).
- Icono bonito de la app, pantalla de arranque y `apple-touch-icon`.
- Modo standalone a pantalla completa.

**Proteger el progreso:**
- Safari puede borrar los datos de una web que no se usa durante unos días; **la web instalada en la pantalla de inicio está mucho más protegida**.
- Pide almacenamiento persistente (`navigator.storage.persist()`).
- Recuérdale amablemente instalarla.
- Ofrece **"Guardar copia de mi progreso"** (descarga un archivo, o lo comparte por AirDrop o WhatsApp con la Web Share API) y **"Recuperar copia"**.
- **Opcional, desactivado por defecto:** sincronización en la nube con un servicio gratuito (Supabase o Firebase, nivel gratuito) para no perder nada si cambia de móvil y para que yo pueda ver su progreso. Si lo implementas, que sea con un código de enlace sencillo y sin contraseñas complicadas.

**Rendimiento:**
- Carga rápida en 4G: LCP < 2,5 s.
- Imágenes y vídeos con carga diferida.
- Audio descargado por unidad.

---

## 10. "Modo Hugo" (oculto)

Se accede tocando 5 veces el logo y metiendo un PIN que se configura en `content/gift.json`. Desde ahí puedo:
- editar el mensaje de cumpleaños;
- ver su progreso;
- desbloquear unidades;
- activar el tutor de IA con una clave;
- exportar los datos;
- reiniciar.

Yolanda nunca lo ve.

---

## 11. Proceso de trabajo y verificación

1. Investigación (sección 1) → `docs/INVESTIGACION.md` y `docs/TEMARIO.md` (temario completo de los dos idiomas, con su justificación).
2. Diseño: guía de estilo viva en `/design` con los dos temas, los componentes y los estados. Revisa en capturas de iPhone (390×844 y 430×932) y de escritorio, en claro y oscuro.
3. Núcleo: idiomas, navegación, motor de ejercicios, audio, FSRS, PWA y datos.
4. Contenido del **italiano A1** e **inglés A1–A2** completos (con prioridad), y después el A2/B1 de cada uno.
5. Fotos, vídeos (biblioteca y explicativos propios) y audio pregenerado.
6. Toques de regalo, onboarding, prueba de nivel y certificados.
7. Publicación, QR y guía de instalación.
8. **Verificación:**
   - **Pruebas en móvil:** emula iPhone en Playwright (WebKit y viewport de iPhone) y recorre los flujos principales:
     - primera entrada y felicitación;
     - elegir idioma;
     - hacer una lección completa;
     - repasar;
     - cambiar de idioma;
     - guardar copia.
   - **Bucle de autocrítica visual:** haz capturas de cada pantalla, míralas, puntúa de 1 a 10 la claridad, el tamaño, lo llamativo y la coherencia con el tema, y corrige todo lo que puntúe por debajo de 9.
   - **Accesibilidad:** contraste AA, tamaños táctiles, `lang="en"`/`lang="it"` en el texto de cada idioma y VoiceOver básico.
   - Tests del motor de ejercicios, la corrección flexible, FSRS y la copia de seguridad.
   - Lighthouse ≥ 90 en móvil.
   - `typecheck`, `lint` y tests en verde.
9. **Resumen final para mí:**
   - URL publicada y QR;
   - cómo instalarla en su iPhone;
   - cómo editar el mensaje de regalo;
   - qué contenido conviene revisar;
   - limitaciones (por ejemplo, la voz en iOS).

Si algo no se puede hacer gratis o no se puede verificar, **dímelo y propón la mejor alternativa gratuita**. No lo omitas ni lo inventes.

¡Gracias! Quiero que sea un regalo del que esté orgullosa y que use de verdad cada día.
