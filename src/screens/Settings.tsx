import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings, useStore, type Settings as S } from '@/data/settings';
import { say, systemVoicesFor, unlockAudio } from '@/audio/voice';
import { playCorrect } from '@/audio/sfx';
import { isStandalone, canRecognize } from '@/audio/speech';
import { Button, Page, SectionTitle, TopBar, cn } from '@/ui/primitives';
import { Logo } from '@/ui/Logo';

function Seg<T extends string | number | boolean>({ value, options, onChange, label }: { value: T; options: { v: T; l: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }}>
      {options.map((o) => (
        <button
          key={String(o.v)}
          role="radio"
          aria-checked={value === o.v}
          onClick={() => onChange(o.v)}
          className={cn('min-h-[56px] rounded-2xl border-[3px] px-2 text-base font-extrabold', value === o.v ? 'border-primary bg-primary-soft' : 'border-line bg-surface')}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}

function Toggle({ label, sub, checked, onChange }: { label: string; sub?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex min-h-[64px] w-full items-center gap-3 text-left">
      <span className="flex-1">
        <span className="block text-lg font-extrabold">{label}</span>
        {sub && <span className="block text-base text-ink-soft">{sub}</span>}
      </span>
      <span className={cn('relative h-9 w-16 shrink-0 rounded-full transition-colors', checked ? 'bg-good' : 'bg-line')}>
        <span className={cn('absolute top-1 h-7 w-7 rounded-full bg-white shadow transition-all', checked ? 'left-8' : 'left-1')} />
      </span>
    </button>
  );
}

export default function Settings() {
  const s = useSettings();
  const set = useStore((st) => st.setSettings);
  const nav = useNavigate();
  const [voices, setVoices] = useState<{ en: number; it: number }>({ en: 0, it: 0 });
  useEffect(() => {
    const upd = () => setVoices({ en: systemVoicesFor('en-GB').length, it: systemVoicesFor('it-IT').length });
    upd();
    const t = setTimeout(upd, 800);
    return () => clearTimeout(t);
  }, []);
  const up = <K extends keyof S>(k: K) => (v: S[K]) => set({ [k]: v } as Partial<S>);

  return (
    <div className="min-h-dvh">
      <TopBar title="Ajustes" />
      <Page nav={false}>
        <SectionTitle className="mt-2">Letra y colores</SectionTitle>
        <div className="postcard space-y-4 p-4">
          <p className="text-lg font-extrabold">Tamaño de la letra</p>
          <Seg label="Tamaño de la letra" value={s.fontSize} onChange={up('fontSize')} options={[{ v: 'normal', l: 'Normal' }, { v: 'grande', l: 'Grande' }, { v: 'muy-grande', l: 'Muy grande' }]} />
          <Toggle label="Alto contraste" sub="Texto más negro y fondos más claros" checked={s.contrast} onChange={up('contrast')} />
          <Toggle label="Modo oscuro" sub="Fondo oscuro, mejor de noche" checked={s.dark} onChange={up('dark')} />
          <Toggle label="Reducir animaciones" sub="Sin confeti ni movimientos" checked={s.reduceMotion} onChange={up('reduceMotion')} />
        </div>

        <SectionTitle>Voz y sonido</SectionTitle>
        <div className="postcard space-y-4 p-4">
          <p className="text-lg font-extrabold">Velocidad de la voz</p>
          <Seg label="Velocidad de la voz" value={s.voiceRate} onChange={(v) => { up('voiceRate')(v); unlockAudio(); setTimeout(() => void say('Hello! Nice to meet you.', 'en'), 50); }} options={[{ v: 0.8, l: 'Lenta' }, { v: 0.9, l: 'Tranquila' }, { v: 1, l: 'Normal' }]} />
          <p className="text-lg font-extrabold">Acento del inglés</p>
          <Seg label="Acento del inglés" value={s.enAccent} onChange={(v) => { up('enAccent')(v); setTimeout(() => void say('Hello! How are you today?', 'en'), 50); }} options={[{ v: 'gb', l: '🇬🇧 Británico' }, { v: 'us', l: '🇺🇸 Americano' }]} />
          <p className="text-lg font-extrabold">Voz</p>
          <Seg label="Voz" value={s.voiceGender} onChange={(v) => { up('voiceGender')(v); setTimeout(() => void say('Ciao! Come stai?', 'it'), 50); }} options={[{ v: 'f', l: 'De mujer' }, { v: 'm', l: 'De hombre' }]} />
          <Toggle label="Leer las instrucciones en voz alta" sub="Al empezar cada ejercicio" checked={s.readInstructions} onChange={up('readInstructions')} />
          <Toggle label="Sonidos al acertar y fallar" checked={s.sounds} onChange={(v) => { up('sounds')(v); if (v) setTimeout(playCorrect, 50); }} />
          {s.sounds && (
            <label className="block">
              <span className="text-lg font-extrabold">Volumen de los sonidos</span>
              <input type="range" min={0.05} max={0.8} step={0.05} value={s.soundVolume} onChange={(e) => up('soundVolume')(Number(e.target.value))} onPointerUp={() => playCorrect()} className="mt-2 h-10 w-full accent-[rgb(var(--primary))]" />
            </label>
          )}
        </div>

        <SectionTitle>Voces del iPhone</SectionTitle>
        <div className="postcard space-y-2 p-4 text-[1.05rem]">
          <p>
            Casi todo tiene audio grabado. Para lo que no, se usa la voz del teléfono. Para que suene mejor, descarga las voces «mejoradas»:
          </p>
          <ol className="list-decimal space-y-1 pl-6">
            <li>Abre <strong>Ajustes</strong> del iPhone.</li>
            <li>Toca <strong>Accesibilidad › Contenido leído › Voces</strong>.</li>
            <li>Elige <strong>Inglés</strong> y descarga una voz «Mejorada» (por ejemplo, Serena o Daniel).</li>
            <li>Haz lo mismo con <strong>Italiano</strong> (por ejemplo, Alice o Federica).</li>
          </ol>
          <p className="text-base text-ink-soft">
            Voces encontradas en este dispositivo: inglés {voices.en}, italiano {voices.it}. Reconocimiento de voz: {canRecognize() ? 'disponible' : 'no disponible (se usa grabarse y comparar)'}.
            {isStandalone() ? ' App instalada en la pantalla de inicio.' : ''}
          </p>
        </div>

        <SectionTitle>Más</SectionTitle>
        <div className="space-y-3">
          <Button variant="secondary" onClick={() => nav('/instalar')}>Poner la app en la pantalla de inicio</Button>
          <Button variant="secondary" onClick={() => nav('/ayuda')}>Ayuda</Button>
          <Button variant="secondary" onClick={() => nav('/creditos')}>Créditos y licencias</Button>
        </div>
        <div className="mt-8 flex justify-center">
          <Logo />
        </div>
      </Page>
    </div>
  );
}
