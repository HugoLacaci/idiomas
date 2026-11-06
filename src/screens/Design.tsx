import { useState } from 'react';
import type { Lang } from '@/content/types';
import { ExerciseView } from '@/exercises/ExerciseView';
import { OptionButton } from '@/exercises/bodies';
import { useSettings, useStore } from '@/data/settings';
import { AudioButtons, Button, Card, Emoji, Pill, ProgressBar, Rich, TopBar } from '@/ui/primitives';
import { Mascot, MascotTip } from '@/ui/Loading';
import { BigBen, Bus, Cab, Kangaroo, MapleLeaf, PhoneBox, PostStamp, TeaCup, Umbrella, YellowCab } from '@/art/en';
import { Colosseum, Duomo, Espresso, Gondola, Lemon, Pisa, Tile, Vespa } from '@/art/it';
import type { Exercise } from '@/engine/session';

const SAMPLE: Record<Lang, Exercise> = {
  en: { id: 'd1', type: 'choose', q: 'She ___ my daughter.', es: 'Ella es mi hija.', options: ['am', 'is', 'are'], answer: 'is', why: 'Con **she** usamos ==is==.', g: 'en-g-to-be' },
  it: { id: 'd2', type: 'choose', q: '___ acqua è fredda.', es: 'El agua está fría.', options: ['Il', 'La', "L'"], answer: "L'", why: 'Delante de vocal, el artículo es ==l\'==.' },
};

const SWATCHES = ['bg', 'surface', 'surface-2', 'ink', 'ink-soft', 'primary', 'accent', 'pop', 'good', 'bad', 'line'];

function Theme({ lang }: { lang: Lang }) {
  const [sel, setSel] = useState<string | null>('b');
  return (
    <section data-lang={lang} className="space-y-5 rounded-3xl bg-bg p-4 text-ink ring-2 ring-line">
      <h2 className="font-display text-[2rem]">{lang === 'en' ? 'London & beyond 🇬🇧' : 'La dolce vita 🇮🇹'}</h2>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {SWATCHES.map((s) => (
          <div key={s} className="text-center text-xs font-bold">
            <div className="h-12 rounded-xl border border-line" style={{ background: `rgb(var(--${s}))` }} />
            {s}
          </div>
        ))}
      </div>
      <p className="font-display text-[2.2rem] leading-tight">Titular 34 px</p>
      <p className="text-[1.4rem] font-extrabold">Subtítulo 24 px</p>
      <p className="text-base">Texto base (18–20 px). <Rich text="I ==am== · you ==are== · she ==is==" /></p>
      <div className="space-y-2">
        <Button>Continuar</Button>
        <Button variant="accent">Acción secundaria</Button>
        <Button variant="secondary">Secundario</Button>
        <Button variant="pop">Destacado</Button>
        <Button disabled>Desactivado</Button>
      </div>
      <div className="grid gap-2">
        <OptionButton selected={sel === 'a'} onClick={() => setSel('a')}>Normal</OptionButton>
        <OptionButton selected={sel === 'b'} onClick={() => setSel('b')}>Seleccionada</OptionButton>
        <OptionButton state="ok" onClick={() => {}}>Correcta</OptionButton>
        <OptionButton state="bad" onClick={() => {}}>Incorrecta</OptionButton>
      </div>
      <Card>
        <div className="flex items-center gap-3">
          <Emoji e={lang === 'en' ? '☕' : '🍋'} size={52} />
          <div className="flex-1">
            <p className="text-lg font-extrabold">Tarjeta {lang === 'en' ? 'postal' : 'de baldosa'}</p>
            <ProgressBar value={0.6} />
          </div>
          <AudioButtons text={lang === 'en' ? 'A cup of tea' : 'Un caffè'} lang={lang} size="sm" />
        </div>
      </Card>
      <div className="ticket p-4 text-lg font-bold">Ticket (situaciones y frases útiles)</div>
      <div className="flex flex-wrap gap-2">
        <Pill>A1 · Principiante</Pill>
        <Pill>⏱️ 5 min</Pill>
      </div>
      <MascotTip lang={lang}>Hola, soy {lang === 'en' ? 'Percy' : 'Lina'}. Te doy ánimos y pistas.</MascotTip>
      <div className="flex flex-wrap items-end gap-3">
        <Mascot lang={lang} mood="happy" />
        <Mascot lang={lang} mood="think" />
        <Mascot lang={lang} mood="cheer" />
      </div>
      <div className="flex flex-wrap items-end gap-4 rounded-2xl bg-surface p-3">
        {lang === 'en' ? (
          <>
            <Bus className="w-32" />
            <BigBen className="h-32" />
            <PhoneBox className="h-24" />
            <Cab className="w-28" />
            <TeaCup className="w-24" />
            <Umbrella className="w-20" />
            <YellowCab className="w-28" />
            <Kangaroo className="w-20" />
            <MapleLeaf className="w-16" />
          </>
        ) : (
          <>
            <Lemon className="w-24" />
            <Vespa className="w-32" />
            <Espresso className="w-20" />
            <Colosseum className="w-36" />
            <Pisa className="h-32" />
            <Gondola className="w-32" />
            <Duomo className="w-28" />
            <Tile size={64} />
          </>
        )}
        <PostStamp color={lang === 'en' ? '#D7262E' : '#2A7DB8'} size={64} />
      </div>
      <div className="relative min-h-[520px] overflow-hidden rounded-2xl border-2 border-dashed border-line p-3 [transform:translateZ(0)]">
        <p className="mb-2 text-sm font-bold text-ink-soft">Ejercicio de ejemplo (pulsa Comprobar)</p>
        <ExerciseView ex={SAMPLE[lang]} lang={lang} onDone={() => {}} />
      </div>
    </section>
  );
}

/** Guía de estilo viva: los dos temas, componentes y estados. */
export default function Design() {
  const s = useSettings();
  const set = useStore((st) => st.setSettings);
  return (
    <div className="min-h-dvh">
      <TopBar title="Guía de estilo" back="/" right={<button className="min-h-[48px] px-2 font-bold" onClick={() => set({ dark: !s.dark })}>{s.dark ? '☀️' : '🌙'}</button>} />
      <main className="mx-auto grid max-w-[1200px] gap-6 px-4 pb-16 lg:grid-cols-2">
        <Theme lang="en" />
        <Theme lang="it" />
      </main>
    </div>
  );
}
