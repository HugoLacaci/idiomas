import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Lang, VocabItem } from '@/content/types';
import { loadGrammar, loadIndex } from '@/content/load';
import { dueCards, hardWords } from '@/engine/srs';
import { rng, shuffle, vocabExercises, interleave, type Exercise } from '@/engine/session';
import { db } from '@/data/db';
import { Runner, type RunStats } from '@/exercises/Runner';
import { Button, Page, TopBar } from '@/ui/primitives';
import { Loading, Mascot, useLang } from '@/ui/Loading';
import { Confetti } from '@/ui/Confetti';

/** Construye una sesión de repaso a partir de tarjetas de palabras y de gramática. */
export async function buildReview(lang: Lang, mode: string | null, size = 15): Promise<Exercise[]> {
  const idx = await loadIndex(lang);
  const pool = Object.values(idx.vocab);
  const rand = rng(Date.now() & 0xffffffff);
  let vocabIds: string[] = [];
  let grammarIds: string[] = [];

  if (mode === 'dificiles') {
    vocabIds = (await hardWords(lang, size)).map((c) => c.ref);
  } else if (mode === 'favoritas') {
    vocabIds = (await db.favorites.where('lang').equals(lang).toArray()).map((f) => f.ref);
  } else {
    const due = await dueCards(lang, Date.now(), 60);
    vocabIds = due.filter((c) => c.kind === 'v').map((c) => c.ref);
    grammarIds = due.filter((c) => c.kind === 'g').map((c) => c.ref);
    if (mode === 'rapida' || vocabIds.length + grammarIds.length < 6) {
      // completar con cosas ya aprendidas
      const all = await db.cards.where('lang').equals(lang).toArray();
      const extraV = shuffle(all.filter((c) => c.kind === 'v' && !vocabIds.includes(c.ref)), rand).slice(0, 10).map((c) => c.ref);
      const extraG = shuffle(all.filter((c) => c.kind === 'g' && !grammarIds.includes(c.ref)), rand).slice(0, 3).map((c) => c.ref);
      vocabIds = [...vocabIds, ...extraV];
      grammarIds = [...grammarIds, ...extraG];
    }
  }
  const items = shuffle(vocabIds.map((id) => idx.vocab[id]).filter(Boolean) as VocabItem[], rand).slice(0, Math.ceil(size * 0.7));
  const vEx = vocabExercises(items, pool, rand).filter((e) => e.type !== 'pairs');
  const gEx: Exercise[] = [];
  for (const gid of shuffle(grammarIds, rand).slice(0, 4)) {
    const g = await loadGrammar(lang, gid);
    if (g) gEx.push(...shuffle(g.exercises.filter((e) => e.type !== 'reading'), rand).slice(0, 2));
  }
  const out = interleave(vEx.slice(0, size - Math.min(gEx.length, Math.floor(size / 3))), gEx.slice(0, Math.floor(size / 3)), rand);
  return out.slice(0, size);
}

export default function ReviewSession() {
  const lang = useLang();
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const mode = sp.get('modo');
  const [ex, setEx] = useState<Exercise[] | null>(null);
  const [stats, setStats] = useState<RunStats | null>(null);

  useEffect(() => {
    void buildReview(lang, mode, mode === 'rapida' ? 18 : 15).then(setEx);
  }, [lang, mode]);

  if (!ex) return <Loading text="Preparando tu repaso…" />;
  if (!ex.length)
    return (
      <div className="min-h-dvh">
        <TopBar title="Repasar" />
        <Page nav={false} className="space-y-5 pt-8 text-center">
          <div className="flex justify-center">
            <Mascot lang={lang} size={130} />
          </div>
          <p className="text-xl font-bold">Todavía no hay nada que repasar.</p>
          <p className="text-lg">Haz una lección y las palabras nuevas aparecerán aquí para repasarlas en el momento justo.</p>
          <Button onClick={() => nav(`/${lang}`)}>Ir a Hoy</Button>
        </Page>
      </div>
    );
  if (stats)
    return (
      <div className="min-h-dvh">
        <Confetti />
        <Page nav={false} className="space-y-5 pt-12 text-center">
          <div className="flex justify-center">
            <Mascot lang={lang} mood="cheer" size={140} />
          </div>
          <h1 className="font-display text-[2rem]">¡Repaso hecho!</h1>
          <p className="text-lg">
            Has acertado {stats.firstTry} de {stats.total} a la primera. Las palabras que has fallado volverán pronto.
          </p>
          <Button onClick={() => nav(`/${lang}`)}>Volver a Hoy</Button>
          <Button variant="secondary" onClick={() => { setStats(null); setEx(null); void buildReview(lang, mode).then(setEx); }}>
            Repasar un poco más
          </Button>
        </Page>
      </div>
    );
  return <Runner exercises={ex} lang={lang} onExit={() => nav(-1)} onFinish={setStats} />;
}
