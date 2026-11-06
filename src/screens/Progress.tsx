import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Award, CalendarPlus, Download, Settings as Cog, Upload } from 'lucide-react';
import type { Level } from '@/content/types';
import { LEVEL_LABEL, units } from '@/content/load';
import { courseFraction, levelDone, levelFraction, useProgress, useStreak } from '@/data/progress';
import { db } from '@/data/db';
import { readBackupFile, shareOrDownloadBackup } from '@/data/backup';
import { reloadFromDB, useProfile, useStore } from '@/data/settings';
import { downloadReminder } from '@/data/reminder';
import { Button, Emoji, Page, ProgressBar, SectionTitle, cn } from '@/ui/primitives';
import { Loading, useLang } from '@/ui/Loading';
import { PostStamp } from '@/art/en';

export default function Progress() {
  const lang = useLang();
  const nav = useNavigate();
  const p = useProgress(lang);
  const streak = useStreak(lang);
  const profile = useProfile();
  const setProfile = useStore((s) => s.setProfile);
  const badges = useLiveQuery(() => db.badges.where('lang').equals(lang).toArray(), [lang]) ?? [];
  const words = useLiveQuery(() => db.cards.where('[lang+kind]').equals([lang, 'v']).count(), [lang]) ?? 0;
  const days = useLiveQuery(() => db.days.where('lang').equals(lang).toArray(), [lang]) ?? [];
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  if (!p) return <Loading />;

  const levels = [...new Set(units(lang).map((u) => u.level))] as Level[];
  const totalMin = Math.round(days.reduce((s, d) => s + d.seconds, 0) / 60);
  const exercises = days.reduce((s, d) => s + d.exercises, 0);
  const last7 = Array.from({ length: 7 }, (_, k) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - k));
    const key = d.toISOString().slice(0, 10);
    const local = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const row = days.find((x) => x.day === local || x.day === key);
    return { label: d.toLocaleDateString('es-ES', { weekday: 'narrow' }), min: Math.round((row?.seconds ?? 0) / 60) };
  });
  const maxMin = Math.max(profile.minutes, ...last7.map((d) => d.min));
  const unitBadges = units(lang);

  return (
    <Page className="safe-top">
      <div className="flex items-center justify-between pt-5">
        <h1 className="font-display text-[2rem]">Mi progreso</h1>
        <button onClick={() => nav('/ajustes')} className="flex min-h-[48px] items-center gap-2 rounded-xl px-3 font-bold">
          <Cog size={24} aria-hidden /> Ajustes
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {[
          { e: '🔥', n: streak?.streak ?? 0, l: 'días seguidos' },
          { e: '📚', n: words, l: 'palabras aprendidas' },
          { e: '⏱️', n: totalMin, l: 'minutos en total' },
          { e: '✅', n: exercises, l: 'ejercicios hechos' },
        ].map((s) => (
          <div key={s.l} className="postcard p-4 text-center">
            <Emoji e={s.e} size={34} />
            <p className="text-[2rem] font-extrabold leading-tight">{s.n}</p>
            <p className="text-base font-bold text-ink-soft">{s.l}</p>
          </div>
        ))}
      </div>

      <SectionTitle>Esta semana</SectionTitle>
      <div className="postcard flex h-44 items-end justify-between gap-2 p-4" role="img" aria-label="Minutos practicados en los últimos 7 días">
        {last7.map((d, k) => (
          <div key={k} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-sm font-bold">{d.min || ''}</span>
            <div className="w-full rounded-t-lg bg-good" style={{ height: `${Math.max(4, (d.min / maxMin) * 96)}px`, opacity: d.min ? 1 : 0.25 }} />
            <span className="text-sm font-bold uppercase text-ink-soft">{d.label}</span>
          </div>
        ))}
      </div>

      <SectionTitle>Tu nivel</SectionTitle>
      <div className="space-y-3">
        <div className="postcard p-4">
          <p className="mb-2 text-lg font-extrabold">Todo el curso: {Math.round(courseFraction(lang, p) * 100)} %</p>
          <ProgressBar value={courseFraction(lang, p)} label="Todo el curso" />
        </div>
        {levels.map((lv) => {
          const done = levelDone(lang, lv, p);
          return (
            <div key={lv} className="postcard space-y-2 p-4">
              <div className="flex items-center justify-between">
                <p className="text-lg font-extrabold">{LEVEL_LABEL[lv]}</p>
                <span className="font-bold text-ink-soft">{Math.round(levelFraction(lang, lv, p) * 100)} %</span>
              </div>
              <ProgressBar value={levelFraction(lang, lv, p)} label={LEVEL_LABEL[lv]} />
              {done && lv !== 'A0' && (
                <Button variant="pop" size="md" icon={<Award size={22} />} onClick={() => nav(`/${lang}/certificado/${lv}`)}>
                  Ver mi certificado {lv}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <SectionTitle>Mis sellos</SectionTitle>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {unitBadges.map((u) => {
          const got = badges.some((b) => b.id === `challenge:${u.id}`);
          return (
            <div key={u.id} className={cn('flex flex-col items-center text-center', !got && 'opacity-40 grayscale')} title={u.challenge.badge}>
              <div className="relative">
                <PostStamp color={lang === 'en' ? '#D7262E' : '#2A7DB8'} size={78} />
                <span className="absolute inset-0 grid place-items-center">
                  <Emoji e={u.challenge.badgeEmoji} size={40} />
                </span>
              </div>
              <span className="mt-1 text-sm font-bold leading-tight">{u.challenge.badge}</span>
            </div>
          );
        })}
      </div>

      <SectionTitle>Recordatorio diario</SectionTitle>
      <div className="postcard space-y-3 p-4">
        <label className="flex items-center justify-between gap-3 text-lg font-bold">
          ¿A qué hora?
          <input
            type="time"
            value={profile.reminderTime}
            onChange={(e) => setProfile({ reminderTime: e.target.value })}
            className="min-h-[52px] rounded-xl border-2 border-line bg-surface px-3 text-lg"
          />
        </label>
        <Button variant="accent" icon={<CalendarPlus size={22} />} onClick={() => downloadReminder(profile.reminderTime, profile.minutes)}>
          Añadir recordatorio a mi calendario
        </Button>
        <p className="text-base text-ink-soft">Se abrirá el Calendario del iPhone con un aviso diario. Solo tienes que tocar «Añadir».</p>
      </div>

      <SectionTitle>Tu progreso, a salvo</SectionTitle>
      <div className="postcard space-y-3 p-4">
        <p className="text-base">Guarda una copia y mándatela por WhatsApp o guárdala en Archivos. Si cambias de móvil, la recuperas aquí.</p>
        <Button
          icon={<Download size={22} />}
          onClick={async () => {
            const r = await shareOrDownloadBackup();
            setMsg(r === 'cancelled' ? null : r === 'shared' ? '¡Copia compartida!' : 'Copia descargada. Está en la carpeta Descargas o en Archivos.');
          }}
        >
          Guardar copia de mi progreso
        </Button>
        <Button variant="secondary" icon={<Upload size={22} />} onClick={() => fileRef.current?.click()}>
          Recuperar copia
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            try {
              await readBackupFile(f);
              await reloadFromDB();
              setMsg('¡Progreso recuperado!');
            } catch (err) {
              setMsg((err as Error).message);
            }
            e.target.value = '';
          }}
        />
        {msg && (
          <p role="status" className="rounded-xl bg-good-soft p-3 text-lg font-bold">
            {msg}
          </p>
        )}
      </div>
    </Page>
  );
}
