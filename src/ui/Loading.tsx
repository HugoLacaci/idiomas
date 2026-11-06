import { useParams } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Percy } from '@/art/en';
import { Lina } from '@/art/it';
import type { Lang } from '@/content/types';
import { cn } from './primitives';

export function Loading({ text = 'Un momento…' }: { text?: string }) {
  return (
    <div className="grid min-h-[60dvh] place-items-center p-8 text-center" role="status" aria-live="polite">
      <div>
        <div className="mx-auto h-14 w-14 animate-spin rounded-full border-[6px] border-line border-t-primary" />
        <p className="mt-4 text-lg font-bold text-ink-soft">{text}</p>
      </div>
    </div>
  );
}

export function useLang(): Lang {
  const { lang } = useParams();
  return lang === 'it' ? 'it' : 'en';
}

/** La mascota del idioma: Percy (paloma con bombín) o Lina (gaviota con gafas). */
export function Mascot({ lang, mood = 'happy', size = 88 }: { lang: Lang; mood?: 'happy' | 'think' | 'cheer'; size?: number }) {
  return lang === 'en' ? <Percy mood={mood} size={size} /> : <Lina mood={mood} size={size} />;
}

/** Bocadillo de la mascota con un mensaje breve. */
export function MascotTip({ lang, children, mood = 'happy', className }: { lang: Lang; children: ReactNode; mood?: 'happy' | 'think' | 'cheer'; className?: string }) {
  return (
    <div className={cn('flex items-end gap-2', className)}>
      <div className="shrink-0">
        <Mascot lang={lang} mood={mood} size={72} />
      </div>
      <div className="relative mb-4 flex-1 rounded-2xl border-2 border-line bg-surface p-3 text-base font-semibold">
        <span className="absolute bottom-3 -left-2 h-4 w-4 rotate-45 border-b-2 border-l-2 border-line bg-surface" aria-hidden />
        {children}
      </div>
    </div>
  );
}
