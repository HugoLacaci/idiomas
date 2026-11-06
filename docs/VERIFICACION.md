# Verificación

Estado a 6-nov-2026.

## Resultados

| Comprobación | Resultado |
|---|---|
| `npm run typecheck` (TypeScript) | ✅ sin errores |
| `npm run lint` (oxlint) | ✅ 0 errores (quedan avisos de estilo de React: fast-refresh, setState en efectos) |
| `npm test` (Vitest) | ✅ 26 tests: corrección flexible (mayúsculas, tildes, apóstrofo de iOS, contracciones, diferencias palabra a palabra), «encontrar el error», motor de sesiones, repaso FSRS, copia de seguridad (exportar/importar/validar), recordatorio `.ics`, racha |
| `npm run content:check -- --strict` | ✅ 0 errores (5 avisos de vocabulario repetido entre unidades, sin efecto) |
| `content:check -- --videos` | ✅ 69 vídeos verificados con el oEmbed de YouTube |
| E2E Playwright, iPhone 13 emulado (WebKit) | ✅ 3/3 |
| E2E Playwright, escritorio (Chromium) | ✅ 3/3 |
| Lighthouse móvil (build, `vite preview`) | Rendimiento **92** · Accesibilidad **100** · Buenas prácticas **100** · SEO **100** |

### Pruebas E2E (`e2e/flows.spec.ts`, contra la build)

1. Primera entrada: felicitación → bienvenida en 4 pasos (nombre ya rellenado, idioma, minutos, tutorial) → Hoy →
   **lección completa** (intro, vocabulario, historia de gramática, pronunciación, ejercicios, diálogo, vida real, final) →
   **repasar** → **cambiar de idioma** (el italiano conserva su progreso) → **guardar copia** (descarga del JSON).
2. Las 19 pantallas principales cargan sin errores de JavaScript y **sin scroll horizontal**.
3. En «Hoy», todos los botones con texto miden ≥ 44 px de alto y ningún texto baja de 15 px.

### Lighthouse

LCP 2,7 s y FCP 2,6 s con la simulación de 4G lento de Lighthouse (1,6 Mbps, 150 ms de latencia). El objetivo era
< 2,5 s: en 4G real debería cumplirse, pero con esa simulación queda 0,2 s por encima. TBT 0 ms y CLS 0.

## Contenido

| | Unidades | Lecciones | Puntos de gramática | Palabras y expresiones | Charlas | Vídeos | Frases del día |
|---|---|---|---|---|---|---|---|
| Inglés | 30 (A1 12, A2 10, B1 8) | 150 | 59 | 1 296 | 90 | 35 | 60 |
| Italiano | 31 (A0 1, A1 12, A2 10, B1 8) | 156 | 58 | 1 380 | 93 | 34 | 60 |

- 8 925 ejercicios escritos a mano; ninguna unidad baja de 120, y ningún punto de gramática de 30.
  A eso se suman los ejercicios que se generan del vocabulario (foto→palabra, escuchar→dibujo, dictado, parejas…).
- El inglés tiene unas 1 300 palabras y expresiones, algo por debajo de las ~1 500 que se pedían.
- Todo el contenido lleva `reviewed: false`.

## Autocrítica visual

Capturas en iPhone (390×844 y 430×932) y escritorio, en claro y oscuro, de: inicio, regalo, bienvenida, Hoy, mapa,
unidad, lección completa (cada paso), feedback de acierto y fallo, historia de gramática, practicar, progreso,
ajustes, vídeos, charlas y guía de estilo. Corregido durante el proceso:

- Las banderas salían como letras («GB») en algunos sistemas → iconos Twemoji.
- Ilustraciones de las tarjetas de idioma montadas sobre el texto → recolocadas.
- Botones con texto partido en dos líneas → textos más cortos.
- «Escucha y elige el dibujo» con palabras abstractas (también ➕, ¿dónde? 📍) → ahora solo sustantivos.
- Textos de la historia de gramática centrados → alineados a la izquierda.
- Créditos de las fotos a 11 px → 15 px.

## Accesibilidad

- `lang="en"` / `lang="it"` en todo el texto en el idioma que se aprende (`T`, atributos `lang` en opciones, diálogos, tarjetas).
- Contraste AA: la terracota se oscureció (#B84A34) para texto blanco, igual que el verde y el azul. Lighthouse da 100 en accesibilidad.
- Todos los botones de solo icono tienen `aria-label`; la barra de progreso tiene `role="progressbar"`, y la corrección se anuncia con `aria-live`.
- Ajustes: tres tamaños de letra, alto contraste, modo oscuro, reducir animaciones (también respeta `prefers-reduced-motion`) y velocidad de la voz.

## No verificado

- **iPhone real**: no hay ninguno disponible en esta máquina. Hay que probar en el de Yolanda:
  - el reconocimiento de voz (`webkitSpeechRecognition`), sobre todo con la web instalada en la pantalla de inicio. La investigación indica que el soporte ha variado;
  - que el `.ics` se abra en Calendario;
  - compartir la copia por AirDrop o WhatsApp.

  Si el reconocimiento de voz no funciona, la app pasa sola a «grabarse y comparar» o a «autoevaluarse».
- **VoiceOver**: solo se ha revisado lo básico por código (etiquetas y roles); falta probarlo con el lector real.
- **Audio**: se ha comprobado que las 7 voces de Edge funcionan y que los clips se generan y se reproducen. No se han escuchado los ~29 000 uno a uno.
- **Vídeos**: las 3 preguntas de cada uno se escribieron a partir del título y la descripción, sin ver el vídeo.
- **Remotion**: no se han hecho vídeos explicativos propios. Las historias animadas de gramática cumplen esa función,
  como permitía el encargo.
- **Sincronización en la nube** (opcional): no está implementada; la copia de seguridad en archivo cubre el cambio de móvil.
