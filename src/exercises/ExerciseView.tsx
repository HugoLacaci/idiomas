import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BookOpen, CircleHelp, Volume2, X } from 'lucide-react';
import type { Lang } from '@/content/types';
import { INSTRUCTIONS, type Exercise } from '@/engine/session';
import { say } from '@/audio/voice';
import { playCorrect, playWrong } from '@/audio/sfx';
import { useSettings } from '@/data/settings';
import { Button, Rich, cn } from '@/ui/primitives';
import {
  ChooseBody,
  ErrorBody,
  FillBody,
  MinimalBody,
  OrderBody,
  PairsBody,
  PictureBody,
  ReadingBody,
  SpeakBody,
  WriteBody,
  type Result,
} from './bodies';
import { HELP } from './help';

const PRAISE = ['¡Muy bien!', '¡Perfecto!', '¡Eso es!', '¡Genial!', '¡Estupendo!', '¡Así se hace!'];
const SOFT = ['Casi, casi', 'No pasa nada', 'Vamos a verlo', 'Fíjate bien'];

export function instructionFor(ex: Exercise) {
  if (ex.type === 'pickTrans') return ex.dir === 'from' ? '¿Qué significa?' : '¿Cómo se dice?';
  if (ex.type === 'translate') return ex.dir === 'to' ? 'Escribe la frase en el otro idioma' : 'Escribe qué significa en español';
  return INSTRUCTIONS[ex.type];
}

