import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Share, SquarePlus, X } from 'lucide-react';
import { isStandalone } from '@/audio/speech';
import { requestPersistence } from '@/data/db';
import { useProfile, useStore } from '@/data/settings';
import { Button, Page, TopBar, cn } from '@/ui/primitives';
import { reducedMotion } from '@/data/settings';

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/** Aviso amable para instalar la web (protege el progreso en Safari). */
export function InstallNudge() {
  const nav = useNavigate();
  const profile = useProfile();
  const setProfile = useStore((s) => s.setProfile);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const week = 7 * 24 * 3600 * 1000;
    setShow(!isStandalone() && Date.now() - profile.installDismissedAt > week);
  }, [profile.installDismissedAt]);
  if (!show) return null;
  return (
    <div className="mt-6 flex items-start gap-3 rounded-3xl border-[3px] border-pop bg-pop/20 p-4">
      <span className="text-3xl" aria-hidden>
        📲
      </span>
      <div className="flex-1">
        <p className="text-lg font-extrabold">Ponla en tu pantalla de inicio</p>
        <p className="text-base">Así se abre como una app y tu progreso queda mejor guardado.</p>
        <div className="mt-3">
          <Button size="md" variant="pop" onClick={() => nav('/instalar')}>
            Te enseño cómo
          </Button>
        </div>
      </div>
      <button aria-label="Ahora no" onClick={() => setProfile({ installDismissedAt: Date.now() })} className="grid h-11 w-11 place-items-center rounded-full">
        <X aria-hidden />
      </button>
    </div>
  );
}

const STEPS = [
  { title: 'Abre la web en Safari', text: 'La brújula azul. Tiene que ser Safari (no WhatsApp ni Chrome).', icon: '🧭' },
  { title: 'Toca «Compartir»', text: 'Es el cuadrado con una flecha hacia arriba, abajo en el centro (o arriba a la derecha).', icon: 'share' },
  { title: 'Toca «Añadir a pantalla de inicio»', text: 'Desliza hacia abajo en el menú hasta encontrarlo.', icon: 'add' },
  { title: 'Toca «Añadir»', text: 'Arriba a la derecha. ¡Listo! Ya tienes el icono junto a tus apps.', icon: '✅' },
];

function PhoneMock({ step }: { step: number }) {
  return (
    <div className="relative mx-auto h-[300px] w-[160px] rounded-[30px] border-[6px] border-[#222] bg-white shadow-xl" aria-hidden>
      <div className="absolute top-1.5 left-1/2 h-4 w-14 -translate-x-1/2 rounded-full bg-[#222]" />
      <div className="absolute inset-x-2 top-8 h-6 rounded bg-[#EEF1F6] text-center text-[9px] leading-6 text-[#555]">hugolacaci.github.io</div>
      <div className="absolute inset-x-3 top-16 space-y-2">
        <div className="h-16 rounded-xl bg-[#1D2B53]" />
        <div className="h-16 rounded-xl bg-[#FFF8EC] ring-1 ring-[#C8553D]" />
      </div>
      <div className="absolute inset-x-0 bottom-0 flex h-10 items-center justify-around border-t bg-[#F7F7F9] text-[#2A7DB8]">
        <span className="text-xs">‹</span>
        <motion.span animate={step === 1 && !reducedMotion() ? { scale: [1, 1.5, 1] } : {}} transition={{ repeat: Infinity, duration: 1.2 }} className={cn(step === 1 && 'rounded-md bg-pop/60 p-0.5')}>
          <Share size={16} />
        </motion.span>
        <span className="text-xs">📖</span>
      </div>
      {step >= 2 && (
        <motion.div initial={{ y: 120 }} animate={{ y: 0 }} className="absolute inset-x-0 bottom-0 h-[150px] rounded-t-2xl bg-[#F2F2F7] p-2 text-[9px] text-[#222] shadow-inner">
          <div className="mb-1 rounded bg-white p-1.5">Copiar</div>
          <div className="mb-1 rounded bg-white p-1.5">Añadir a favoritos</div>
          <motion.div animate={step === 2 && !reducedMotion() ? { scale: [1, 1.06, 1] } : {}} transition={{ repeat: Infinity, duration: 1.2 }} className={cn('flex items-center justify-between rounded bg-white p-1.5', step === 2 && 'ring-2 ring-[#F2B33D]')}>
            Añadir a pantalla de inicio <SquarePlus size={11} />
          </motion.div>
        </motion.div>
      )}
      {step === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 grid place-items-center rounded-[24px] bg-[#1D2B53]/90 text-center text-white">
          <div>
            <div className="mx-auto mb-2 h-12 w-12 rounded-2xl bg-white/90 text-2xl leading-[48px]">🇬🇧</div>
            <p className="text-xs font-bold">¡Instalada!</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function Install() {
  const [step, setStep] = useState(0);
  const standalone = isStandalone();
  useEffect(() => {
    if (reducedMotion()) return;
    const t = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 3000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (standalone) void requestPersistence();
  }, [standalone]);
  return (
    <div className="min-h-dvh">
      <TopBar title="Instalar en el iPhone" />
      <Page nav={false}>
        {standalone ? (
          <div className="postcard mt-4 p-5 text-center text-lg font-bold">✅ ¡Ya la tienes instalada! Tu progreso está bien protegido.</div>
        ) : (
          <>
            <p className="mt-2 text-lg">
              Así la tendrás como una app más, a pantalla completa, y el iPhone no borrará tu progreso. Solo hay que hacerlo una vez.
            </p>
            {!isIOS() && <p className="mt-2 text-base text-ink-soft">En Android: menú ⋮ de Chrome › «Instalar aplicación» o «Añadir a pantalla de inicio».</p>}
            <div className="mt-6">
              <PhoneMock step={step} />
            </div>
            <ol className="mt-6 space-y-3">
              {STEPS.map((s, i) => (
                <li key={i}>
                  <button onClick={() => setStep(i)} className={cn('postcard flex w-full items-start gap-3 p-4 text-left', step === i && 'ring-4 ring-pop')}>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-lg font-extrabold text-primary-ink">{i + 1}</span>
                    <span>
                      <span className="flex items-center gap-2 text-lg font-extrabold">
                        {s.title} {s.icon === 'share' ? <Share size={22} className="text-accent" /> : s.icon === 'add' ? <SquarePlus size={22} className="text-accent" /> : <span>{s.icon}</span>}
                      </span>
                      <span className="block text-base">{s.text}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </>
        )}
      </Page>
    </div>
  );
}
