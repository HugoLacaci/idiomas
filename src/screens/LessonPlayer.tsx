import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BookOpen, ChevronRight, Download, Star } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { Lang, Lesson, VocabItem } from '@/content/types';
import { LANG_INFO, loadIndex, loadLesson, unitById } from '@/content/load';
import { lessonExercises, type Exercise } from '@/engine/session';
import { addCards } from '@/engine/srs';
import { completeLesson, awardBadge, unitDone } from '@/data/progress';
import { db } from '@/data/db';
import { useProfile } from '@/data/settings';
import { Runner, type RunStats } from '@/exercises/Runner';
import { DialogLines, OptionButton } from '@/exercises/bodies';
import { StoryViewer } from './GrammarStory';
import { loadGrammar } from '@/content/load';
import { AudioButtons, Button, Emoji, Photo, ProgressBar, Rich, TopBar, cn } from '@/ui/primitives';
import { Loading, Mascot, MascotTip, useLang } from '@/ui/Loading';
import { Confetti } from '@/ui/Confetti';
import { makeSummaryCard, shareOrSaveImage } from '@/ui/summaryCard';
import { playFanfare } from '@/audio/sfx';
import { say } from '@/audio/voice';

type Step = 'intro' | 'vocab' | 'grammar' | 'pron' | 'exercises' | 'dialog' | 'real' | 'done';

export default function LessonPlayer() {
  const lang = useLang();
  const { lessonId } = useParams();
  const nav = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null | undefined>(undefined);
  const [pool, setPool] = useState<VocabItem[]>([]);
  const [step, setStep] = useState<Step>('intro');
  const [stats, setStats] = useState<RunStats | null>(null);

  useEffect(() => {
    setStep('intro');
    setStats(null);
    void loadLesson(lang, lessonId!).then(setLesson);
    void loadIndex(lang).then((i) => setPool(Object.values(i.vocab)));
  }, [lang, lessonId]);

  const exercises = useMemo<Exercise[]>(() => {
    if (!lesson) return [];
    const p = pool.length >= 8 ? pool : lesson.vocab;
    return lessonExercises(lesson.vocab, lesson.exercises, p, lesson.id, 15);
  }, [lesson, pool]);

  const steps = useMemo<Step[]>(() => {
    if (!lesson) return [];
    return ['intro', 'vocab', ...(lesson.grammar ? (['grammar'] as Step[]) : []), ...(lesson.pron ? (['pron'] as Step[]) : []), 'exercises', 'dialog', 'real', 'done'];
  }, [lesson]);
  const next = useCallback(() => {
    const k = steps.indexOf(step);
    setStep(steps[Math.min(steps.length - 1, k + 1)]);
    window.scrollTo({ top: 0 });
  }, [steps, step]);

  if (lesson === undefined) return <Loading />;
  if (!lesson)
    return (
      <div data-lang={lang} className="p-6">
        <TopBar title="Lección" />
        <p className="mt-6 text-center text-lg">Esta lección todavía no está preparada. ¡Muy pronto!</p>
      </div>
    );

  const exit = () => nav(`/${lang}/unidad/${lesson.unit}`);
  const stepIdx = steps.indexOf(step);

  if (step === 'exercises')
    return (
      <Runner
        exercises={exercises}
        lang={lang}
        onExit={exit}
        onFinish={(s) => {
          setStats(s);
          next();
        }}
      />
    );

  return (
    <div className="min-h-dvh">
      {step !== 'done' && (
        <TopBar
          back={`/${lang}/unidad/${lesson.unit}`}
          title={<ProgressBar value={stepIdx / (steps.length - 1)} label="Avance de la lección" />}
          right={<span className="text-base font-extrabold text-ink-soft">{stepIdx + 1}/{steps.length}</span>}
        />
      )}
      <main className="mx-auto max-w-[720px] px-4 pb-36">
        {step === 'intro' && <Intro lesson={lesson} lang={lang} onNext={next} />}
        {step === 'vocab' && <VocabCards lesson={lesson} lang={lang} onNext={next} />}
        {step === 'grammar' && lesson.grammar && <GrammarStep gid={lesson.grammar} lang={lang} onNext={next} />}
        {step === 'pron' && lesson.pron && <PronStep lesson={lesson} lang={lang} onNext={next} />}
        {step === 'dialog' && <DialogStep lesson={lesson} lang={lang} onNext={next} />}
        {step === 'real' && <RealLife lesson={lesson} lang={lang} onNext={next} />}
        {step === 'done' && <Done lesson={lesson} lang={lang} stats={stats} />}
      </main>
    </div>
  );
}

