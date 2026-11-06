import { useEffect, useState } from 'react';
import type { PhotoCredit } from '@/content/types';
import { loadCredits } from '@/content/load';
import { Page, SectionTitle, TopBar } from '@/ui/primitives';

const SOFTWARE = [
  ['React, Vite, Tailwind CSS, Motion, Dexie, ts-fsrs, Lucide', 'MIT / ISC', 'https://github.com/open-spaced-repetition/ts-fsrs'],
  ['Twemoji (iconos)', 'CC BY 4.0 · © Twitter, Inc. y colaboradores (jdecked/twemoji)', 'https://github.com/jdecked/twemoji'],
  ['Tipografías Nunito, DM Serif Display, Playfair Display', 'SIL Open Font License 1.1', 'https://fonts.google.com'],
  ['Voces generadas con Microsoft Edge TTS (msedge-tts)', 'Audio sintético pregenerado', 'https://github.com/Migushthe2nd/MsEdgeTTS'],
  ['Vídeos de YouTube incrustados (youtube-nocookie)', '© de sus autores; no se copian, solo se enlazan', 'https://www.youtube.com'],
];

export default function Credits() {
  const [photos, setPhotos] = useState<PhotoCredit[]>([]);
  useEffect(() => {
    void loadCredits().then((m) => setPhotos([...m.values()]));
  }, []);
  return (
    <div className="min-h-dvh">
      <TopBar title="Créditos" />
      <Page nav={false}>
        <p className="mt-2 text-lg">
          Hecha con cariño por Hugo para Yolanda. Todos los textos, ejercicios e ilustraciones son originales. Estos son los recursos libres que se usan, con su licencia:
        </p>
        <SectionTitle>Programas, iconos y voces</SectionTitle>
        <ul className="space-y-3">
          {SOFTWARE.map(([n, l, u]) => (
            <li key={n} className="postcard p-3 text-base">
              <a href={u} target="_blank" rel="noreferrer" className="font-extrabold underline">
                {n}
              </a>
              <span className="block text-ink-soft">{l}</span>
            </li>
          ))}
        </ul>
        <SectionTitle>Fotografías ({photos.length})</SectionTitle>
        {photos.length === 0 && <p className="text-base text-ink-soft">Sin fotografías externas.</p>}
        <ul className="space-y-2 text-base">
          {photos.map((p) => (
            <li key={p.key} className="border-b border-line pb-2">
              <a href={p.source} target="_blank" rel="noreferrer" className="font-bold underline">
                {p.title || p.key}
              </a>{' '}
              — {p.author} ·{' '}
              {p.licenseUrl ? (
                <a href={p.licenseUrl} target="_blank" rel="noreferrer" className="underline">
                  {p.license}
                </a>
              ) : (
                p.license
              )}
            </li>
          ))}
        </ul>
      </Page>
    </div>
  );
}
