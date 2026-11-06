import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, FlaskConical, Volume2, X } from 'lucide-react';
import type { GrammarPoint, Lang, StoryScreen } from '@/content/types';
import { loadGrammar } from '@/content/load';
import { say, stopAudio } from '@/audio/voice';
import { AudioButtons, Button, Emoji, Rich, cn } from '@/ui/primitives';
import { Loading, Mascot, useLang } from '@/ui/Loading';
import { reducedMotion } from '@/data/settings';

/** Pantallas finales: la historia + comparación con el español + errores típicos si no están ya. */
export function storyScreens(g: GrammarPoint): StoryScreen[] {
  const s = [...g.story];
  if (!s.some((x) => x.kind === 'compare'))
    s.push({ kind: 'compare', title: 'Igual y diferente', text: `**En español:** ${g.compare.es}\n\n**En ${g.lang === 'en' ? 'inglés' : 'italiano'}:** ${g.compare.target}` });
  if (!s.some((x) => x.kind === 'errors') && g.errors.length)
    s.push({ kind: 'errors', title: '¡Ojo con estos errores!', text: '', examples: [] });
  return s;
}

function plain(s: string) {
  return s.replace(/==|\*\*/g, '');
}

export function StoryViewer({ g, lang, onClose, onLab }: { g: GrammarPoint; lang: Lang; onClose: () => void; onLab?: () => void }) {
  const screens = useMemo(() => storyScreens(g), [g]);
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const last = i === screens.length;
  const go = (d: number) => {
    stopAudio();
    setDir(d);
    setI((x) => Math.max(0, Math.min(screens.length, x + d)));
  };
  useEffect(() => () => stopAudio(), []);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  });

  const s = screens[i];
  const readAloud = async () => {
    if (!s) return;
    await say(plain(`${s.title}. ${s.text}`), 'es');
    for (const ex of s.examples ?? []) {
      await say(ex.t, lang);
    }
  };

  return (
    <div
      data-lang={lang}
      className="safe-top safe-bottom fixed inset-0 z-50 flex flex-col bg-bg text-ink"
      role="dialog"
      aria-modal="true"
      aria-label={g.title}
      onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
      onTouchEnd={(e) => {
        if (!touch.current) return;
        const dx = e.changedTouches[0].clientX - touch.current.x;
        const dy = e.changedTouches[0].clientY - touch.current.y;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
        touch.current = null;
      }}
    >
      <div className="mx-auto w-full max-w-[720px] px-4 pt-3">
        <div className="flex gap-1.5" aria-hidden>
          {[...screens, null].map((_, k) => (
            <div key={k} className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
              <div className={cn('h-full bg-primary transition-[width] duration-300', k <= i ? 'w-full' : 'w-0')} />
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-3">
          <Emoji e={lang === 'en' ? '🇬🇧' : '🇮🇹'} size={30} />
          <p className="flex-1 truncate text-base font-extrabold">{g.title}</p>
          {!last && (
            <button onClick={() => void readAloud()} aria-label="Escuchar esta pantalla" className="grid h-12 w-12 place-items-center rounded-full bg-accent text-accent-ink">
              <Volume2 size={24} aria-hidden />
            </button>
          )}
          <button onClick={onClose} aria-label="Cerrar la explicación" className="grid h-12 w-12 place-items-center rounded-full border-2 border-line bg-surface">
            <X size={26} aria-hidden />
          </button>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-[720px] flex-1 overflow-y-auto px-4 py-4">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={i}
            custom={dir}
            initial={reducedMotion() ? false : { x: dir * 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={reducedMotion() ? undefined : { x: -dir * 60, opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            {last ? (
              <div className="space-y-5 pt-6 text-center">
                <div className="flex justify-center">
                  <Mascot lang={lang} mood="cheer" size={130} />
                </div>
                <h2 className="font-display text-[2rem]">¡Ya lo tienes!</h2>
                <p className="text-lg">{g.short}</p>
              </div>
            ) : s.kind === 'errors' && !s.examples?.length ? (
              <ErrorsScreen g={g} lang={lang} title={s.title} />
            ) : (
              <ScreenView s={s} lang={lang} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mx-auto w-full max-w-[720px] px-4 pb-4">
        {last ? (
          <div className="space-y-3">
            {onLab && (
              <Button variant="accent" icon={<FlaskConical size={22} />} onClick={onLab}>
                Practicar en el laboratorio
              </Button>
            )}
            <Button onClick={onClose}>Seguir</Button>
            <Button variant="ghost" onClick={() => go(-1)}>
              Volver a verla
            </Button>
          </div>
        ) : (
          <div className="flex gap-3">
            <Button variant="secondary" block={false} className="w-[38%]" icon={<ChevronLeft />} disabled={i === 0} onClick={() => go(-1)}>
              Atrás
            </Button>
            <Button className="flex-1" onClick={() => go(1)}>
              Siguiente <ChevronRight className="inline" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function ScreenView({ s, lang }: { s: StoryScreen; lang: Lang }) {
  return (
    <div className="space-y-5 text-left">
      {s.emoji && (
        <div className="flex justify-center">
          <Emoji e={s.emoji} size={88} />
        </div>
      )}
      <h2 className="font-display text-[2rem] leading-tight">
        <Rich text={s.title} />
      </h2>
      {s.text &&
        s.text.split('\n\n').map((p, k) => (
          <p key={k} className="text-[1.25rem] leading-relaxed">
            <Rich text={p} />
          </p>
        ))}
      {s.table && (
        <div className="overflow-x-auto rounded-2xl border-2 border-line">
          <table className="w-full text-left text-[1.1rem]" lang={lang}>
            {s.table.head && (
              <thead className="bg-accent text-accent-ink">
                <tr>
                  {s.table.head.map((h, k) => (
                    <th key={k} className="px-3 py-2 font-extrabold" lang="es">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {s.table.rows.map((r, k) => (
                <tr key={k} className="odd:bg-surface even:bg-surface-2">
                  {r.map((c, j) => (
                    <td key={j} className={cn('px-3 py-2.5 font-semibold', j === 0 && 'font-extrabold')}>
                      <Rich text={c} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {s.examples?.map((ex, k) => (
        <div key={k} className="postcard flex items-center gap-3 p-3">
          <div className="flex-1">
            <p className="text-[1.25rem] font-bold" lang={lang}>
              <Rich text={ex.hl ? ex.t.replace(ex.hl, `==${ex.hl}==`) : ex.t} />
            </p>
            <p className="text-base text-ink-soft">{ex.es}</p>
          </div>
          <AudioButtons text={ex.t} lang={lang} size="sm" />
        </div>
      ))}
    </div>
  );
}

function ErrorsScreen({ g, lang, title }: { g: GrammarPoint; lang: Lang; title: string }) {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-[2rem] leading-tight">{title}</h2>
      {g.errors.map((e, k) => (
        <div key={k} className="postcard space-y-1 p-4">
          <p className="text-[1.15rem] font-bold text-bad line-through decoration-2" lang={lang}>
            ❌ {e.wrong}
          </p>
          <p className="flex items-center gap-2 text-[1.2rem] font-extrabold text-good" lang={lang}>
            ✅ {e.right} <AudioButtons text={e.right} lang={lang} size="sm" slow={false} />
          </p>
          <p className="text-base">
            <Rich text={e.why} />
          </p>
        </div>
      ))}
    </div>
  );
}

export function GrammarOverlay({ lang, gid, onClose }: { lang: Lang; gid: string; onClose: () => void }) {
  const [g, setG] = useState<GrammarPoint | null>(null);
  useEffect(() => {
    void loadGrammar(lang, gid).then(setG);
  }, [lang, gid]);
  if (!g) return null;
  return <StoryViewer g={g} lang={lang} onClose={onClose} />;
}

export default function GrammarStory() {
  const lang = useLang();
  const { gid } = useParams();
  const nav = useNavigate();
  const [g, setG] = useState<GrammarPoint | null | undefined>(undefined);
  useEffect(() => {
    void loadGrammar(lang, gid!).then(setG);
  }, [lang, gid]);
  if (g === undefined) return <Loading />;
  if (!g)
    return (
      <div className="p-6 text-center">
        <p className="text-lg">Esta explicación todavía no está lista.</p>
        <Button onClick={() => nav(-1)}>Volver</Button>
      </div>
    );
  return <StoryViewer g={g} lang={lang} onClose={() => nav(-1)} onLab={() => nav(`/${lang}/laboratorio/${g.id}`, { replace: true })} />;
}

