import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { FlaskConical, Mic, MessageCircle, PlayCircle, Repeat, Sparkles, Star, Timer, Zap } from 'lucide-react';
import { dueCount, hardWords } from '@/engine/srs';
import { db } from '@/data/db';
import { useProfile } from '@/data/settings';
import { Page, cn } from '@/ui/primitives';
import { useLang } from '@/ui/Loading';

function Tile({ icon, title, sub, onClick, tone = 'surface', disabled }: { icon: React.ReactNode; title: string; sub?: string; onClick: () => void; tone?: 'surface' | 'primary' | 'accent' | 'pop'; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex min-h-[88px] w-full items-center gap-4 rounded-3xl p-4 text-left shadow-[0_4px_0_rgb(0_0_0/0.15)] active:translate-y-[2px] disabled:opacity-50',
        tone === 'primary' && 'bg-primary text-primary-ink',
        tone === 'accent' && 'bg-accent text-accent-ink',
        tone === 'pop' && 'bg-pop text-pop-ink',
        tone === 'surface' && 'postcard',
      )}
    >
      <span className="shrink-0">{icon}</span>
      <span>
        <span className="block text-[1.2rem] font-extrabold leading-tight">{title}</span>
        {sub && <span className="block text-base opacity-90">{sub}</span>}
      </span>
    </button>
  );
}

export default function Practice() {
  const lang = useLang();
  const nav = useNavigate();
  const profile = useProfile();
  const due = useLiveQuery(() => dueCount(lang), [lang]) ?? 0;
  const hard = useLiveQuery(() => hardWords(lang), [lang]) ?? [];
  const favs = useLiveQuery(() => db.favorites.where('lang').equals(lang).count(), [lang]) ?? 0;
  const known = useLiveQuery(() => db.cards.where('[lang+kind]').equals([lang, 'v']).count(), [lang]) ?? 0;
  const tutor = lang === 'en' ? 'Emma' : 'Giulia';

  return (
    <Page className="safe-top">
      <h1 className="font-display pt-5 text-[2rem]">Practicar</h1>
      <p className="mt-1 text-lg text-ink-soft">Elige lo que te apetezca.</p>
      <div className="mt-5 grid gap-3">
        <Tile tone="primary" icon={<Repeat size={34} />} title={due ? `Repasar (${due})` : 'Repasar'} sub={due ? 'Las palabras que toca repasar hoy' : 'Hoy no hay nada pendiente: puedes repasar igualmente'} onClick={() => nav(`/${lang}/repasar`)} disabled={known === 0} />
        <Tile tone="pop" icon={<Timer size={34} />} title="Práctica rápida de 5 minutos" sub="Un poco de todo lo que has aprendido" onClick={() => nav(`/${lang}/repasar?modo=rapida`)} disabled={known === 0} />
        <Tile icon={<Zap size={34} className="text-primary" />} title="Palabras que se te resisten" sub={hard.length ? `${hard.length} palabras para practicar` : 'Aún no hay ninguna. ¡Bien!'} onClick={() => nav(`/${lang}/repasar?modo=dificiles`)} disabled={!hard.length} />
        <Tile icon={<Star size={34} className="fill-pop text-pop" />} title="Mis palabras favoritas" sub={favs ? `${favs} guardadas` : 'Toca ⭐ en una palabra para guardarla'} onClick={() => nav(`/${lang}/favoritas`)} />
        <Tile icon={<FlaskConical size={34} className="text-accent" />} title="Laboratorio de gramática" sub="Practica a fondo un solo punto" onClick={() => nav(`/${lang}/gramatica`)} />
        <Tile icon={<Mic size={34} className="text-accent" />} title="Pronunciación" sub="Sonidos difíciles, escuchar y repetir" onClick={() => nav(`/${lang}/pronunciacion`)} />
        <Tile icon={<MessageCircle size={34} className="text-accent" />} title={`Charla con ${tutor}`} sub="Conversaciones para practicar" onClick={() => nav(`/${lang}/charla/lista`)} />
        <Tile icon={<PlayCircle size={34} className="text-primary" />} title="Vídeos" sub="Vídeos cortos por nivel, con preguntas" onClick={() => nav(`/${lang}/videos`)} />
        {profile.ai.enabled && profile.ai.apiKey && (
          <Tile icon={<Sparkles size={34} className="text-primary" />} title={`Hablar libremente con ${tutor}`} sub="Tutor con inteligencia artificial" onClick={() => nav(`/${lang}/tutor`)} />
        )}
      </div>
    </Page>
  );
}
