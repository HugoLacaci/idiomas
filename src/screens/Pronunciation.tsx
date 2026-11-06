import { useEffect, useMemo, useState } from 'react';
import type { Pronunciation as Pron } from '@/content/types';
import { loadIndex, loadLesson, units } from '@/content/load';
import { rng, shuffle, type Exercise } from '@/engine/session';
import { useProgress } from '@/data/progress';
import { Runner } from '@/exercises/Runner';
import { AudioButtons, Button, Page, Rich, TopBar } from '@/ui/primitives';
import { Loading, useLang } from '@/ui/Loading';

/** Pronunciación: todas las mini-secciones de las lecciones y una práctica de pares mínimos. */
export default function Pronunciation() {
  const lang = useLang();
  const p = useProgress(lang);
  const [prons, setProns] = useState<(Pron & { lesson: string })[] | null>(null);
  const [drill, setDrill] = useState<Exercise[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      await loadIndex(lang);
      const ids = units(lang).flatMap((u) => u.lessons);
      const out: (Pron & { lesson: string })[] = [];
      for (const id of ids) {
        const l = await loadLesson(lang, id);
        if (l?.pron) out.push({ ...l.pron, lesson: id });
      }
      setProns(out);
    })();
  }, [lang]);

  const pairs = useMemo(() => (prons ?? []).flatMap((x) => x.pairs ?? []), [prons]);
  if (!prons || !p) return <Loading />;
  if (drill) return <Runner exercises={drill} lang={lang} onExit={() => setDrill(null)} onFinish={() => setDrill(null)} />;

  const startDrill = () => {
    const rand = rng(Date.now() & 0xffff);
    const ex: Exercise[] = shuffle(pairs, rand)
      .slice(0, 12)
      .map(([a, b], i) => ({ id: `mp${i}`, type: 'minimal', pair: [a, b], answer: rand() < 0.5 ? a : b }));
    const speak: Exercise[] = shuffle(prons.flatMap((x) => x.words ?? []), rand)
      .slice(0, 4)
      .map((w, i) => ({ id: `sp${i}`, type: 'speak', t: w, es: '' }));
    setDrill([...ex, ...speak]);
  };
  const done = prons.filter((x) => p.get(x.lesson)?.done);
  const list = done.length ? done : prons.slice(0, 3);

  return (
    <div className="min-h-dvh">
      <TopBar title="Pronunciación" />
      <Page nav={false}>
        {pairs.length >= 4 && (
          <div className="mt-2">
            <Button onClick={startDrill}>Practicar: ¿cuál has oído?</Button>
          </div>
        )}
        <p className="mt-4 text-base text-ink-soft">{done.length ? 'Los sonidos de las lecciones que ya has hecho:' : 'Para empezar, estos sonidos:'}</p>
        <div className="mt-3 space-y-3">
          {list.map((x) => (
            <div key={x.lesson} className="postcard p-4">
              <button className="min-h-[44px] w-full text-left text-[1.2rem] font-extrabold" onClick={() => setOpen(open === x.lesson ? null : x.lesson)} aria-expanded={open === x.lesson}>
                👄 {x.title}
              </button>
              {open === x.lesson && (
                <div className="mt-2 space-y-3">
                  <p className="text-lg">
                    <Rich text={x.tip} />
                  </p>
                  {(x.words ?? []).map((w) => (
                    <div key={w} className="flex items-center justify-between gap-2">
                      <span className="text-[1.2rem] font-bold" lang={lang}>{w}</span>
                      <AudioButtons text={w} lang={lang} size="sm" />
                    </div>
                  ))}
                  {(x.pairs ?? []).map(([a, b]) => (
                    <div key={a + b} className="grid grid-cols-2 gap-2">
                      {[a, b].map((w) => (
                        <div key={w} className="ticket flex items-center justify-between p-2">
                          <span className="font-bold" lang={lang}>{w}</span>
                          <AudioButtons text={w} lang={lang} size="sm" slow={false} />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Page>
    </div>
  );
}
