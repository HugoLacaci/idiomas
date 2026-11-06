/** Cuerpos de cada tipo de ejercicio. Todos se responden tocando (o escribiendo); nada de arrastrar. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Delete, Mic, RotateCcw, Square, Volume2 } from 'lucide-react';
import type { Lang, VocabItem } from '@/content/types';
import type { Exercise } from '@/engine/session';
import { diffAnswer, isCorrect, normalize, orderIsCorrect, tokenize, type DiffToken } from '@/engine/answer';
import { rng, seedFrom, shuffle } from '@/engine/session';
import { say, unlockAudio } from '@/audio/voice';
import { bestSimilarity, canRecognize, canRecord, micExplained, recognizeOnce, setMicExplained, startRecording } from '@/audio/speech';
import { AudioButtons, Button, Emoji, Photo, Rich, T, cn } from '@/ui/primitives';
import { LANG_INFO } from '@/content/load';

export interface Result {
  ok: boolean;
  correct?: string; // respuesta correcta para mostrar
  given?: string;
  diff?: DiffToken[];
  note?: string; // texto extra (p. ej. "Lo que he oído: …")
}

export interface BodyProps<E = Exercise> {
  ex: E;
  lang: Lang;
  locked: boolean; // tras comprobar
  bind: (ready: boolean, check: () => Result) => void;
  finish: (r: Result) => void; // para los que se completan solos (parejas, hablar)
}

function useShuffled<T>(items: T[], seed: string) {
  return useMemo(() => shuffle(items, rng(seedFrom(seed))), [items, seed]);
}

function Blank({ q, fill, lang, state }: { q: string; fill?: string; lang: Lang; state?: 'ok' | 'bad' }) {
  const parts = q.split(/_{2,}/);
  return (
    <p lang={lang} className="font-display text-[1.6rem] leading-snug">
      {parts.map((p, i) => (
        <span key={i}>
          <Rich text={p} />
          {i < parts.length - 1 && (
            <span
              className={cn(
                'mx-1 inline-block min-w-[3.5ch] border-b-4 px-1 text-center font-sans font-extrabold',
                state === 'ok' ? 'border-good text-good' : state === 'bad' ? 'border-bad text-bad' : 'border-primary text-primary',
              )}
            >
              {fill || ' '}
            </span>
          )}
        </span>
      ))}
    </p>
  );
}

export function OptionButton({
  children,
  selected,
  state,
  onClick,
  disabled,
  lang,
}: {
  children: React.ReactNode;
  selected?: boolean;
  state?: 'ok' | 'bad' | null;
  onClick: () => void;
  disabled?: boolean;
  lang?: string;
}) {
  return (
    <button
      type="button"
      lang={lang}
      disabled={disabled}
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'flex min-h-[64px] w-full items-center gap-3 rounded-2xl border-[3px] px-4 py-3 text-left text-[1.15rem] font-bold transition-colors',
        'active:translate-y-[2px]',
        state === 'ok'
          ? 'border-good bg-good-soft text-ink'
          : state === 'bad'
            ? 'border-bad bg-bad-soft text-ink'
            : selected
              ? 'border-accent bg-accent-soft text-ink shadow-[0_3px_0_rgb(var(--accent))]'
              : 'border-line bg-surface text-ink shadow-[0_3px_0_rgb(var(--line))]',
      )}
    >
      {children}
    </button>
  );
}

export function TextAnswer({
  value,
  onChange,
  lang,
  placeholder = 'Escribe aquí…',
  disabled,
  multiline,
  onEnter,
}: {
  value: string;
  onChange: (v: string) => void;
  lang: string;
  placeholder?: string;
  disabled?: boolean;
  multiline?: boolean;
  onEnter?: () => void;
}) {
  const ref = useRef<HTMLTextAreaElement & HTMLInputElement>(null);
  const common = {
    ref,
    value,
    lang,
    disabled,
    placeholder,
    autoCapitalize: 'off',
    autoCorrect: 'off',
    autoComplete: 'off',
    spellCheck: false,
    'aria-label': 'Tu respuesta',
    onChange: (e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>) => onChange(e.target.value),
    // El teclado del iPhone no debe tapar el campo
    onFocus: () => setTimeout(() => ref.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 300),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onEnter?.();
      }
    },
    className:
      'w-full rounded-2xl border-[3px] border-line bg-surface px-4 py-3 text-[1.2rem] font-semibold text-ink placeholder:text-ink-soft/70 focus:border-accent focus:outline-none',
  };
  return multiline ? <textarea rows={2} {...common} /> : <input type="text" enterKeyHint="done" {...common} />;
}

function Picture({ item, size = 120 }: { item: VocabItem; size?: number }) {
  return item.photo ? (
    <Photo k={item.photo} className="mx-auto w-full max-w-[320px] rounded-2xl" fallback={<Emoji e={item.emoji ?? '❓'} size={size} />} />
  ) : (
    <Emoji e={item.emoji ?? '❓'} size={size} />
  );
}

// ───────── Elegir (choose / situation / pickTrans / listen2text) ─────────
export function ChooseBody({ ex, lang, locked, bind }: BodyProps) {
  const [sel, setSel] = useState<string | null>(null);
  const e = ex as Exclude<Exercise, { type: 'pairs' }>;
  const { options, answer } = useMemo(() => {
    switch (e.type) {
      case 'choose':
      case 'situation':
        return { options: e.options, answer: e.answer };
      case 'pickTrans':
      case 'listen2text':
        return { options: e.options, answer: e.answer };
      default:
        return { options: [], answer: '' };
    }
  }, [e]);
  const shuffled = useShuffled(options, e.id);
  const optLang = e.type === 'pickTrans' && e.dir === 'from' ? 'es' : lang;
  useEffect(() => {
    bind(sel !== null, () => ({ ok: sel === answer, correct: answer, given: sel ?? '' }));
  }, [sel, answer, bind]);
  useEffect(() => {
    if (e.type === 'listen2text') void say(e.answer, lang);
    if (e.type === 'pickTrans' && e.dir === 'from') void say(e.item.t, lang);
  }, [e, lang]);

  return (
    <div className="space-y-5">
      {e.type === 'choose' && (
        <div className="space-y-2">
          <Blank q={e.q} lang={lang} fill={locked ? answer : (sel ?? undefined)} state={locked ? (sel === answer ? 'ok' : 'bad') : undefined} />
          {e.es && <p className="text-base text-ink-soft">«{e.es}»</p>}
        </div>
      )}
      {e.type === 'situation' && (
        <div className="ticket flex items-start gap-3 p-4">
          {e.emoji && <Emoji e={e.emoji} size={52} />}
          <p className="text-[1.2rem] font-bold">{e.context}</p>
        </div>
      )}
      {e.type === 'pickTrans' && (
        <div className="flex items-center justify-center gap-4 py-2 text-center">
          <Emoji e={e.item.emoji ?? ''} size={64} />
          <div>
            <p className="font-display text-[2rem] leading-tight" lang={e.dir === 'from' ? lang : 'es'}>
              {e.dir === 'from' ? e.item.t : e.item.es}
            </p>
            {e.dir === 'from' && <AudioButtons text={e.item.t} lang={lang} size="sm" className="mt-2" />}
          </div>
        </div>
      )}
      {e.type === 'listen2text' && (
        <div className="flex justify-center py-2">
          <AudioButtons text={e.answer} lang={lang} size="lg" />
        </div>
      )}
      <div className="grid gap-3">
        {shuffled.map((o) => (
          <OptionButton
            key={o}
            lang={optLang}
            selected={sel === o}
            disabled={locked}
            state={locked ? (o === answer ? 'ok' : o === sel ? 'bad' : null) : null}
            onClick={() => {
              setSel(o);
              if (optLang !== 'es') void say(o, lang);
            }}
          >
            <span className="flex-1">{o}</span>
            {locked && o === answer && <Check className="text-good" aria-label="Correcta" />}
          </OptionButton>
        ))}
      </div>
    </div>
  );
}

// ───────── Foto → palabra / escuchar → foto ─────────
export function PictureBody({ ex, lang, locked, bind }: BodyProps<Extract<Exercise, { type: 'pic2word' | 'listen2pic' }>>) {
  const [sel, setSel] = useState<string | null>(null);
  useEffect(() => {
    void say(ex.item.t, lang);
  }, [ex, lang]);
  useEffect(() => {
    bind(sel !== null, () => ({ ok: sel === ex.item.id, correct: `${ex.item.t} = ${ex.item.es}`, given: sel ?? '' }));
  }, [sel, ex, bind]);

  if (ex.type === 'pic2word')
    return (
      <div className="space-y-5">
        <div className="flex flex-col items-center gap-3">
          <Picture item={ex.item} size={128} />
          <p className="text-lg font-bold text-ink-soft">«{ex.item.es}»</p>
        </div>
        <div className="grid gap-3">
          {ex.options.map((o) => (
            <OptionButton
              key={o.id}
              lang={lang}
              selected={sel === o.id}
              disabled={locked}
              state={locked ? (o.id === ex.item.id ? 'ok' : o.id === sel ? 'bad' : null) : null}
              onClick={() => {
                setSel(o.id);
                void say(o.t, lang);
              }}
            >
              {o.t}
            </OptionButton>
          ))}
        </div>
      </div>
    );
  return (
    <div className="space-y-5">
      <div className="flex justify-center">
        <AudioButtons text={ex.item.t} lang={lang} size="lg" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {ex.options.map((o) => (
          <button
            key={o.id}
            type="button"
            disabled={locked}
            aria-label={o.es}
            aria-pressed={sel === o.id}
            onClick={() => setSel(o.id)}
            className={cn(
              'grid aspect-square place-items-center rounded-3xl border-[3px] bg-surface p-3 active:translate-y-[2px]',
              locked && o.id === ex.item.id
                ? 'border-good bg-good-soft'
                : locked && o.id === sel
                  ? 'border-bad bg-bad-soft'
                  : sel === o.id
                    ? 'border-accent bg-accent-soft'
                    : 'border-line shadow-[0_3px_0_rgb(var(--line))]',
            )}
          >
            <Emoji e={o.emoji ?? '❓'} size={84} />
            {locked && <span className="mt-1 text-sm font-bold">{o.es}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

// ───────── Completar el hueco ─────────
export function FillBody({ ex, lang, locked, bind }: BodyProps<Extract<Exercise, { type: 'fill' | 'conjugate' }>>) {
  const [val, setVal] = useState('');
  const [showTable, setShowTable] = useState(false);
  const bank = ex.type === 'fill' ? ex.bank : undefined;
  const shuffled = useShuffled(bank ?? [], ex.id);
  const ok = isCorrect(val, ex.answer, lang);
  useEffect(() => {
    bind(val.trim().length > 0, () => ({ ok: isCorrect(val, ex.answer, lang), correct: ex.answer[0], given: val }));
  }, [val, ex, lang, bind]);
  return (
    <div className="space-y-5">
      {ex.type === 'conjugate' && (
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-accent-soft px-3 py-1 font-bold" lang={lang}>
            {ex.verb}
          </span>
          <span className="rounded-full bg-surface-2 px-3 py-1 font-bold" lang={lang}>
            {ex.person}
          </span>
          <span className="rounded-full bg-pop/40 px-3 py-1 font-bold">{ex.tense}</span>
        </div>
      )}
      <Blank q={ex.q} lang={lang} fill={bank ? val : locked ? val : undefined} state={locked ? (ok ? 'ok' : 'bad') : undefined} />
      {ex.type === 'fill' && ex.es && <p className="text-base text-ink-soft">«{ex.es}»</p>}
      {ex.type === 'fill' && ex.hint && <p className="text-base text-ink-soft">💡 {ex.hint}</p>}
      {bank ? (
        <div className="flex flex-wrap gap-3">
          {shuffled.map((w) => (
            <button
              key={w}
              type="button"
              lang={lang}
              disabled={locked}
              onClick={() => {
                setVal(w);
                void say(w, lang);
              }}
              className={cn(
                'min-h-[56px] rounded-2xl border-[3px] px-5 text-[1.2rem] font-bold active:translate-y-[2px]',
                val === w ? 'border-accent bg-accent-soft' : 'border-line bg-surface shadow-[0_3px_0_rgb(var(--line))]',
              )}
            >
              {w}
            </button>
          ))}
        </div>
      ) : (
        <TextAnswer value={val} onChange={setVal} lang={lang} disabled={locked} />
      )}
      {ex.type === 'conjugate' && ex.table && (
        <div>
          <button type="button" onClick={() => setShowTable((s) => !s)} className="min-h-[48px] font-bold text-accent underline">
            {showTable ? 'Ocultar la tabla' : 'Ver la tabla de ayuda'}
          </button>
          {showTable && (
            <table className="mt-2 w-full overflow-hidden rounded-xl text-left text-base" lang={lang}>
              <tbody>
                {ex.table.map((r, i) => (
                  <tr key={i} className="odd:bg-surface-2">
                    {r.map((c, j) => (
                      <td key={j} className="px-3 py-2">
                        <Rich text={c} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

// ───────── Escribir (traducir, transformar, dictado) ─────────
export function WriteBody({ ex, lang, locked, bind }: BodyProps<Extract<Exercise, { type: 'translate' | 'transform' | 'dictation' }>>) {
  const [val, setVal] = useState('');
  const answers = useMemo(() => (ex.type === 'dictation' ? [ex.text] : ex.answer), [ex]);
  const ansLang = ex.type === 'translate' && ex.dir === 'from' ? 'es' : lang;
  useEffect(() => {
    if (ex.type === 'dictation') void say(ex.text, lang);
  }, [ex, lang]);
  useEffect(() => {
    bind(val.trim().length > 0, () => {
      const ok = isCorrect(val, answers, ansLang === 'es' ? undefined : lang);
      const d = diffAnswer(val, answers, ansLang === 'es' ? undefined : lang);
      return { ok, correct: d.target, given: val, diff: ok ? undefined : d.tokens };
    });
  }, [val, answers, ansLang, lang, bind]);
  return (
    <div className="space-y-5">
      {ex.type === 'dictation' && (
        <div className="flex flex-col items-center gap-2">
          <AudioButtons text={ex.text} lang={lang} size="lg" />
          <p className="text-base text-ink-soft">Pista: «{ex.es}»</p>
        </div>
      )}
      {ex.type === 'translate' && (
        <div className="flex items-start gap-3">
          <p className="font-display flex-1 text-[1.6rem] leading-snug" lang={ex.dir === 'to' ? 'es' : lang}>
            {ex.q}
          </p>
          {ex.dir === 'from' && <AudioButtons text={ex.q} lang={lang} size="sm" slow={false} />}
        </div>
      )}
      {ex.type === 'transform' && (
        <div className="space-y-3">
          <p className="inline-block rounded-full bg-pop/45 px-4 py-1 text-lg font-extrabold">{ex.instr}</p>
          <div className="flex items-start gap-3">
            <p className="font-display flex-1 text-[1.6rem] leading-snug" lang={lang}>
              {ex.q}
            </p>
            <AudioButtons text={ex.q} lang={lang} size="sm" slow={false} />
          </div>
        </div>
      )}
      <TextAnswer
        value={val}
        onChange={setVal}
        lang={ansLang}
        disabled={locked}
        multiline
        placeholder={ansLang === 'es' ? 'Escribe en español…' : `Escribe en ${lang === 'en' ? 'inglés' : 'italiano'}…`}
      />
      <p className="text-sm text-ink-soft">No te preocupes por las mayúsculas ni las tildes.</p>
    </div>
  );
}

// ───────── Ordenar tocando palabras ─────────
export function OrderBody({ ex, lang, locked, bind }: BodyProps<Extract<Exercise, { type: 'order' }>>) {
  const tokens = useMemo(() => [...tokenize(ex.answer), ...(ex.extra ?? [])].map((t, i) => ({ t, i })), [ex]);
  const pool = useShuffled(tokens, ex.id);
  const [chosen, setChosen] = useState<number[]>([]);
  const words = chosen.map((i) => tokens[i].t);
  useEffect(() => {
    bind(chosen.length > 0, () => {
      const ok = orderIsCorrect(words, ex.answer, ex.alt, lang);
      return { ok, correct: ex.answer, given: words.join(' ') };
    });
  }, [chosen, words, ex, lang, bind]);
  return (
    <div className="space-y-5">
      <p className="font-display text-[1.5rem] leading-snug">«{ex.es}»</p>
      <div
        className="flex min-h-[132px] flex-wrap content-start gap-2 rounded-2xl border-[3px] border-dashed border-line bg-surface-2/60 p-3"
        aria-label="Tu frase"
      >
        {chosen.length === 0 && <span className="self-center px-2 text-base text-ink-soft">Toca las palabras en orden 👇</span>}
        {chosen.map((idx, pos) => (
          <button
            key={`${idx}-${pos}`}
            type="button"
            lang={lang}
            disabled={locked}
            onClick={() => setChosen((c) => c.filter((_, j) => j !== pos))}
            className="min-h-[52px] rounded-xl border-2 border-accent bg-surface px-4 text-[1.15rem] font-bold shadow-[0_2px_0_rgb(var(--accent))]"
          >
            {tokens[idx].t}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2" aria-label="Palabras disponibles">
        {pool.map(({ t, i }) => {
          const used = chosen.includes(i);
          return (
            <button
              key={i}
              type="button"
              lang={lang}
              disabled={used || locked}
              onClick={() => {
                setChosen((c) => [...c, i]);
                void say(t, lang);
              }}
              className={cn(
                'min-h-[52px] rounded-xl border-2 px-4 text-[1.15rem] font-bold',
                used ? 'border-line bg-surface-2 text-transparent' : 'border-line bg-surface shadow-[0_3px_0_rgb(var(--line))] active:translate-y-[2px]',
              )}
            >
              {t}
            </button>
          );
        })}
      </div>
      {!locked && chosen.length > 0 && (
        <div className="flex gap-3">
          <Button variant="secondary" size="md" block={false} icon={<Delete size={20} />} onClick={() => setChosen((c) => c.slice(0, -1))}>
            Deshacer
          </Button>
          <Button variant="secondary" size="md" block={false} icon={<RotateCcw size={20} />} onClick={() => setChosen([])}>
            Empezar de nuevo
          </Button>
        </div>
      )}
    </div>
  );
}

// ───────── Encontrar el error ─────────
/** Corrige la frase; si la corrección acaba en apóstrofo (un', l') se une a la palabra siguiente. */
export function fixSentence(q: string, wrong: string, fix: string) {
  const esc = wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(^|\\s)${esc}(?=\\s|[.,!?]|$)`);
  const out = re.test(q) ? q.replace(re, (_m, pre: string) => pre + fix) : q.replace(wrong, fix);
  return out.replace(/(['’])\s+/g, '$1');
}

export function ErrorBody({ ex, lang, locked, bind }: BodyProps<Extract<Exercise, { type: 'error' }>>) {
  const words = useMemo(() => ex.q.split(/\s+/), [ex]);
  const [sel, setSel] = useState<number | null>(null);
  const clean = (w: string) => normalize(w, undefined);
  // Si la palabra aparece varias veces, manda la coincidencia exacta (p. ej. "like." al final).
  const exact = words.indexOf(ex.wrong);
  const wrongIdx = exact >= 0 ? exact : words.findIndex((w) => clean(w) === clean(ex.wrong));
  useEffect(() => {
    bind(sel !== null, () => ({
      ok: sel === wrongIdx,
      correct: fixSentence(ex.q, ex.wrong, ex.fix),
      given: sel !== null ? words[sel] : '',
      note: `«${ex.wrong}» ➜ «${ex.fix}»`,
    }));
  }, [sel, words, ex, bind]);
  return (
    <div className="space-y-5">
      {ex.es && <p className="text-base text-ink-soft">«{ex.es}»</p>}
      <div className="flex flex-wrap gap-2" lang={lang}>
        {words.map((w, i) => (
          <button
            key={i}
            type="button"
            disabled={locked}
            onClick={() => setSel(i)}
            aria-pressed={sel === i}
            className={cn(
              'min-h-[56px] rounded-xl border-[3px] px-4 text-[1.3rem] font-bold',
              locked && i === wrongIdx
                ? 'border-bad bg-bad-soft line-through'
                : sel === i
                  ? 'border-accent bg-accent-soft'
                  : 'border-line bg-surface shadow-[0_3px_0_rgb(var(--line))]',
            )}
          >
            {w}
          </button>
        ))}
      </div>
      {locked && (
        <p className="text-lg font-bold" lang={lang}>
          ✅ {fixSentence(ex.q, ex.wrong, ex.fix)}
        </p>
      )}
    </div>
  );
}

// ───────── Emparejar (parejas y match) ─────────
export function PairsBody({ ex, lang, finish }: BodyProps<Extract<Exercise, { type: 'pairs' | 'match' }>>) {
  const pairs: { a: string; b: string; aIsEmoji?: boolean }[] = useMemo(
    () =>
      ex.type === 'pairs'
        ? ex.items.map((v) => ({ a: v.t, b: v.es }))
        : ex.pairs.map(([a, b]) => ({ a, b })),
    [ex],
  );
  const left = useShuffled(pairs.map((p, i) => ({ t: p.a, i })), ex.id + 'L');
  const right = useShuffled(pairs.map((p, i) => ({ t: p.b, i })), ex.id + 'R');
  const [selL, setSelL] = useState<number | null>(null);
  const [selR, setSelR] = useState<number | null>(null);
  const [done, setDone] = useState<number[]>([]);
  const [bad, setBad] = useState<[number, number] | null>(null);
  const mistakes = useRef(0);
  const rightLang = ex.type === 'pairs' ? 'es' : lang;

  useEffect(() => {
    if (selL === null || selR === null) return;
    if (selL === selR) {
      const nd = [...done, selL];
      setDone(nd);
      setSelL(null);
      setSelR(null);
      if (nd.length === pairs.length) {
        setTimeout(
          () =>
            finish({
              ok: mistakes.current <= 1,
              note: mistakes.current ? `Has tenido ${mistakes.current} ${mistakes.current === 1 ? 'despiste' : 'despistes'}.` : undefined,
            }),
          350,
        );
      }
    } else {
      mistakes.current++;
      setBad([selL, selR]);
      const t = setTimeout(() => {
        setBad(null);
        setSelL(null);
        setSelR(null);
      }, 650);
      return () => clearTimeout(t);
    }
  }, [selL, selR, done, pairs.length, finish]);

  const cls = (i: number, sel: number | null, side: 0 | 1) =>
    cn(
      'min-h-[64px] w-full rounded-2xl border-[3px] px-3 py-2 text-[1.05rem] font-bold leading-tight transition-all',
      done.includes(i)
        ? 'border-good/40 bg-good-soft text-ink-soft opacity-60'
        : bad && bad[side] === i
          ? 'border-bad bg-bad-soft'
          : sel === i
            ? 'border-accent bg-accent-soft'
            : 'border-line bg-surface shadow-[0_3px_0_rgb(var(--line))]',
    );
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-3">
        {left.map(({ t, i }) => (
          <button
            key={i}
            type="button"
            lang={lang}
            disabled={done.includes(i)}
            className={cls(i, selL, 0)}
            onClick={() => {
              setSelL(i);
              void say(t, lang);
            }}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {right.map(({ t, i }) => (
          <button key={i} type="button" lang={rightLang} disabled={done.includes(i)} className={cls(i, selR, 1)} onClick={() => setSelR(i)}>
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}

// ───────── Lectura (menú, mensaje, cartel…) y comprensión ─────────
export function ReadingBody({ ex, lang, locked, bind }: BodyProps<Extract<Exercise, { type: 'reading' | 'listenDialog' }>>) {
  const questions = useMemo(() => (ex.type === 'reading' ? ex.questions : [ex.q]), [ex]);
  const [answers, setAnswers] = useState<(string | null)[]>(() => questions.map(() => null));
  useEffect(() => {
    bind(
      answers.every((a) => a !== null),
      () => {
        const wrong = questions.filter((q, i) => answers[i] !== q.answer);
        return { ok: wrong.length === 0, correct: wrong.map((q) => `${q.q} → ${q.answer}`).join(' · ') };
      },
    );
  }, [answers, questions, bind]);
  return (
    <div className="space-y-5">
      {ex.type === 'reading' ? <ReadingCard ex={ex} lang={lang} /> : <DialogLines dialog={ex.dialog} lang={lang} />}
      {questions.map((q, qi) => (
        <div key={qi} className="space-y-2">
          <p className="text-lg font-extrabold">{q.q}</p>
          <div className="grid gap-2">
            {q.options.map((o) => (
              <OptionButton
                key={o}
                selected={answers[qi] === o}
                disabled={locked}
                state={locked ? (o === q.answer ? 'ok' : answers[qi] === o ? 'bad' : null) : null}
                onClick={() => setAnswers((a) => a.map((x, j) => (j === qi ? o : x)))}
              >
                {o}
              </OptionButton>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ReadingCard({ ex, lang }: { ex: Extract<Exercise, { type: 'reading' }>; lang: Lang }) {
  const lines = ex.text.split('\n');
  const base = 'p-4 text-[1.15rem] leading-relaxed';
  const head = ex.title && <p className="mb-2 font-display text-xl">{ex.title}</p>;
  const body = lines.map((l, i) => <p key={i}>{l || ' '}</p>);
  return (
    <div lang={lang}>
      {ex.kind === 'message' ? (
        <div className="rounded-3xl bg-[#E7F8DD] p-3 text-[#1b2a12] shadow-sm dark:bg-[#1f3a2a] dark:text-white">
          <div className={cn(base, 'rounded-2xl rounded-tl-sm bg-white/80 dark:bg-black/20')}>
            {head}
            {body}
          </div>
        </div>
      ) : ex.kind === 'menu' ? (
        <div className={cn(base, 'postcard text-center font-display')}>
          {head}
          {body}
        </div>
      ) : ex.kind === 'sign' ? (
        <div className={cn(base, 'rounded-xl border-4 border-accent bg-surface text-center text-xl font-extrabold uppercase tracking-wide')}>
          {head}
          {body}
        </div>
      ) : (
        <div className={cn(base, 'ticket')}>
          {head}
          {body}
        </div>
      )}
      <div className="mt-2 flex justify-end">
        <AudioButtons text={[ex.title, ex.text].filter(Boolean).join('. ')} lang={lang} size="sm" />
      </div>
    </div>
  );
}

export function DialogLines({ dialog, lang, showEs = true }: { dialog: { lines: { who: string; t: string; es: string }[] }; lang: Lang; showEs?: boolean }) {
  const speakers = [...new Set(dialog.lines.map((l) => l.who))];
  const [open, setOpen] = useState<number | null>(null);
  const playAll = async () => {
    for (const l of dialog.lines) await say(l.t, lang, { alt: speakers.indexOf(l.who) % 2 === 1 });
  };
  return (
    <div className="space-y-3">
      <Button variant="accent" size="md" icon={<Volume2 size={22} />} onClick={() => void playAll()}>
        Escuchar el diálogo entero
      </Button>
      {dialog.lines.map((l, i) => {
        const right = speakers.indexOf(l.who) % 2 === 1;
        return (
          <div key={i} className={cn('flex', right ? 'justify-end' : 'justify-start')}>
            <button
              type="button"
              onClick={() => {
                unlockAudio();
                void say(l.t, lang, { alt: right });
                setOpen(open === i ? null : i);
              }}
              className={cn(
                'max-w-[85%] rounded-3xl px-4 py-3 text-left shadow-sm',
                right ? 'rounded-br-md bg-accent-soft' : 'rounded-bl-md bg-surface border-2 border-line',
              )}
            >
              <span className="block text-sm font-extrabold text-ink-soft">{l.who}</span>
              <T lang={lang} className="block text-[1.15rem] font-bold">
                {l.t}
              </T>
              {showEs && open === i && <span className="mt-1 block text-base text-ink-soft">{l.es}</span>}
            </button>
          </div>
        );
      })}
      {showEs && <p className="text-center text-sm text-ink-soft">Toca una frase para oírla y ver la traducción.</p>}
    </div>
  );
}

// ───────── Pares mínimos ─────────
export function MinimalBody({ ex, lang, locked, bind }: BodyProps<Extract<Exercise, { type: 'minimal' }>>) {
  const [sel, setSel] = useState<string | null>(null);
  useEffect(() => {
    void say(ex.answer, lang);
  }, [ex, lang]);
  useEffect(() => {
    bind(sel !== null, () => ({ ok: sel === ex.answer, correct: ex.answer, given: sel ?? '' }));
  }, [sel, ex, bind]);
  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <AudioButtons text={ex.answer} lang={lang} size="lg" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {ex.pair.map((w, i) => (
          <OptionButton
            key={w}
            lang={lang}
            selected={sel === w}
            disabled={locked}
            state={locked ? (w === ex.answer ? 'ok' : w === sel ? 'bad' : null) : null}
            onClick={() => setSel(w)}
          >
            <span className="w-full text-center">
              <span className="block text-[1.5rem]">{w}</span>
              {ex.es && <span className="block text-sm font-semibold text-ink-soft">{ex.es[i]}</span>}
            </span>
          </OptionButton>
        ))}
      </div>
      {locked && (
        <div className="flex justify-center gap-6">
          {ex.pair.map((w) => (
            <span key={w} className="flex items-center gap-2 font-bold" lang={lang}>
              {w} <AudioButtons text={w} lang={lang} size="sm" slow={false} />
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ───────── Hablar ─────────
export function SpeakBody({ ex, lang, finish }: BodyProps<Extract<Exercise, { type: 'speak' }>>) {
  const [phase, setPhase] = useState<'idle' | 'explain' | 'listening' | 'recording' | 'recorded'>('idle');
  const [heard, setHeard] = useState<string>('');
  const [recUrl, setRecUrl] = useState<string | null>(null);
  const recRef = useRef<{ stop: () => Promise<string> } | null>(null);
  const sr = canRecognize();
  const rec = canRecord();
  const bcp = lang === 'en' ? (document.documentElement.dataset.accent === 'us' ? 'en-US' : 'en-GB') : LANG_INFO[lang].bcp47;

  useEffect(() => {
    void say(ex.t, lang);
  }, [ex, lang]);

  const startMic = async () => {
    if (!micExplained()) return setPhase('explain');
    if (sr) {
      setPhase('listening');
      const r = await recognizeOnce(bcp);
      if (r.heard.length) {
        const sim = bestSimilarity(ex.t, r.heard, lang);
        setHeard(r.heard[0]);
        setPhase('idle');
        finish({
          ok: sim >= 0.6,
          note: `He entendido: «${r.heard[0]}»`,
          correct: ex.t,
        });
        return;
      }
      // sin resultado → grabar como respaldo
      setPhase('idle');
      if (r.error === 'not-allowed' || r.error === 'service-not-allowed') setHeard('No tengo permiso para usar el micrófono.');
      else setHeard('No te he oído bien. Prueba otra vez o grábate.');
      return;
    }
    if (rec) {
      try {
        recRef.current = await startRecording();
        setPhase('recording');
      } catch {
        setHeard('No tengo permiso para usar el micrófono.');
      }
    }
  };

  const stopRec = async () => {
    const url = await recRef.current?.stop();
    if (url) {
      setRecUrl(url);
      setPhase('recorded');
    }
  };

  return (
    <div className="space-y-5">
      <div className="ticket space-y-2 p-4 text-center">
        <p className="font-display text-[1.7rem] leading-snug" lang={lang}>
          {ex.t}
        </p>
        <p className="text-base text-ink-soft">«{ex.es}»</p>
        <div className="flex justify-center">
          <AudioButtons text={ex.t} lang={lang} size="md" />
        </div>
      </div>

      {phase === 'explain' && (
        <div className="space-y-3 rounded-2xl bg-accent-soft p-4">
          <p className="text-lg font-bold">🎤 Para escucharte necesito el micrófono</p>
          <p>
            Ahora el teléfono te preguntará si me dejas usarlo. Solo se usa mientras hablas, y tu voz no se guarda en ningún sitio.
          </p>
          <Button
            variant="accent"
            onClick={() => {
              setMicExplained();
              setPhase('idle');
              void startMic();
            }}
          >
            Vale, entendido
          </Button>
        </div>
      )}

      {phase !== 'explain' && (
        <div className="flex flex-col items-center gap-3">
          {phase === 'recording' ? (
            <Button variant="primary" icon={<Square size={24} />} onClick={() => void stopRec()}>
              He terminado
            </Button>
          ) : (
            (sr || rec) && (
              <button
                type="button"
                onClick={() => void startMic()}
                disabled={phase === 'listening'}
                className={cn(
                  'grid h-24 w-24 place-items-center rounded-full bg-primary text-primary-ink shadow-[0_5px_0_rgb(0_0_0/0.2)]',
                  phase === 'listening' && 'animate-pulse',
                )}
                aria-label="Hablar"
              >
                <Mic size={44} aria-hidden />
              </button>
            )
          )}
          <p className="text-center text-lg font-bold">
            {phase === 'listening' ? 'Te escucho… di la frase' : phase === 'recording' ? 'Grabando… di la frase' : sr ? 'Toca el micro y di la frase' : rec ? 'Toca el micro y grábate' : ''}
          </p>
          {heard && <p className="text-center text-base text-ink-soft">{heard}</p>}
        </div>
      )}

      {phase === 'recorded' && recUrl && (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-3">
            <Button variant="secondary" block={false} size="md" onClick={() => void new Audio(recUrl).play()}>
              ▶️ Oír mi voz
            </Button>
            <Button variant="secondary" block={false} size="md" onClick={() => void say(ex.t, lang)}>
              🔊 Oír el modelo
            </Button>
          </div>
          <p className="text-center text-lg font-bold">¿Qué tal te ha salido?</p>
        </div>
      )}

      {(phase === 'recorded' || (!sr && !rec) || (phase === 'idle' && heard)) && (
        <div className="grid grid-cols-3 gap-2">
          <Button variant="good" size="md" onClick={() => finish({ ok: true, note: '¡Muy bien dicho!' })}>
            Bien
          </Button>
          <Button variant="pop" size="md" onClick={() => finish({ ok: true, note: 'Practicar un poco más te vendrá bien.' })}>
            Regular
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              setRecUrl(null);
              setHeard('');
              setPhase('idle');
              void say(ex.t, lang, { slow: true });
            }}
          >
            Repetir
          </Button>
        </div>
      )}
      {!sr && !rec && <p className="text-center text-base text-ink-soft">Escucha, repite en voz alta y dime qué tal te ha salido.</p>}
      {phase !== 'recording' && phase !== 'listening' && (
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => finish({ ok: true, note: 'Sin problema: la practicaremos en otro momento.' })}
            className="min-h-[48px] px-4 text-base font-bold text-ink-soft underline"
          >
            Ahora no puedo hablar
          </button>
        </div>
      )}
    </div>
  );
}