function BottomCTA({ children }: { children: React.ReactNode }) {
  return (
    <div className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t-2 border-line bg-bg/95 backdrop-blur">
      <div className="mx-auto max-w-[720px] space-y-2 p-4">{children}</div>
    </div>
  );
}

function Intro({ lesson, lang, onNext }: { lesson: Lesson; lang: Lang; onNext: () => void }) {
  return (
    <div className="space-y-6 pt-4">
      <div className="postcard overflow-hidden p-0">
        <Photo
          k={lesson.photo}
          eager
          ratio="16 / 10"
          fallback={
            <div className="grid aspect-[16/10] place-items-center bg-surface-2">
              <Emoji e={lesson.emoji ?? '📘'} size={120} />
            </div>
          }
        />
        <div className="p-5">
          <p className="text-base font-extrabold tracking-wide text-primary uppercase">Hoy vas a aprender…</p>
          <h1 className="font-display mt-1 text-[2rem] leading-tight">{lesson.goal}</h1>
          <p className="mt-2 text-lg text-ink-soft">{lesson.title}</p>
        </div>
      </div>
      <MascotTip lang={lang}>
        {lesson.vocab.length} palabras nuevas, un poco de gramática y ejercicios. Unos 8 minutos. ¡Vamos allá!
      </MascotTip>
      <BottomCTA>
        <Button onClick={onNext}>Empezar</Button>
      </BottomCTA>
    </div>
  );
}

function FavStar({ lang, id }: { lang: Lang; id: string }) {
  const fav = useLiveQuery(() => db.favorites.get([lang, id]), [lang, id]);
  return (
    <button
      type="button"
      aria-pressed={!!fav}
      aria-label={fav ? 'Quitar de mis palabras favoritas' : 'Guardar en mis palabras favoritas'}
      onClick={() => (fav ? db.favorites.delete([lang, id]) : db.favorites.put({ lang, ref: id, at: Date.now() }))}
      className="grid h-12 w-12 place-items-center rounded-full border-2 border-line bg-surface"
    >
      <Star size={26} className={fav ? 'fill-pop text-pop' : 'text-ink-soft'} aria-hidden />
    </button>
  );
}

function VocabCards({ lesson, lang, onNext }: { lesson: Lesson; lang: Lang; onNext: () => void }) {
  const [i, setI] = useState(0);
  const v = lesson.vocab[i];
  const [startX, setStartX] = useState<number | null>(null);
  useEffect(() => {
    void say(v.t, lang);
  }, [v, lang]);
  const go = (d: number) => {
    if (i + d >= lesson.vocab.length) return onNext();
    setI(Math.max(0, i + d));
  };
  return (
    <div
      className="space-y-5 pt-4"
      onTouchStart={(e) => setStartX(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (startX === null) return;
        const dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
        setStartX(null);
      }}
    >
      <p className="text-center text-base font-extrabold text-ink-soft">
        Palabra {i + 1} de {lesson.vocab.length} · desliza o pulsa «Siguiente»
      </p>
      <div className="postcard relative space-y-4 p-5 text-center">
        <div className="absolute top-3 right-3">
          <FavStar lang={lang} id={v.id} />
        </div>
        <div className="flex justify-center pt-2">
          {v.photo ? (
            <Photo k={v.photo} className="w-full max-w-[360px] rounded-2xl" fallback={<Emoji e={v.emoji ?? '📘'} size={130} />} />
          ) : (
            <Emoji e={v.emoji ?? '📘'} size={130} />
          )}
        </div>
        <p className="font-display text-[2.4rem] leading-tight" lang={lang}>
          {v.t}
        </p>
        <p className="text-[1.3rem] font-bold text-ink-soft">{v.es}</p>
        <div className="flex justify-center">
          <AudioButtons text={v.t} lang={lang} size="lg" />
        </div>
        {v.note && <p className="rounded-xl bg-pop/30 p-2 text-base font-semibold">💡 {v.note}</p>}
        <div className="rounded-2xl bg-surface-2 p-3 text-left">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-[1.15rem] font-bold" lang={lang}>
                {v.ex.t}
              </p>
              <p className="text-base text-ink-soft">{v.ex.es}</p>
            </div>
            <AudioButtons text={v.ex.t} lang={lang} size="sm" />
          </div>
        </div>
      </div>
      <BottomCTA>
        <div className="flex gap-3">
          {i > 0 && (
            <Button variant="secondary" block={false} className="w-[38%]" onClick={() => go(-1)}>
              Atrás
            </Button>
          )}
          <Button className="flex-1" onClick={() => go(1)}>
            {i + 1 < lesson.vocab.length ? 'Siguiente' : '¡Hecho! Seguir'}
          </Button>
        </div>
      </BottomCTA>
    </div>
  );
}

