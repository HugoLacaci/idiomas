import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import type { Lang } from '@/content/types';
import { useProfile, useStore, type Profile } from '@/data/settings';
import { requestPersistence } from '@/data/db';
import { Button, ProgressBar, cn } from '@/ui/primitives';
import { Percy } from '@/art/en';
import { Lina } from '@/art/it';
import { Tutorial } from './Help';

type Step = 0 | 1 | 2 | 3 | 4;

export default function Onboarding() {
  const nav = useNavigate();
  const profile = useProfile();
  const setProfile = useStore((s) => s.setProfile);
  const [step, setStep] = useState<Step>(0);
  const [name, setName] = useState(profile.name || 'Yolanda');
  const [lang, setLang] = useState<Lang>(profile.lang ?? 'en');
  const [minutes, setMinutes] = useState<Profile['minutes']>(profile.minutes);

  const finish = (opts: { test?: boolean } = {}) => {
    setProfile({ name: name.trim() || 'Yolanda', lang, minutes, onboarded: true, tutorialSeen: true });
    void requestPersistence();
    nav(opts.test ? `/${lang}/prueba-nivel` : `/${lang}`, { replace: true });
  };

  return (
    <div className="safe-top safe-bottom min-h-dvh bg-bg">
      <main className="mx-auto flex min-h-dvh max-w-[560px] flex-col px-5 pt-4 pb-6">
        <div className="flex items-center gap-3">
          {step > 0 && (
            <button onClick={() => setStep((s) => (s - 1) as Step)} className="min-h-[48px] rounded-xl px-2 font-bold">
              ‹ Volver
            </button>
          )}
          <ProgressBar value={(step + 1) / 5} label="Pasos de bienvenida" />
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="flex flex-1 flex-col pt-6">
            {step === 0 && (
              <>
                <div className="flex justify-center gap-2">
                  <Percy size={96} />
                  <Lina size={96} />
                </div>
                <h1 className="font-display mt-4 text-[2rem] leading-tight">¿Cómo te llamas?</h1>
                <p className="mt-2 text-lg text-ink-soft">Así te saludaremos cada día.</p>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="given-name"
                  aria-label="Tu nombre"
                  className="mt-6 w-full rounded-2xl border-[3px] border-line bg-surface px-4 py-4 text-[1.4rem] font-bold focus:border-accent focus:outline-none"
                />
                <div className="mt-auto pt-6">
                  <Button onClick={() => setStep(1)}>Continuar</Button>
                </div>
              </>
            )}
            {step === 1 && (
              <>
                <h1 className="font-display text-[2rem] leading-tight">¿Con qué idioma quieres empezar?</h1>
                <p className="mt-2 text-lg text-ink-soft">Después puedes cambiar cuando quieras.</p>
                <div className="mt-6 grid gap-4">
                  {(['en', 'it'] as Lang[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLang(l)}
                      aria-pressed={lang === l}
                      className={cn(
                        'flex min-h-[96px] items-center gap-4 rounded-3xl border-[3px] p-4 text-left',
                        lang === l ? 'border-primary bg-primary-soft' : 'border-line bg-surface',
                      )}
                    >
                      <span className="text-[3rem]">{l === 'en' ? '🇬🇧' : '🇮🇹'}</span>
                      <span>
                        <span className="font-display block text-[1.7rem]">{l === 'en' ? 'Inglés' : 'Italiano'}</span>
                        <span className="text-base text-ink-soft">{l === 'en' ? 'Ya tienes una base: repasamos y avanzamos' : 'Empezamos desde cero, ¡se parece mucho al español!'}</span>
                      </span>
                    </button>
                  ))}
                </div>
                <div className="mt-auto pt-6">
                  <Button onClick={() => setStep(2)}>Continuar</Button>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <h1 className="font-display text-[2rem] leading-tight">¿Cuánto tiempo al día?</h1>
                <p className="mt-2 text-lg text-ink-soft">Poco y cada día funciona mejor que mucho de vez en cuando.</p>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  {([5, 10, 15, 20] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMinutes(m)}
                      aria-pressed={minutes === m}
                      className={cn(
                        'min-h-[96px] rounded-3xl border-[3px] p-3 text-center',
                        minutes === m ? 'border-primary bg-primary-soft' : 'border-line bg-surface',
                      )}
                    >
                      <span className="block text-[2rem] font-extrabold">{m}</span>
                      <span className="text-base font-bold text-ink-soft">
                        minutos{m === 10 ? ' · recomendado' : ''}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="mt-auto pt-6">
                  <Button onClick={() => setStep(3)}>Continuar</Button>
                </div>
              </>
            )}
            {step === 3 && (
              <>
                <h1 className="font-display text-[2rem] leading-tight">¿Cómo funciona?</h1>
                <Tutorial />
                <div className="mt-auto pt-6">
                  <Button onClick={() => (lang === 'en' ? setStep(4) : finish())}>Entendido</Button>
                </div>
              </>
            )}
            {step === 4 && (
              <>
                <div className="flex justify-center">
                  <Percy mood="think" size={120} />
                </div>
                <h1 className="font-display mt-2 text-[2rem] leading-tight">¿Hacemos una prueba cortita?</h1>
                <p className="mt-3 text-lg">
                  Son unas 15 preguntas fáciles para saber por dónde empezar. Sin nota y sin prisa. Si no sabes una, toca «No lo sé».
                </p>
                <div className="mt-auto space-y-3 pt-6">
                  <Button onClick={() => finish({ test: true })}>Hacer la prueba (5 minutos)</Button>
                  <Button variant="secondary" onClick={() => finish()}>
                    Prefiero empezar desde el principio
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
