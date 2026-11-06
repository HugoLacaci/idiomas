import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import type { VocabItem } from '@/content/types';
import { loadGrammar, loadIndex, loadLesson, unitById } from '@/content/load';
import { interleave, rng, seedFrom, shuffle, vocabExercises, type Exercise } from '@/engine/session';
import { awardBadge } from '@/data/progress';
import { Runner, type RunStats } from '@/exercises/Runner';
import { Button, Emoji, Page, TopBar } from '@/ui/primitives';
import { Loading, Mascot, MascotTip, useLang } from '@/ui/Loading';
import { PostStamp } from '@/art/en';
import { Confetti } from '@/ui/Confetti';
import { playStamp } from '@/audio/sfx';
import { reducedMotion } from '@/data/settings';

/** Repaso de la unidad + mini-reto con insignia (sello). Se gana con un 70 % a la primera. */
export default function Challenge() {
  const lang = useLang();
  const { unitId } = useParams();
  const nav = useNavigate();
  const u = unitById(lang, unitId!);
  const [ex, setEx] = useState<Exercise[] | null>(null);
  const [running, setRunning] = useState(false);
  const [stats, setStats] = useState<RunStats | null>(null);
  const [won, setWon] = useState(false);

  useEffect(() => {
    if (!u) return;
    void (async () => {
      const rand = rng(seedFrom(u.id + Date.now()));
      const idx = await loadIndex(lang);
      const vocab: VocabItem[] = [];
      const auth: Exercise[] = [];
      for (const l of u.lessons) {
        const les = await loadLesson(lang, l);
        if (les) {
          vocab.push(...les.vocab);
          auth.push(...shuffle(les.exercises, rand).slice(0, 2));
        }
      }
      for (const g of u.grammar) {
        const gp = await loadGrammar(lang, g);
        if (gp) auth.push(...shuffle(gp.exercises, rand).slice(0, 3));
      }
      const vEx = vocabExercises(shuffle(vocab, rand).slice(0, 8), Object.values(idx.vocab), rand);
      setEx(interleave(vEx.slice(0, 7), shuffle(auth, rand).slice(0, 8), rand));
    })();
  }, [u, lang]);

  if (!u) return <Loading text="No encuentro esta unidad" />;
  if (!ex) return <Loading text="Preparando el reto…" />;
  if (running && !stats)
    return (
      <Runner
        exercises={ex}
        lang={lang}
        onExit={() => setRunning(false)}
        onFinish={async (s) => {
          setStats(s);
          if (s.pct >= 70) {
            await awardBadge(lang, `challenge:${u.id}`);
            setWon(true);
            playStamp();
          }
        }}
      />
    );

  return (
    <div className="min-h-dvh">
      {won && <Confetti />}
      <TopBar title="Mini-reto" back={`/${lang}/unidad/${u.id}`} />
      <Page nav={false} className="space-y-5 pt-4 text-center">
        <div className="relative mx-auto w-fit">
          <PostStamp color={lang === 'en' ? '#D7262E' : '#2A7DB8'} size={130} />
          <motion.span
            initial={won && !reducedMotion() ? { scale: 3, rotate: -25, opacity: 0 } : false}
            animate={{ scale: 1, rotate: 0, opacity: won || !stats ? 1 : 0.3 }}
            transition={{ type: 'spring', stiffness: 260, damping: 14 }}
            className="absolute inset-0 grid place-items-center"
          >
            <Emoji e={u.challenge.badgeEmoji} size={70} />
          </motion.span>
        </div>
        <h1 className="font-display text-[2rem] leading-tight">{won ? `¡Sello conseguido: ${u.challenge.badge}!` : u.challenge.title}</h1>
        {stats ? (
          <>
            <p className="text-lg">
              Has acertado {stats.firstTry} de {stats.total} a la primera ({stats.pct} %).
            </p>
            {!won && <MascotTip lang={lang}>Te ha faltado muy poquito. Repasa un poco y vuelve a intentarlo: ¡sin prisa!</MascotTip>}
            {won && (
              <div className="flex justify-center">
                <Mascot lang={lang} mood="cheer" size={110} />
              </div>
            )}
            <Button onClick={() => nav(`/${lang}/lecciones`)}>Seguir el viaje</Button>
            <Button variant="secondary" onClick={() => { setStats(null); setWon(false); setRunning(true); }}>
              Repetir el reto
            </Button>
          </>
        ) : (
          <>
            <p className="text-lg">{ex.length} preguntas de toda la unidad. Con un 70 % de aciertos ganas el sello «{u.challenge.badge}».</p>
            <Button onClick={() => setRunning(true)}>¡A por el sello!</Button>
          </>
        )}
      </Page>
    </div>
  );
}
