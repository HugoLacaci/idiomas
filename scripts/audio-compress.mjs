// npm run audio:compress — recomprime los MP3 de Edge (48 kbps) a 32 kbps mono con ffmpeg-static
// para que el sitio quepa holgadamente en GitHub Pages. Solo toca los que aún no están comprimidos.
import { readdirSync, statSync, readFileSync, renameSync, unlinkSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import ffmpeg from 'ffmpeg-static';

const run = promisify(execFile);
const ROOT = 'public/audio';

/** Bitrate (kbps) de la primera trama MPEG del archivo. */
function bitrate(buf) {
  let i = 0;
  if (buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33) i = 10 + ((buf[6] << 21) | (buf[7] << 14) | (buf[8] << 7) | buf[9]);
  for (; i < buf.length - 3; i++) {
    if (buf[i] === 0xff && (buf[i + 1] & 0xe0) === 0xe0) {
      const version = (buf[i + 1] >> 3) & 3; // 3 = MPEG1, 2 = MPEG2, 0 = MPEG2.5
      const idx = buf[i + 2] >> 4;
      const v1 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
      const v2 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];
      return (version === 3 ? v1 : v2)[idx] ?? 0;
    }
  }
  return 0;
}

const files = [];
for (const v of readdirSync(ROOT)) {
  if (!statSync(`${ROOT}/${v}`).isDirectory()) continue;
  for (const f of readdirSync(`${ROOT}/${v}`)) if (f.endsWith('.mp3')) files.push(`${ROOT}/${v}/${f}`);
}
const todo = files.filter((f) => bitrate(readFileSync(f)) > 32);
console.log(`Audios: ${files.length}; por comprimir: ${todo.length}`);
let done = 0;
let before = 0;
let after = 0;
await Promise.all(
  Array.from({ length: 8 }, async () => {
    while (todo.length) {
      const f = todo.pop();
      const tmp = f.replace(/\.mp3$/, '.tmp.mp3');
      try {
        before += statSync(f).size;
        await run(ffmpeg, ['-y', '-loglevel', 'error', '-i', f, '-ac', '1', '-ar', '22050', '-b:a', '32k', '-map_metadata', '-1', tmp]);
        if (statSync(tmp).size > 300) {
          after += statSync(tmp).size;
          renameSync(tmp, f);
        } else unlinkSync(tmp);
      } catch (e) {
        console.log('error', f, e.message);
      }
      if (++done % 1000 === 0) console.log(`  ${done}`);
    }
  }),
);
console.log(`Comprimidos ${done}: ${(before / 1e6).toFixed(0)} MB → ${(after / 1e6).toFixed(0)} MB`);
