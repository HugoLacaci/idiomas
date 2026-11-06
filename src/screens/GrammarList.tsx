import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskConical } from 'lucide-react';
import { LEVEL_LABEL, loadIndex, units, type ContentIndex } from '@/content/load';
import { Page, TopBar } from '@/ui/primitives';
import { Loading, useLang } from '@/ui/Loading';

export default function GrammarList() {
  const lang = useLang();
  const nav = useNavigate();
  const [idx, setIdx] = useState<ContentIndex | null>(null);
  useEffect(() => {
    void loadIndex(lang).then(setIdx);
  }, [lang]);
  if (!idx) return <Loading />;
  // en el orden del curso
  const order = [...new Set(units(lang).flatMap((u) => u.grammar))].filter((g) => idx.grammar[g]);
  const levels = [...new Set(order.map((g) => idx.grammar[g].level))];
  return (
    <div className="min-h-dvh">
      <TopBar title="Laboratorio de gramática" />
      <Page nav={false}>
        <p className="pt-2 text-lg text-ink-soft">Elige un punto para ver su explicación y practicarlo a fondo.</p>
        {levels.map((lv) => (
          <section key={lv}>
            <h2 className="font-display mt-6 mb-3 text-[1.5rem]">{LEVEL_LABEL[lv] ?? lv}</h2>
            <div className="space-y-3">
              {order
                .filter((g) => idx.grammar[g].level === lv)
                .map((g) => (
                  <button key={g} onClick={() => nav(`/${lang}/laboratorio/${g}`)} className="postcard flex w-full items-center gap-3 p-4 text-left active:translate-y-[2px]">
                    <FlaskConical className="shrink-0 text-accent" size={28} aria-hidden />
                    <span className="flex-1">
                      <span className="block text-[1.15rem] font-extrabold">{idx.grammar[g].title}</span>
                      <span className="block text-base text-ink-soft">{idx.grammar[g].short}</span>
                    </span>
                    <span className="text-sm font-bold text-ink-soft">{idx.grammar[g].n}</span>
                  </button>
                ))}
            </div>
          </section>
        ))}
      </Page>
    </div>
  );
}
