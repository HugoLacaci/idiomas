import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Flame, Play, RefreshCw, Repeat } from 'lucide-react';
import type { DailyPhrase } from '@/content/types';
import { LANG_INFO, LEVEL_LABEL, loadDaily, loadIndex } from '@/content/load';
import { nextLesson, useProgress, useStreak } from '@/data/progress';
import { useProfile } from '@/data/settings';
import { dueCount } from '@/engine/srs';
import { AudioButtons, Button, Emoji, Page, Photo, cn } from '@/ui/primitives';
import { MascotTip, useLang } from '@/ui/Loading';
import { InstallNudge } from './Install';

function dayOfYear(d = new Date()) {
  return Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);
}

function Ring({ value, label }: { value: number; label: string }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-24 w-24 shrink-0" role="img" aria-label={label}>
      <svg viewBox="0 0 80 80" className="h-24 w-24 -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgb(var(--surface-2))" strokeWidth="9" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="rgb(var(--good))"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.min(1, value))}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-xl font-extrabold">{Math.round(Math.min(1, value) * 100)}%</span>
    </div>
  );
}

export default function Today() {
  const lang = useLang();
  const nav = useNavigate();
  const profile = useProfile();
  const progress = useProgress(lang);
  const streak = useStreak(lang);
  const due = useLiveQuery(() => dueCount(lang), [lang]) ?? 0;
  const [daily, setDaily] = useState<DailyPhrase | null>(null);
  const [titles, setTitles] = useState<Record<string, { title: string; emoji?: string }>>({});

  useEffect(() => {
    void loadDaily(lang).then((list) => setDaily(list.length ? list[dayOfYear() % list.length] : null));
    void loadIndex(lang).then((i) => setTitles(i.lessons));
  }, [lang]);

  const nl = progress ? nextLesson(lang, progress) : null;
  const started = !!progress && progress.size > 0;
  const minutes = Math.round((streak?.todaySeconds ?? 0) / 60);
  const goal = profile.minutes;
  const info = LANG_INFO[lang];
  const lessonInfo = nl ? titles[nl.lessonId] : undefined;

  return (
    <Page className="safe-top">
      <div className="flex items-center justify-between pt-3">
        <button
          onClick={() => nav('/')}
          className="flex min-h-[48px] items-center gap-2 rounded-full border-2 border-line bg-surface px-4 font-extrabold"
          aria-label="Cambiar de idioma"
        >
          <Emoji e={info.flag} size={26} /> {info.name} <RefreshCw size={18} aria-hidden />
        </button>
        <span className="flex items-center gap-1 rounded-full bg-pop/35 px-3 py-2 text-lg font-extrabold" aria-label={`${streak?.streak ?? 0} días seguidos`}>
          <Flame size={22} className="text-primary" aria-hidden /> {streak?.streak ?? 0}
        </span>
      </div>

      <h1 className="font-display mt-4 text-[2.1rem] leading-tight">
        {greeting()}, {profile.name}
      </h1>

      <div className="postcard mt-4 flex items-center gap-4 p-4">
        <Ring value={minutes / goal} label={`Hoy llevas ${minutes} de ${goal} minutos`} />
        <div>
          <p className="text-lg font-extrabold">
            {minutes >= goal ? '¡Objetivo de hoy cumplido! 🎉' : `Hoy: ${minutes} de ${goal} minutos`}
          </p>
          <p className="text-base text-ink-soft">
            {streak?.streak ? `Llevas ${streak.streak} ${streak.streak === 1 ? 'día' : 'días'} seguidos. ¡Sigue así!` : 'Un ratito cada día hace milagros.'}
          </p>
        </div>
      </div>

      {nl && (
        <div className="mt-5 space-y-3">
          <div className="postcard overflow-hidden p-0">
            <div className="flex items-center gap-4 p-4">
              <Emoji e={lessonInfo?.emoji ?? nl.unit.emoji} size={64} />
              <div className="min-w-0">
                <p className="text-sm font-extrabold tracking-wide text-primary uppercase">
                  {LEVEL_LABEL[nl.unit.level]} · {nl.unit.stop.name}
                </p>
                <p className="text-[1.25rem] leading-tight font-extrabold">{lessonInfo?.title ?? nl.unit.title}</p>
                <p className="text-base text-ink-soft">{nl.unit.title}</p>
              </div>
            </div>
          </div>
          <Button icon={<Play size={24} fill="currentColor" />} onClick={() => nav(`/${lang}/leccion/${nl.lessonId}`)}>
            {started ? 'Continuar' : 'Empezar la lección'}
          </Button>
        </div>
      )}
      {!nl && progress && (
        <MascotTip lang={lang} mood="cheer" className="mt-5">
          ¡Has terminado todas las lecciones! Ahora toca repasar y disfrutar de los vídeos y las charlas.
        </MascotTip>
      )}

      <div className="mt-3">
        <Button variant={due > 0 ? 'accent' : 'secondary'} icon={<Repeat size={22} />} onClick={() => nav(`/${lang}/repasar`)} disabled={due === 0}>
          {due > 0 ? `Repasar palabras (${due})` : 'Nada que repasar hoy ✓'}
        </Button>
      </div>

      {daily && (
        <section className="mt-6" aria-label="Frase del día">
          <h2 className="font-display mb-2 text-[1.5rem]">Frase del día</h2>
          <div className="postcard overflow-hidden p-0">
            <Photo k={daily.photo} ratio="16 / 9" fallback={daily.emoji ? <div className="grid place-items-center bg-surface-2 py-6"><Emoji e={daily.emoji} size={80} /></div> : null} />
            <div className="flex items-center gap-3 p-4">
              <div className="flex-1">
                <p className="font-display text-[1.5rem] leading-snug" lang={lang}>
                  {daily.t}
                </p>
                <p className="text-lg text-ink-soft">{daily.es}</p>
                {daily.note && <p className="mt-1 text-base">💡 {daily.note}</p>}
              </div>
              <AudioButtons text={daily.t} lang={lang} size="sm" />
            </div>
          </div>
        </section>
      )}

      <div className={cn('mt-6')}>
        <MascotTip lang={lang}>{tipOfDay(lang)}</MascotTip>
      </div>
      <InstallNudge />
    </Page>
  );
}

function greeting() {
  const h = new Date().getHours();
  return h < 13 ? 'Buenos días' : h < 21 ? 'Buenas tardes' : 'Buenas noches';
}

const TIPS = {
  en: [
    'En inglés casi siempre hace falta el sujeto: decimos «It is raining», nunca «Is raining».',
    'Truco: con he, she e it, el verbo lleva -s: «She likes tea».',
    'La h de «house» suena como un suspiro suave, no como nuestra jota.',
    'Para la edad no usamos «have»: decimos «I am 60», no «I have 60 years».',
    '«People» es plural: «People are nice».',
    'Escucha cada frase dos veces: la primera normal y la segunda con la tortuga 🐢.',
  ],
  it: [
    'En italiano las dobles consonantes se pronuncian más largas: «pala» no es «palla».',
    '«Burro» en italiano es mantequilla. ¡El burro es «l\'asino»!',
    'El italiano se lee casi como se escribe. ¡Tienes ventaja por hablar español!',
    '«Ci» suena «chi» y «ce» suena «che»: cena = «chena».',
    'Un cappuccino, solo por la mañana. Después de comer, ¡un espresso!',
    'Escucha cada frase dos veces: la primera normal y la segunda con la tortuga 🐢.',
  ],
};
function tipOfDay(lang: 'en' | 'it') {
  const t = TIPS[lang];
  return t[dayOfYear() % t.length];
}
