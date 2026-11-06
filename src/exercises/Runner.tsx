import { useCallback, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import type { Lang } from '@/content/types';
import { exerciseRef, type Exercise } from '@/engine/session';
import { review } from '@/engine/srs';
import { bumpDay, db } from '@/data/db';
import { ProgressBar } from '@/ui/primitives';
import { ExerciseView } from './ExerciseView';
import { GrammarOverlay } from '@/screens/GrammarStory';

export interface RunStats {
  total: number;
  firstTry: number; // aciertos a la primera
  pct: number;
  seconds: number;
  missed: Exercise[];
}

/**
 * Pasa una lista de ejercicios. Los fallados vuelven al final una vez (sin vidas ni castigos).
 * Cada respuesta actualiza el repaso inteligente y las estadísticas del día.
 */
export function Runner({
  exercises,
  lang,
  onFinish,
  onExit,
  header,
}: {
  exercises: Exercise[];
  lang: Lang;
  onFinish: (s: RunStats) => void;
  onExit: () => void;
  header?: React.ReactNode;
}) {
  const [queue, setQueue] = useState<Exercise[]>(exercises);
  const [i, setI] = useState(0);
  const [grammar, setGrammar] = useState<string | null>(null);
  const firstTry = useRef(new Map<string, boolean>());
  const missed = useRef<Exercise[]>([]);
  const t0 = useRef(Date.now());
  const lastTick = useRef(Date.now());

  useEffect(() => {
    setQueue(exercises);
    setI(0);
  }, [exercises]);

  const onDone = useCallback(
    async (ok: boolean) => {
      const ex = queue[i];
      const first = !firstTry.current.has(ex.id);
      if (first) {
        firstTry.current.set(ex.id, ok);
        const ref = exerciseRef(ex);
        if (ref) void review(lang, ref.kind, ref.ref, ok);
        void db.attempts.add({ lang, at: Date.now(), type: ex.type, ref: ref?.ref ?? ex.id, ok });
      }
      const now = Date.now();
      // tiempo activo: como mucho 2 min por ejercicio
      const secs = Math.min(120, Math.round((now - lastTick.current) / 1000));
      lastTick.current = now;
      void bumpDay(lang, { exercises: 1, correct: ok ? 1 : 0, seconds: secs });

      let next = queue;
      if (!ok && first) {
        missed.current.push(ex);
        next = [...queue, { ...ex, id: ex.id }];
        setQueue(next);
      }
      if (i + 1 >= next.length) {
        const total = firstTry.current.size;
        const good = [...firstTry.current.values()].filter(Boolean).length;
        onFinish({
          total,
          firstTry: good,
          pct: total ? Math.round((good / total) * 100) : 100,
          seconds: Math.round((Date.now() - t0.current) / 1000),
          missed: missed.current,
        });
      } else {
        setI(i + 1);
        window.scrollTo({ top: 0 });
      }
    },
    [queue, i, lang, onFinish],
  );

  const ex = queue[i];
  if (!ex) return null;
  return (
    <div className="mx-auto flex min-h-dvh max-w-[720px] flex-col px-4">
      <div className="safe-top sticky top-0 z-20 -mx-4 bg-bg/95 px-4 pb-3 backdrop-blur">
        <div className="flex items-center gap-3 pt-3">
          <button
            type="button"
            onClick={onExit}
            aria-label="Salir"
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-line bg-surface"
          >
            <X size={26} aria-hidden />
          </button>
          <ProgressBar value={i / queue.length} label="Progreso de la lección" />
          <span className="min-w-[3.5ch] text-right text-base font-extrabold text-ink-soft">
            {i + 1}/{queue.length}
          </span>
        </div>
        {header}
      </div>
      <div className="flex-1 pt-2">
        <ExerciseView key={`${ex.id}-${i}`} ex={ex} lang={lang} onDone={onDone} onGrammar={setGrammar} />
      </div>
      {grammar && <GrammarOverlay lang={lang} gid={grammar} onClose={() => setGrammar(null)} />}
    </div>
  );
}
