import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import gift from '@content/gift.json';
import type { Lang } from '@/content/types';
import { units } from '@/content/load';
import { db, TABLES } from '@/data/db';
import { exportBackup, shareOrDownloadBackup } from '@/data/backup';
import { DEFAULT_PROFILE, DEFAULT_SETTINGS, useProfile, useStore } from '@/data/settings';
import { Button, Page, SectionTitle, TopBar } from '@/ui/primitives';

/** Modo Hugo: oculto (5 toques en el logo de Ajustes + PIN de content/gift.json). */
export default function HugoMode() {
  const [pin, setPin] = useState('');
  const [ok, setOk] = useState(false);
  if (!ok)
    return (
      <div className="min-h-dvh">
        <TopBar title="🔒" back="/" />
        <Page nav={false} className="pt-10">
          <label className="block text-lg font-bold">
            PIN
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="mt-2 w-full rounded-2xl border-[3px] border-line bg-surface px-4 py-3 text-2xl tracking-[0.5em]"
              onKeyDown={(e) => e.key === 'Enter' && pin === String(gift.pin) && setOk(true)}
            />
          </label>
          <div className="mt-4">
            <Button onClick={() => setOk(pin === String(gift.pin))}>Entrar</Button>
          </div>
        </Page>
      </div>
    );
  return <HugoPanel />;
}

function HugoPanel() {
  const nav = useNavigate();
  const profile = useProfile();
  const setProfile = useStore((s) => s.setProfile);
  const replaceAll = useStore((s) => s.replaceAll);
  const [title, setTitle] = useState(profile.giftOverride?.title ?? gift.title);
  const [message, setMessage] = useState(profile.giftOverride?.message ?? gift.message);
  const [key, setKey] = useState(profile.ai.apiKey);
  const [model, setModel] = useState(profile.ai.model);
  const [msg, setMsg] = useState('');
  const stats = useLiveQuery(async () => {
    const out: Record<string, { lessons: number; words: number; minutes: number; days: number; last: string }> = {};
    for (const l of ['en', 'it'] as Lang[]) {
      const lessons = await db.lessons.where('lang').equals(l).count();
      const words = await db.cards.where('[lang+kind]').equals([l, 'v']).count();
      const days = await db.days.where('lang').equals(l).toArray();
      out[l] = {
        lessons,
        words,
        minutes: Math.round(days.reduce((s, d) => s + d.seconds, 0) / 60),
        days: days.length,
        last: days.map((d) => d.day).sort().at(-1) ?? '—',
      };
    }
    return out;
  }, []);

  return (
    <div className="min-h-dvh">
      <TopBar title="Modo Hugo" back="/" />
      <Page nav={false}>
        <SectionTitle className="mt-2">Progreso de {profile.name}</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          {(['en', 'it'] as Lang[]).map((l) => (
            <div key={l} className="postcard p-4 text-base">
              <p className="text-lg font-extrabold">{l === 'en' ? '🇬🇧 Inglés' : '🇮🇹 Italiano'}</p>
              <p>Lecciones: {stats?.[l].lessons ?? 0} / {units(l).flatMap((u) => u.lessons).length}</p>
              <p>Palabras: {stats?.[l].words ?? 0}</p>
              <p>Minutos: {stats?.[l].minutes ?? 0} · Días: {stats?.[l].days ?? 0}</p>
              <p>Último día: {stats?.[l].last}</p>
              <label className="mt-2 flex items-center gap-2 font-bold">
                <input type="checkbox" className="h-6 w-6" checked={!!profile.unlockAll[l]} onChange={(e) => setProfile({ unlockAll: { ...profile.unlockAll, [l]: e.target.checked } })} />
                Desbloquear todas las unidades
              </label>
            </div>
          ))}
        </div>

        <SectionTitle>Mensaje de cumpleaños</SectionTitle>
        <div className="space-y-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border-2 border-line bg-surface p-3" aria-label="Título" />
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={6} className="w-full rounded-xl border-2 border-line bg-surface p-3" aria-label="Mensaje" />
          <Button size="md" onClick={() => { setProfile({ giftOverride: { title, message } }); setMsg('Mensaje guardado en este dispositivo.'); }}>
            Guardar mensaje
          </Button>
          <Button size="md" variant="secondary" onClick={() => { setProfile({ giftSeen: false }); nav('/regalo'); }}>
            Volver a ver la felicitación
          </Button>
          <p className="text-sm text-ink-soft">Para cambiarlo para siempre (y la foto), edita content/gift.json y public/gift/ y vuelve a publicar.</p>
        </div>

        <SectionTitle>Tutor con IA (opcional)</SectionTitle>
        <div className="space-y-3 text-base">
          <p>
            Usa la API de Gemini de Google (tiene nivel gratuito). Crea una clave en{' '}
            <a className="font-bold text-accent underline" href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">
              aistudio.google.com/apikey
            </a>
            . Los límites y condiciones cambian:{' '}
            <a className="font-bold text-accent underline" href="https://ai.google.dev/gemini-api/docs/rate-limits" target="_blank" rel="noreferrer">
              consúltalos aquí
            </a>
            . Ojo: en el nivel gratuito Google puede usar las conversaciones para mejorar sus productos, y sus condiciones
            exigen el nivel de pago cuando la app se usa desde el Espacio Económico Europeo, Suiza o el Reino Unido
            (revísalas antes de activarlo). La web funciona entera sin el tutor.
          </p>
          <input value={key} onChange={(e) => setKey(e.target.value)} placeholder="Clave de API" className="w-full rounded-xl border-2 border-line bg-surface p-3" autoComplete="off" />
          <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Modelo" className="w-full rounded-xl border-2 border-line bg-surface p-3" />
          <label className="flex items-center gap-2 font-bold">
            <input type="checkbox" className="h-6 w-6" checked={profile.ai.enabled} onChange={(e) => setProfile({ ai: { ...profile.ai, enabled: e.target.checked } })} />
            Activar el tutor de IA
          </label>
          <Button size="md" onClick={() => { setProfile({ ai: { ...profile.ai, apiKey: key.trim(), model: model.trim() || 'gemini-2.5-flash' } }); setMsg('Tutor guardado.'); }}>
            Guardar tutor
          </Button>
        </div>

        <SectionTitle>Datos</SectionTitle>
        <div className="space-y-3">
          <Button size="md" variant="secondary" onClick={() => void shareOrDownloadBackup()}>
            Exportar todos los datos
          </Button>
          <Button
            size="md"
            variant="secondary"
            onClick={async () => {
              const d = await exportBackup();
              await navigator.clipboard?.writeText(JSON.stringify(d));
              setMsg('Datos copiados al portapapeles.');
            }}
          >
            Copiar datos al portapapeles
          </Button>
          <Button
            size="md"
            variant="primary"
            onClick={async () => {
              if (!window.confirm('¿Seguro? Se borrará todo el progreso de los dos idiomas.')) return;
              await Promise.all(TABLES.map((t) => db.table(t).clear()));
              replaceAll(DEFAULT_SETTINGS, DEFAULT_PROFILE);
              nav('/regalo', { replace: true });
            }}
          >
            Reiniciar todo
          </Button>
        </div>
        {msg && <p role="status" className="mt-4 rounded-xl bg-good-soft p-3 font-bold">{msg}</p>}
      </Page>
    </div>
  );
}
