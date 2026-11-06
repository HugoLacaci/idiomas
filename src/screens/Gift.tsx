import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import gift from '@content/gift.json';
import { useProfile, useStore } from '@/data/settings';
import { Button } from '@/ui/primitives';
import { Confetti } from '@/ui/Confetti';
import { playFanfare } from '@/audio/sfx';
import { Percy } from '@/art/en';
import { Lina } from '@/art/it';

export function useGift() {
  const profile = useProfile();
  return {
    title: profile.giftOverride?.title || gift.title,
    message: profile.giftOverride?.message || gift.message,
    signature: gift.signature,
    photo: gift.photo,
  };
}

/** Felicitación de cumpleaños: la primera vez que entra. */
export default function Gift() {
  const nav = useNavigate();
  const setProfile = useStore((s) => s.setProfile);
  const g = useGift();
  const [opened, setOpened] = useState(false);
  return (
    <div className="safe-top safe-bottom flex min-h-dvh flex-col bg-[#FAF7F0] text-[#1D2B53]">
      {opened && <Confetti colors={['#D7262E', '#F2B33D', '#1D2B53', '#C8553D', '#F4D35E', '#2A7DB8']} pieces={140} />}
      <main className="mx-auto flex w-full max-w-[560px] flex-1 flex-col px-5 pt-6 pb-6 text-center">
        {!opened ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6">
            <motion.button
              type="button"
              onClick={() => {
                setOpened(true);
                playFanfare();
              }}
              animate={{ rotate: [0, -4, 4, -3, 3, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, repeatDelay: 1 }}
              className="text-[9rem] leading-none"
              aria-label="Abrir el regalo"
            >
              🎁
            </motion.button>
            <p className="font-display text-[2rem] leading-tight">Tienes un regalo</p>
            <Button
              onClick={() => {
                setOpened(true);
                playFanfare();
              }}
            >
              Abrir el regalo
            </Button>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex flex-1 flex-col">
            <div className="flex items-end justify-center gap-2">
              <Percy mood="cheer" size={92} />
              <span className="text-[5rem] leading-none" aria-hidden>
                🎂
              </span>
              <Lina mood="cheer" size={92} />
            </div>
            <h1 className="font-display mt-4 text-[2.4rem] leading-tight text-[#D7262E]">{g.title}</h1>
            {g.photo && (
              <img src={`./gift/${g.photo}`} alt="" className="mx-auto mt-4 max-h-[34dvh] rounded-3xl border-8 border-white object-cover shadow-lg" />
            )}
            <div className="mt-5 rounded-3xl border-2 border-[#DCD4C4] bg-white p-5 text-left text-[1.2rem] leading-relaxed shadow-sm">
              {g.message.split('\n').map((p, i) => (
                <p key={i} className="mb-2">
                  {p}
                </p>
              ))}
              <p className="font-display mt-3 text-right text-[1.6rem] text-[#D7262E]">{g.signature}</p>
            </div>
            <div className="mt-auto pt-6">
              <Button
                onClick={() => {
                  setProfile({ giftSeen: true });
                  nav('/bienvenida', { replace: true });
                }}
              >
                ¡Gracias! Vamos a empezar
              </Button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
