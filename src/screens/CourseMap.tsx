import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Lock } from 'lucide-react';
import type { Lang, Level, Unit } from '@/content/types';
import { LEVEL_LABEL, units } from '@/content/load';
import { levelFraction, nextLesson, unitDone, unitFraction, unitOpen, useProgress, type ProgressMap } from '@/data/progress';
import { Emoji, Page, ProgressBar, cn } from '@/ui/primitives';
import { Loading, useLang } from '@/ui/Loading';
import { Bus } from '@/art/en';

/** Mapa del curso: un recorrido en autobús por Londres o un viaje en tren por Italia. */
export default function CourseMap() {
  const lang = useLang();
  const p = useProgress(lang);
  const nav = useNavigate();
  const currentRef = useRef<HTMLButtonElement>(null);
  const list = units(lang);
  const levels = [...new Set(list.map((u) => u.level))] as Level[];
  const cur = p ? nextLesson(lang, p)?.unit.id : undefined;

  useEffect(() => {
    if (cur) setTimeout(() => currentRef.current?.scrollIntoView({ block: 'center' }), 150);
  }, [cur]);

  if (!p) return <Loading />;
  return (
    <Page className="safe-top">
      <h1 className="font-display pt-5 text-[2rem] leading-tight">{lang === 'en' ? 'Tu ruta por Londres y más allá' : 'Tu viaje en tren por Italia'}</h1>
      <p className="mt-1 text-lg text-ink-soft">
        {lang === 'en' ? 'Cada unidad es una parada del autobús.' : 'Cada unidad es una ciudad.'} <Emoji e={lang === 'en' ? '🚌' : '🚆'} size={26} />
      </p>
      {levels.map((lv) => (
        <section key={lv} className="mt-6">
          <div className="sticky top-0 z-10 -mx-4 bg-bg/95 px-4 py-2 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-[1.5rem]">{LEVEL_LABEL[lv]}</h2>
              <span className="text-base font-bold text-ink-soft">{Math.round(levelFraction(lang, lv, p) * 100)} %</span>
            </div>
            <ProgressBar value={levelFraction(lang, lv, p)} className="h-2.5" label={`Progreso del nivel ${lv}`} />
          </div>
          <ol className="relative mt-3 space-y-4 pl-10">
            <span aria-hidden className={cn('absolute top-2 bottom-2 left-[18px] w-2 rounded-full', lang === 'en' ? 'bg-[repeating-linear-gradient(180deg,rgb(var(--primary))_0_14px,transparent_14px_24px)]' : 'bg-[repeating-linear-gradient(180deg,#7a5a48_0_6px,transparent_6px_14px)]')} />
            {list
              .filter((u) => u.level === lv)
              .map((u) => (
                <li key={u.id}>
                  <Stop u={u} lang={lang} p={p} current={u.id === cur} refEl={u.id === cur ? currentRef : undefined} onOpen={() => nav(`/${lang}/unidad/${u.id}`)} />
                </li>
              ))}
          </ol>
        </section>
      ))}
    </Page>
  );
}

function Stop({ u, lang, p, current, onOpen, refEl }: { u: Unit; lang: Lang; p: ProgressMap; current: boolean; onOpen: () => void; refEl?: React.Ref<HTMLButtonElement> }) {
  const done = unitDone(u, p);
  const open = unitOpen(lang, u, p);
  const frac = unitFraction(u, p);
  return (
    <button ref={refEl} onClick={onOpen} className={cn('postcard relative flex w-full items-center gap-3 p-4 text-left active:translate-y-[2px]', current && 'ring-4 ring-pop', !open && 'opacity-75')}>
      <span
        aria-hidden
        className={cn(
          'absolute top-1/2 -left-[36px] grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border-4 text-sm font-extrabold',
          done ? 'border-good bg-good text-white' : current ? 'border-pop bg-surface' : 'border-line bg-surface',
        )}
      >
        {done ? <Check size={18} /> : !open ? <Lock size={14} /> : u.n}
      </span>
      {current && lang === 'en' && <Bus className="absolute -top-7 -left-12 w-16" aria-hidden />}
      {current && lang === 'it' && (
        <span aria-hidden className="absolute -top-6 -left-12"><Emoji e="🚆" size={34} /></span>
      )}
      <Emoji e={u.emoji} size={52} />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-extrabold tracking-wide text-primary uppercase">{u.stop.name}</span>
        <span className="block text-[1.2rem] leading-tight font-extrabold">{u.title}</span>
        {frac > 0 && !done && <ProgressBar value={frac} className="mt-2 h-2.5" label={`Unidad ${u.n}`} />}
        {current && <span className="mt-1 block text-base font-bold text-ink-soft">Estás aquí</span>}
      </span>
    </button>
  );
}
