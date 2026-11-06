import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BookOpen, FlaskConical } from 'lucide-react';
import type { GrammarPoint } from '@/content/types';
import { loadGrammar } from '@/content/load';
import { rng, seedFrom, shuffle } from '@/engine/session';
import { addCards } from '@/engine/srs';
import { Runner, type RunStats } from '@/exercises/Runner';
import { Button, Page, Rich, TopBar } from '@/ui/primitives';
import { Loading, Mascot, useLang } from '@/ui/Loading';
import { StoryViewer } from './GrammarStory';
import { Confetti } from '@/ui/Confetti';

/** Laboratorio de gramática: práctica intensiva de un solo punto, en tandas de 10. */
export default function GrammarLab() {
  const lang = useLang();
  const { gid } = useParams();
  const nav = useNavigate();
  const [g, setG] = useState<GrammarPoint | null | undefined>(undefined);
  const [round, setRound] = useState<number | null>(null);
  const [story, setStory] = useState(false);
  const [stats, setStats] = useState<RunStats | null>(null);

  useEffect(() => {
    void loadGrammar(lang, gid!).then(setG);
  }, [lang, gid]);

  const batches = useMemo(() => {
    if (!g) return [];
    const all = shuffle(g.exercises, rng(seedFrom(g.id + new Date().toDateString())));
    const out = [];
    for (let i = 0; i < all.length; i += 10) out.push(all.slice(i, i + 10));
    return out;
  }, [g]);

  if (g === undefined) return <Loading />;
  if (!g)
    return (
      <div className="min-h-dvh">
        <TopBar title="Laboratorio" />
        <p className="p-6 text-center text-lg">Este laboratorio todavía no está listo.</p>
      </div>
    );

  if (round !== null && !stats)
    return (
      <Runner
        exercises={batches[round]}
        lang={lang}
        onExit={() => setRound(null)}
        onFinish={(s) => {
          setStats(s);
          void addCards(lang, 'g', [g.id]);
        }}
      />
    );

  return (
    <div className="min-h-dvh">
      {stats && stats.pct >= 80 && <Confetti />}
      <TopBar title="Laboratorio de gramática" />
      <Page nav={false}>
        <div className="flex items-center gap-3 pt-2">
          <FlaskConical size={40} className="text-accent" aria-hidden />
          <h1 className="font-display text-[1.9rem] leading-tight">{g.title}</h1>
        </div>
        <p className="mt-2 text-lg">{g.short}</p>
        {stats && (
          <div className="postcard mt-5 flex items-center gap-3 p-4">
            <Mascot lang={lang} mood={stats.pct >= 80 ? 'cheer' : 'happy'} size={70} />
            <p className="text-lg font-bold">
              Tanda terminada: {stats.firstTry} de {stats.total} a la primera.{' '}
              {stats.pct >= 80 ? '¡Lo dominas!' : 'Practicar otra tanda te ayudará.'}
            </p>
          </div>
        )}
        <div className="mt-5 space-y-3">
          <Button variant="secondary" icon={<BookOpen size={22} />} onClick={() => setStory(true)}>
            Ver la explicación
          </Button>
        </div>
        <h2 className="font-display mt-7 mb-3 text-[1.4rem]">Tandas de ejercicios ({g.exercises.length})</h2>
        <div className="grid grid-cols-2 gap-3">
          {batches.map((b, i) => (
            <Button
              key={i}
              variant={i === 0 ? 'primary' : 'secondary'}
              onClick={() => {
                setStats(null);
                setRound(i);
              }}
            >
              Tanda {i + 1} · {b.length}
            </Button>
          ))}
        </div>
        {g.errors.length > 0 && (
          <>
            <h2 className="font-display mt-8 mb-3 text-[1.4rem]">Errores típicos</h2>
            <div className="space-y-3">
              {g.errors.map((e, k) => (
                <div key={k} className="postcard p-4">
                  <p className="font-bold text-bad line-through" lang={lang}>
                    ❌ {e.wrong}
                  </p>
                  <p className="font-extrabold text-good" lang={lang}>
                    ✅ {e.right}
                  </p>
                  <p className="text-base">
                    <Rich text={e.why} />
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
        <div className="mt-8">
          <Button variant="ghost" onClick={() => nav(`/${lang}/gramatica`)}>
            Ver todos los puntos de gramática
          </Button>
        </div>
      </Page>
      {story && <StoryViewer g={g} lang={lang} onClose={() => setStory(false)} />}
    </div>
  );
}
