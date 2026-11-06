# Idiomas de Yolanda 🇬🇧🇮🇹

Web gratuita para aprender **inglés** (A1 → B1, con mucha gramática) e **italiano** (desde cero hasta B1),
pensada para Yolanda y para usarse sobre todo en su iPhone. Es un regalo de cumpleaños.

- Sin registro, sin anuncios, sin servidor: todo el progreso se guarda en el propio teléfono (IndexedDB).
- Funciona sin conexión una vez cargada (PWA) y se instala en la pantalla de inicio.
- Lecciones cortas con siempre la misma estructura, explicaciones de gramática en formato «historia»,
  18 tipos de ejercicio, audio de todo, repaso inteligente (FSRS), charlas con Emma y Giulia, vídeos,
  certificados y un Modo Hugo oculto.

Documentación: [docs/INVESTIGACION.md](docs/INVESTIGACION.md) (fuentes y decisiones), [docs/TEMARIO.md](docs/TEMARIO.md)
(temario completo), [docs/CONTENIDO.md](docs/CONTENIDO.md) (formato del contenido), [docs/VERIFICACION.md](docs/VERIFICACION.md)
(pruebas y resultados).

## Puesta en marcha

Requisitos: Node 22 o superior.

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # pruebas del motor (corrección flexible, repaso, copia de seguridad…)
npm run content:check  # valida todo el contenido
npm run build        # genera dist/ (sitio 100 % estático)
```

### Scripts de contenido y recursos

| Comando | Qué hace |
|---|---|
| `npm run units` | Regenera `content/<idioma>/units.json` desde las tablas de `docs/TEMARIO.md` |
| `npm run content:check [-- --only it-a1-u02 --audio --videos]` | Valida estructura, mínimos de ejercicios, duplicados, coherencia de respuestas, audio y vídeos (oEmbed) |
| `npm run content:index` | Genera el índice ligero que usa la app (se ejecuta solo en `build`) |
| `npm run audio` | Pregenera el audio con voces neuronales de Edge (gratis), con caché por hash en `public/audio/` |
| `npm run photos` | Descarga y optimiza fotos libres (Openverse / Wikimedia Commons; Pexels si hay clave) y escribe `content/credits.json` |
| `npm run emoji` | Descarga los iconos Twemoji usados a `public/img/emoji/` |
| `npm run icons` | Genera el icono de la app (favicon, apple-touch-icon, PWA) |
| `npm run qr -- <url>` | Genera el QR de la web (`public/qr.svg` y `docs/QR.png`) |

Claves opcionales en `.env.local` (no se suben a git): `PEXELS_API_KEY=…`. Sin claves se usan Openverse y Commons.

## Cómo editar el mensaje de regalo

Edita **`content/gift.json`**:

```json
{
  "title": "¡Feliz cumpleaños, mamá! 🎂",
  "message": "Tu mensaje…",
  "signature": "Hugo",
  "photo": "foto.jpg",
  "pin": "2580",
  "url": "https://<tu-usuario>.github.io/<repo>/"
}
```

- `photo`: pon la foto en `public/gift/foto.jpg` y escribe aquí solo el nombre (vacío = sin foto).
- `pin`: PIN del **Modo Hugo** (se abre tocando 5 veces seguidas el logo de la pantalla de inicio o de Ajustes).
- `url`: dirección publicada (la usa la tarjeta regalo y `npm run qr`).

Desde el Modo Hugo también puedes cambiar el mensaje solo en su teléfono, ver su progreso, desbloquear unidades,
activar el tutor de IA, exportar los datos y reiniciar.

## Publicar gratis en GitHub Pages (paso a paso)

1. Crea un repositorio en GitHub (por ejemplo `idiomas`). Con la cuenta gratuita, Pages necesita que sea **público**
   (el contenido no tiene datos personales salvo el mensaje de `gift.json`; revísalo antes).
2. Sube el proyecto:
   ```bash
   git remote add origin https://github.com/<usuario>/<repo>.git
   git push -u origin main
   ```
3. En GitHub: **Settings › Pages › Build and deployment › Source: GitHub Actions**.
4. Cada `git push` a `main` ejecuta `.github/workflows/pages.yml`: tests, validación del contenido, build y publicación.
   Tarda unos 2 minutos. La web queda en `https://<usuario>.github.io/<repo>/`.
5. Pon esa URL en `content/gift.json` (`url`), ejecuta `npm run qr` y vuelve a hacer push. La tarjeta imprimible
   está en la ruta `#/tarjeta-regalo` y el QR en `docs/QR.png`.

La app usa rutas con `#` (HashRouter) y rutas relativas, así que funciona en cualquier subcarpeta sin configurar nada.

## Instalarla en el iPhone de Yolanda

1. Abre la URL (o escanea el QR) **en Safari**.
2. Toca **Compartir** (cuadrado con flecha) › **Añadir a pantalla de inicio** › **Añadir**.
3. Ábrela desde el icono. La primera vez verá la felicitación y una bienvenida de 4 pasos.

Instalada, Safari protege mucho mejor sus datos (una web no instalada puede perder lo guardado si no se usa en
unos días). Además, en *Mi progreso › Guardar copia de mi progreso* puede mandarse una copia por WhatsApp o AirDrop.

## Estructura

```
content/            contenido (JSON): gift, unidades, lecciones, gramática, charlas, vídeos, frases del día
src/engine/         motor: corrección flexible, sesiones de ejercicios, repaso FSRS
src/exercises/      los 18 tipos de ejercicio
src/screens/        pantallas
src/audio/          voz (audio pregenerado + Web Speech), reconocimiento de voz, sonidos Web Audio
src/data/           IndexedDB (Dexie), ajustes, copia de seguridad, recordatorio .ics
src/art/            ilustraciones SVG propias (Londres e Italia) y mascotas (Percy y Lina)
scripts/            validador y generadores (audio, fotos, emoji, iconos, QR, capturas)
```
