import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LevelTestItem } from '@/content/types';
import { loadLevelTest, unitById, units } from '@/content/load';
import { useStore } from '@/data/settings';
import { Button, Page, ProgressBar, TopBar } from '@/ui/primitives';
import { OptionButton } from '@/exercises/bodies';
import { Loading, Mascot, useLang } from '@/ui/Loading';

const ORDER = ['A1', 'A2', 'B1'] as const;

/**
 * Prueba de nivel adaptativa (≈15 ítems): empieza en A1; 2 aciertos seguidos suben de nivel,
 * 2 fallos en un nivel lo cierran. La unidad de inicio es la primera cuyo contenido ha fallado.
 */
export function placement(answers: { item: LevelTestItem; ok: boolean }[], unitIds: string[]) {
  const failed = answers.filter((a) => !a.ok).map((a) => unitIds.indexOf(a.item.unit)).filter((i) => i >= 0);
  if (!failed.length) {
    const lastOk = answers.filter((a) => a.ok).map((a) => unitIds.indexOf(a.item.unit));
    return unitIds[Math.min(unitIds.length - 1, Math.max(0, ...lastOk) + 1)];
  }
  return unitIds[Math.min(...failed)];
}

export default function LevelTest() {
  const lang = useLang();
  const nav = useNavigate();
  const setProfile = useStore((s) => s.setProfile);
  const profile = useStore((s) => s.profile);
  const [items, setItems] = useState<LevelTestItem[] | null>(null);
  const [answers, setAnswers] = useState<{ item: LevelTestItem; ok: boolean }[]>([]);
  const [sel, setSel] = useState<string | null>(null);
  const [level, setLevel] = useState(0);
  const [streak, setStreak] = useState(0);
  const [misses, setMisses] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(() => {
    void loadLevelTest(lang).then(setItems);
  }, [lang]);

  const current = useMemo(() => {
    if (!items) return null;
    const used = new Set(answers.map((a) => a.item.id));
    return items.find((i) => i.level === ORDER[level] && !used.has(i.id)) ?? null;
  }, [items, answers, level]);

  useEffect(() => {
    if (items && !done && (!current || answers.length >= 15)) setDone(true);
  }, [items, current, answers.length, done]);

  if (!items) return <Loading />;
  const unitIds = units(lang).map((u) => u.id);
  const start = done ? placement(answers, unitIds) : undefined;
  const startUnit = start ? unitById(lang, start) : undefined;

  const answer = (choice: string | null) => {
    if (!current) return;
    const ok = choice === current.answer;
    const next = [...answers, { item: current, ok }];
    setAnswers(next);
    setSel(null);
    if (ok) {
      const s = streak + 1;
      setStreak(s);
      if (s >= 3 && level < ORDER.length - 1) {
        setLevel(level + 1);
        setStreak(0);
        setMisses(0);
      }
    } else {
      setStreak(0);
      const m = misses + 1;
      setMisses(m);
      if (m >= 3) setDone(true);
    }
  };

  if (done)
    return (
      <div className="min-h-dvh">
        <TopBar title="Prueba de nivel" back={`/${lang}`} />
        <Page nav={false} className="space-y-5 pt-6 text-center">
          <div className="flex justify-center">
            <Mascot lang={lang} mood="cheer" size={130} />
          </div>
          <h1 className="font-display text-[2rem]">¡Prueba terminada!</h1>
          <p className="text-lg">
            Has acertado {answers.filter((a) => a.ok).length} de {answers.length}. Te propongo empezar en:
          </p>
          {startUnit && (
            <div className="postcard p-4">
              <p className="text-sm font-extrabold text-primary uppercase">{startUnit.level} · {startUnit.stop.name}</p>
              <p className="text-[1.3rem] font-extrabold">{startUnit.title}</p>
            </div>
          )}
          <Button
            onClick={() => {
              if (start) setProfile({ startUnit: { ...profile.startUnit, [lang]: start } });
              nav(`/${lang}`, { replace: true });
            }}
          >
            ¡Perfecto, empiezo ahí!
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setProfile({ startUnit: { ...profile.startUnit, [lang]: undefined } });
              nav(`/${lang}`, { replace: true });
            }}
          >
            Prefiero empezar desde el principio
          </Button>
          <p className="text-base text-ink-soft">Las unidades anteriores quedan abiertas por si quieres repasarlas.</p>
        </Page>
      </div>
    );

  if (!current) return <Loading />;
  return (
    <div className="min-h-dvh">
      <TopBar title="Prueba de nivel" back={`/${lang}`} />
      <Page nav={false} className="space-y-5 pb-40">
        <ProgressBar value={answers.length / 15} label="Avance de la prueba" />
        <p className="text-base font-bold text-ink-soft">Pregunta {answers.length + 1} · sin prisa</p>
        <p className="font-display text-[1.6rem] leading-snug" lang={lang}>
          {current.q}
        </p>
        {current.es && <p className="text-base text-ink-soft">«{current.es}»</p>}
        <div className="grid gap-3">
          {current.options.map((o) => (
            <OptionButton key={o} lang={lang} selected={sel === o} onClick={() => setSel(o)}>
              {o}
            </OptionButton>
          ))}
        </div>
      </Page>
      <div className="safe-bottom fixed inset-x-0 bottom-0 border-t-2 border-line bg-bg/95">
        <div className="mx-auto max-w-[720px] space-y-2 p-4">
          <Button disabled={!sel} onClick={() => answer(sel)}>
            Siguiente
          </Button>
          <Button variant="ghost" onClick={() => answer(null)}>
            No lo sé
          </Button>
        </div>
      </div>
    </div>
  );
}
