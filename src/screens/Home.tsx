import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CircleHelp, Settings as Cog } from 'lucide-react';
import type { Lang } from '@/content/types';
import { courseFraction, nextLesson, useProgress } from '@/data/progress';
import { useProfile } from '@/data/settings';
import { reducedMotion } from '@/data/settings';
import { Bus, BigBen, PhoneBox } from '@/art/en';
import { Colosseum, Lemon, Vespa } from '@/art/it';
import { Emoji, cn } from '@/ui/primitives';
import { InstallNudge } from './Install';
import { Logo } from '@/ui/Logo';

function LangCard({ lang, onPick }: { lang: Lang; onPick: (l: Lang) => void }) {
  const p = useProgress(lang);
  const frac = p ? courseFraction(lang, p) : 0;
  const nl = p ? nextLesson(lang, p) : null;
  const started = !!p && p.size > 0;
  const en = lang === 'en';
  return (
    <button
      type="button"
      onClick={() => onPick(lang)}
      data-lang={lang}
      className={cn(
        'relative flex min-h-[40dvh] w-full flex-col overflow-hidden rounded-[28px] p-5 text-left shadow-[0_6px_0_rgb(0_0_0/0.18)] active:translate-y-[3px] sm:min-h-[300px]',
        en ? 'bg-[#1D2B53] text-white' : 'bg-[#FFF8EC] text-[#40261C]',
      )}
      aria-label={`${en ? 'English, inglés' : 'Italiano'}${started ? `, ${Math.round(frac * 100)} % completado` : ''}`}
    >
      {en ? (
        <>
          <div className="absolute inset-x-0 top-0 h-2 bg-[repeating-linear-gradient(90deg,#D7262E_0_24px,#FAF7F0_24px_48px)]" />
          <div className="absolute right-3 bottom-0 flex h-[64%] w-[52%] items-end justify-end gap-1">
            <Bus className="mb-1 w-[58%] max-w-[150px]" />
            <BigBen className="h-full max-w-[38%]" />
          </div>
          <PhoneBox className="absolute top-8 right-5 h-[24%] opacity-90" />
        </>
      ) : (
        <>
          <div className="absolute inset-x-0 top-0 h-6 bg-[repeating-linear-gradient(90deg,#C8553D_0_24px,#FFF8EC_24px_48px)]" />
          <Lemon className="absolute top-10 right-4 w-20" />
          <div className="absolute right-0 bottom-0 flex w-[56%] items-end justify-end">
            <Vespa className="-mr-6 mb-1 w-[46%] max-w-[130px] relative z-[1]" />
            <Colosseum className="w-[70%] max-w-[220px]" />
          </div>
        </>
      )}
      <div className="relative z-10 flex flex-1 flex-col">
        <span className={cn('font-display mt-4 text-[2.6rem] leading-none', en ? 'text-white' : 'text-[#B84A34]')}>
          {en ? 'English' : 'Italiano'} <Emoji e={en ? '🇬🇧' : '🇮🇹'} size={34} className="align-baseline" />
        </span>
        <span className={cn('mt-1 text-lg font-bold', en ? 'text-[#F2B33D]' : 'text-[#236A9D]')}>{en ? 'Inglés · London & beyond' : 'La dolce vita'}</span>
        <span className="mt-auto max-w-[46%] pt-16">
          {started ? (
            <>
              <span className="block text-base font-bold">{Math.round(frac * 100)} % del curso</span>
              <span className={cn('mt-1 block h-3 overflow-hidden rounded-full', en ? 'bg-white/25' : 'bg-[#40261C]/15')}>
                <span className={cn('block h-full rounded-full', en ? 'bg-[#F2B33D]' : 'bg-[#7A8B3C]')} style={{ width: `${Math.max(4, frac * 100)}%` }} />
              </span>
              {nl && <span className="mt-2 block text-base font-semibold opacity-90">Sigue: {nl.unit.title}</span>}
            </>
          ) : (
            <span className={cn('inline-block whitespace-nowrap rounded-full px-4 py-2 text-lg font-extrabold', en ? 'bg-[#D7262E]' : 'bg-[#B84A34] text-white')}>
              Empezar ➜
            </span>
          )}
        </span>
      </div>
    </button>
  );
}

export default function Home() {
  const nav = useNavigate();
  const profile = useProfile();
  const [leaving, setLeaving] = useState<Lang | null>(null);
  const pick = (l: Lang) => {
    if (reducedMotion()) return nav(`/${l}`);
    setLeaving(l);
    setTimeout(() => nav(`/${l}`), 380);
  };
  return (
    <div className="min-h-dvh bg-bg">
      <main className="safe-top mx-auto max-w-[720px] px-4 pb-10">
        <div className="flex items-center justify-end gap-2 pt-3">
          <button onClick={() => nav('/ayuda')} className="flex min-h-[48px] items-center gap-2 rounded-xl px-3 font-bold">
            <CircleHelp size={24} aria-hidden /> Ayuda
          </button>
          <button onClick={() => nav('/ajustes')} className="flex min-h-[48px] items-center gap-2 rounded-xl px-3 font-bold">
            <Cog size={24} aria-hidden /> Ajustes
          </button>
        </div>
        <h1 className="font-display mt-2 text-[2.2rem] leading-tight">¡Hola, {profile.name}! <Emoji e="👋" size={36} /></h1>
        <p className="mt-1 text-[1.25rem] text-ink-soft">¿Qué idioma practicamos hoy?</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {(['en', 'it'] as Lang[]).map((l) => (
            <motion.div
              key={l}
              animate={leaving ? (leaving === l ? { scale: 1.06, opacity: 1 } : { opacity: 0, scale: 0.95 }) : { scale: 1, opacity: 1 }}
              transition={{ duration: 0.35 }}
            >
              <LangCard lang={l} onPick={pick} />
            </motion.div>
          ))}
        </div>
        <p className="mt-5 text-center text-base text-ink-soft">Cada idioma guarda su propio progreso. Puedes cambiar cuando quieras.</p>
        <InstallNudge />
        <div className="mt-8 flex justify-center">
          <Logo size={56} />
        </div>
      </main>
    </div>
  );
}