function GrammarStep({ gid, lang, onNext }: { gid: string; lang: Lang; onNext: () => void }) {
  const [g, setG] = useState<Awaited<ReturnType<typeof loadGrammar>>>(null);
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    void loadGrammar(lang, gid).then(setG);
  }, [lang, gid]);
  if (!g)
    return (
      <div className="pt-6">
        <BottomCTA>
          <Button onClick={onNext}>Seguir</Button>
        </BottomCTA>
      </div>
    );
  return (
    <div className="space-y-6 pt-6 text-center">
      <div className="flex justify-center">
        <Mascot lang={lang} mood="think" size={130} />
      </div>
      <p className="text-base font-extrabold tracking-wide text-primary uppercase">Un poco de gramática</p>
      <h1 className="font-display text-[2rem] leading-tight">{g.title}</h1>
      <p className="text-lg">{g.short}</p>
      <BottomCTA>
        <Button
          variant={seen ? 'secondary' : 'primary'}
          icon={<BookOpen size={22} />}
          onClick={() => {
            setOpen(true);
            setSeen(true);
          }}
        >
          {seen ? 'Volver a verla' : 'Ver la explicación'}
        </Button>
        <Button variant={seen ? 'primary' : 'ghost'} onClick={onNext}>
          {seen ? 'Seguir con los ejercicios' : 'Ya la conozco, seguir'}
        </Button>
      </BottomCTA>
      {open && (
        <StoryViewer
          g={g}
          lang={lang}
          onClose={() => {
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

function PronStep({ lesson, lang, onNext }: { lesson: Lesson; lang: Lang; onNext: () => void }) {
  const p = lesson.pron!;
  return (
    <div className="space-y-5 pt-4">
      <p className="text-base font-extrabold tracking-wide text-primary uppercase">👄 Pronunciación</p>
      <h1 className="font-display text-[2rem] leading-tight">{p.title}</h1>
      <p className="text-[1.2rem] leading-relaxed">
        <Rich text={p.tip} />
      </p>
      {p.words && p.words.length > 0 && (
        <div className="grid gap-3">
          {p.words.map((w) => (
            <div key={w} className="postcard flex items-center gap-3 p-3">
              <p className="flex-1 text-[1.35rem] font-bold" lang={lang}>
                {w}
              </p>
              <AudioButtons text={w} lang={lang} size="sm" />
            </div>
          ))}
        </div>
      )}
      {p.pairs && p.pairs.length > 0 && (
        <div className="space-y-3">
          <p className="text-lg font-extrabold">Escucha la diferencia:</p>
          {p.pairs.map(([a, b]) => (
            <div key={a + b} className="grid grid-cols-2 gap-3">
              {[a, b].map((w) => (
                <div key={w} className="ticket flex items-center justify-between gap-2 p-3">
                  <span className="text-[1.3rem] font-bold" lang={lang}>
                    {w}
                  </span>
                  <AudioButtons text={w} lang={lang} size="sm" slow={false} />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      <BottomCTA>
        <Button onClick={onNext}>A practicar</Button>
      </BottomCTA>
    </div>
  );
}

function DialogStep({ lesson, lang, onNext }: { lesson: Lesson; lang: Lang; onNext: () => void }) {
  const d = lesson.dialog;
  const [ans, setAns] = useState<(string | null)[]>(() => d.questions.map(() => null));
  const all = ans.every((a) => a !== null);
  return (
    <div className="space-y-5 pt-4">
      <p className="text-base font-extrabold tracking-wide text-primary uppercase">🎧 Diálogo</p>
      <h1 className="font-display text-[2rem] leading-tight">{d.title}</h1>
      <p className="flex items-center gap-2 text-lg text-ink-soft">
        {d.emoji && <Emoji e={d.emoji} size={30} />} {d.setting}
      </p>
      <DialogLines dialog={d} lang={lang} />
      <div className="space-y-5 pt-2">
        {d.questions.map((q, qi) => (
          <div key={qi} className="space-y-2">
            <p className="text-lg font-extrabold">{q.q}</p>
            {q.options.map((o) => (
              <OptionButton
                key={o}
                selected={ans[qi] === o}
                state={ans[qi] !== null ? (o === q.answer ? 'ok' : ans[qi] === o ? 'bad' : null) : null}
                disabled={ans[qi] !== null}
                onClick={() => setAns((a) => a.map((x, j) => (j === qi ? o : x)))}
              >
                {o}
              </OptionButton>
            ))}
          </div>
        ))}
      </div>
      <BottomCTA>
        <Button disabled={!all} onClick={onNext}>
          {all ? 'Seguir' : 'Contesta las preguntas'}
        </Button>
      </BottomCTA>
    </div>
  );
}

function RealLife({ lesson, lang, onNext }: { lesson: Lesson; lang: Lang; onNext: () => void }) {
  const r = lesson.realLife;
  return (
    <div className="space-y-5 pt-4">
      <p className="text-base font-extrabold tracking-wide text-primary uppercase">✈️ Para la vida real</p>
      <div className="ticket space-y-3 p-5 text-center">
        <p className="text-lg text-ink-soft">{r.context}</p>
        <p className="font-display text-[2rem] leading-tight" lang={lang}>
          {r.t}
        </p>
        <p className="text-lg font-bold">{r.es}</p>
        <div className="flex justify-center">
          <AudioButtons text={r.t} lang={lang} size="lg" />
        </div>
      </div>
      {lesson.same && (
        <div className="postcard space-y-2 p-4">
          <p className="text-lg font-extrabold">🤝 Igual que en español</p>
          <p className="text-base">
            <Rich text={lesson.same.text} />
          </p>
          {lesson.same.examples.map((e) => (
            <div key={e.t} className="flex items-center gap-2">
              <span className="flex-1 font-bold" lang={lang}>
                {e.t} <span className="font-normal text-ink-soft">= {e.es}</span>
              </span>
              <AudioButtons text={e.t} lang={lang} size="sm" slow={false} />
            </div>
          ))}
        </div>
      )}
      {lesson.falseFriend && (
        <div className="space-y-2 rounded-2xl border-[3px] border-pop bg-pop/15 p-4">
          <p className="text-lg font-extrabold">⚠️ ¡Ojo! Falso amigo</p>
          <div className="flex items-center gap-4">
            {lesson.falseFriend.emoji && <Emoji e={lesson.falseFriend.emoji} size={72} />}
            <div>
              <p className="font-display text-[1.7rem]" lang={lang}>
                {lesson.falseFriend.word}
              </p>
              <p className="text-lg">
                significa <strong>{lesson.falseFriend.means}</strong>, no «{lesson.falseFriend.looksLike}».
              </p>
            </div>
          </div>
          <p className="text-base">{lesson.falseFriend.tip}</p>
        </div>
      )}
      <BottomCTA>
        <Button onClick={onNext}>Terminar la lección</Button>
      </BottomCTA>
    </div>
  );
}

function Done({ lesson, lang, stats }: { lesson: Lesson; lang: Lang; stats: RunStats | null }) {
  const nav = useNavigate();
  const profile = useProfile();
  const [saved, setSaved] = useState(false);
  const [unitFinished, setUnitFinished] = useState(false);
  const pct = stats?.pct ?? 100;
  const stars = pct >= 90 ? 3 : pct >= 70 ? 2 : 1;
  useEffect(() => {
    if (saved) return;
    setSaved(true);
    playFanfare();
    void (async () => {
      await completeLesson(lang, lesson.id, lesson.unit, pct, stats?.seconds ?? 0);
      await addCards(lang, 'v', lesson.vocab.map((v) => v.id));
      if (lesson.grammar) await addCards(lang, 'g', [lesson.grammar]);
      const u = unitById(lang, lesson.unit);
      if (u) {
        const rows = await db.lessons.where('lang').equals(lang).toArray();
        const map = new Map(rows.map((r) => [r.id, r]));
        if (unitDone(u, map)) {
          setUnitFinished(true);
          await awardBadge(lang, `unit:${u.id}`);
        }
      }
    })();
  }, [saved, lang, lesson, pct, stats]);

  const u = unitById(lang, lesson.unit);
  const nextId = u ? u.lessons[u.lessons.indexOf(lesson.id) + 1] : undefined;
  const colors = lang === 'en' ? ['#D7262E', '#F2B33D', '#1D2B53', '#3E7C59'] : ['#C8553D', '#F4D35E', '#2A7DB8', '#7A8B3C'];
  return (
    <div className="space-y-6 pt-8 text-center">
      <Confetti colors={colors} />
      <div className="flex justify-center">
        <Mascot lang={lang} mood="cheer" size={140} />
      </div>
      <h1 className="font-display text-[2.2rem] leading-tight">¡Lección terminada, {profile.name}!</h1>
      <div className="flex justify-center gap-2" aria-label={`${stars} de 3 estrellas`}>
        {[1, 2, 3].map((s) => (
          <Star key={s} size={52} className={cn(s <= stars ? 'fill-pop text-pop' : 'text-line')} aria-hidden />
        ))}
      </div>
      {stats && (
        <p className="text-lg">
          Has acertado <strong>{stats.firstTry}</strong> de <strong>{stats.total}</strong> a la primera.{' '}
          {stats.missed.length > 0 && 'Las que se te han resistido volverán en el repaso.'}
        </p>
      )}
      <div className="postcard space-y-2 p-4 text-left">
        <p className="text-lg font-extrabold">📝 Resumen</p>
        <ul className="space-y-1.5 text-[1.1rem]">
          {lesson.summary.map((s) => (
            <li key={s}>
              • <Rich text={s} />
            </li>
          ))}
        </ul>
      </div>
      <Button
        variant="secondary"
        icon={<Download size={22} />}
        onClick={async () => {
          const blob = await makeSummaryCard(lesson, lang, profile.name);
          await shareOrSaveImage(blob, `resumen-${lesson.id}.png`);
        }}
      >
        Guardar la tarjeta-resumen
      </Button>
      <BottomCTA>
        {unitFinished && u ? (
          <Button variant="pop" onClick={() => nav(`/${lang}/reto/${u.id}`)}>
            🏅 ¡Unidad completa! Hacer el mini-reto
          </Button>
        ) : nextId ? (
          <Button icon={<ChevronRight size={24} />} onClick={() => nav(`/${lang}/leccion/${nextId}`)}>
            Siguiente lección
          </Button>
        ) : null}
        <Button variant={nextId || unitFinished ? 'ghost' : 'primary'} onClick={() => nav(`/${lang}`)}>
          Volver a Hoy
        </Button>
      </BottomCTA>
      <p className="sr-only">{LANG_INFO[lang].name}</p>
    </div>
  );
}