export function ExerciseView({
  ex,
  lang,
  onDone,
  onGrammar,
}: {
  ex: Exercise;
  lang: Lang;
  onDone: (ok: boolean) => void;
  onGrammar?: (gid: string) => void;
}) {
  const settings = useSettings();
  const [result, setResult] = useState<Result | null>(null);
  const [ready, setReady] = useState(false);
  const [help, setHelp] = useState(false);
  const checkRef = useRef<() => Result>(() => ({ ok: false }));
  const instr = instructionFor(ex);

  const bind = useCallback((r: boolean, check: () => Result) => {
    setReady(r);
    checkRef.current = check;
  }, []);

  const finish = useCallback((r: Result) => {
    setResult(r);
    if (r.ok) playCorrect();
    else playWrong();
  }, []);

  useEffect(() => {
    if (settings.readInstructions) void say(instr, 'es');
  }, [instr, settings.readInstructions]);

  const lang2 = lang;
  const body = useMemo(() => {
    const p = { lang: lang2, locked: !!result, bind, finish };
    switch (ex.type) {
      case 'choose':
      case 'situation':
      case 'pickTrans':
      case 'listen2text':
        return <ChooseBody ex={ex} {...p} />;
      case 'pic2word':
      case 'listen2pic':
        return <PictureBody ex={ex} {...p} />;
      case 'fill':
      case 'conjugate':
        return <FillBody ex={ex} {...p} />;
      case 'translate':
      case 'transform':
      case 'dictation':
        return <WriteBody ex={ex} {...p} />;
      case 'order':
        return <OrderBody ex={ex} {...p} />;
      case 'error':
        return <ErrorBody ex={ex} {...p} />;
      case 'pairs':
      case 'match':
        return <PairsBody ex={ex} {...p} />;
      case 'reading':
      case 'listenDialog':
        return <ReadingBody ex={ex} {...p} />;
      case 'minimal':
        return <MinimalBody ex={ex} {...p} />;
      case 'speak':
        return <SpeakBody ex={ex} {...p} />;
    }
  }, [ex, lang2, result, bind, finish]);

  const selfFinishing = ex.type === 'pairs' || ex.type === 'match' || ex.type === 'speak';
  const why = 'why' in ex ? ex.why : undefined;
  const g = 'g' in ex ? ex.g : undefined;
  const praise = useMemo(() => PRAISE[Math.floor(Math.random() * PRAISE.length)], []);
  const soft = useMemo(() => SOFT[Math.floor(Math.random() * SOFT.length)], []);

  return (
    <div className="flex min-h-full flex-col">
      <div className="mb-4 flex items-start gap-2">
        <h2 className="flex-1 text-[1.3rem] font-extrabold leading-tight">{instr}</h2>
        <button
          type="button"
          onClick={() => void say(instr, 'es')}
          aria-label="Escuchar la instrucción"
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-line bg-surface"
        >
          <Volume2 size={22} aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => setHelp(true)}
          aria-label="Ayuda: ver un ejemplo resuelto"
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-line bg-surface font-extrabold"
        >
          <CircleHelp size={24} aria-hidden />
        </button>
      </div>

      <div className="flex-1 pb-48">{body}</div>

      {/* Zona del pulgar */}
      <div className="no-print safe-bottom fixed inset-x-0 bottom-0 z-30">
        <AnimatePresence mode="wait">
          {!result ? (
            !selfFinishing && (
              <motion.div key="check" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="border-t-2 border-line bg-bg/95 backdrop-blur">
                <div className="mx-auto max-w-[720px] p-4">
                  <Button disabled={!ready} onClick={() => finish(checkRef.current())}>
                    Comprobar
                  </Button>
                </div>
              </motion.div>
            )
          ) : (
            <motion.div
              key="fb"
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              role="status"
              aria-live="assertive"
              className={cn('border-t-4', result.ok ? 'border-good bg-good-soft' : 'border-bad bg-bad-soft')}
            >
              <div className="mx-auto max-h-[60dvh] max-w-[720px] space-y-2 overflow-y-auto p-4">
                <p className={cn('text-[1.5rem] font-extrabold', result.ok ? 'text-good' : 'text-bad')}>
                  {result.ok ? `✅ ${praise}` : `💡 ${soft}`}
                </p>
                {!result.ok && result.correct && (
                  <div>
                    <p className="text-base font-bold text-ink-soft">La respuesta correcta es:</p>
                    <p className="text-[1.25rem] font-extrabold" lang={lang}>
                      {result.correct}
                    </p>
                  </div>
                )}
                {!result.ok && result.diff && (
                  <p className="text-base" aria-label="Diferencias con tu respuesta">
                    Tu respuesta:{' '}
                    {result.diff.map((t, i) => (
                      <span
                        key={i}
                        className={cn(
                          'mr-1 rounded px-1',
                          t.status === 'ok' && 'text-ink',
                          t.status === 'wrong' && 'bg-bad/15 text-bad line-through',
                          t.status === 'extra' && 'bg-bad/15 text-bad line-through',
                          t.status === 'missing' && 'bg-good/15 font-extrabold text-good',
                        )}
                      >
                        {t.status === 'missing' ? `+${t.text}` : t.text}
                      </span>
                    ))}
                  </p>
                )}
                {result.note && <p className="text-base font-semibold">{result.note}</p>}
                {why && (
                  <p className="text-[1.05rem]">
                    <Rich text={why} />
                  </p>
                )}
                <div className="flex flex-col gap-2 pt-1">
                  {!result.ok && g && onGrammar && (
                    <Button variant="secondary" size="md" icon={<BookOpen size={20} />} onClick={() => onGrammar(g)}>
                      Ver la explicación
                    </Button>
                  )}
                  <Button variant={result.ok ? 'good' : 'primary'} onClick={() => onDone(result.ok)} autoFocus>
                    Continuar
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {help && <HelpSheet type={ex.type} lang={lang} onClose={() => setHelp(false)} />}
    </div>
  );
}

function HelpSheet({ type, lang, onClose }: { type: Exercise['type']; lang: Lang; onClose: () => void }) {
  const h = HELP[type];
  const example = lang === 'en' ? h.en : h.it;
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40 sm:items-center" role="dialog" aria-modal="true" aria-label="Ayuda" onClick={onClose}>
      <div className="safe-bottom mx-auto w-full max-w-[560px] rounded-t-3xl bg-surface p-5 sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-2xl">¿Cómo se hace?</h3>
          <button onClick={onClose} aria-label="Cerrar" className="grid h-12 w-12 place-items-center rounded-full bg-surface-2">
            <X />
          </button>
        </div>
        <p className="text-lg">{h.how}</p>
        <div className="ticket mt-4 space-y-1 p-4">
          <p className="text-sm font-extrabold tracking-wide text-ink-soft uppercase">Ejemplo resuelto</p>
          <p className="text-lg" lang={lang}>
            <Rich text={example.q} />
          </p>
          <p className="text-lg font-extrabold text-good">✅ <Rich text={example.a} /></p>
        </div>
        <div className="mt-5">
          <Button onClick={onClose}>Entendido</Button>
        </div>
      </div>
    </div>
  );
}
