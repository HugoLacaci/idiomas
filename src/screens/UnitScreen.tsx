import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, FlaskConical, MessageCircle, Play, Star, Trophy } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { LEVEL_LABEL, loadIndex, unitById, type ContentIndex } from '@/content/load';
import { unitDone, unitOpen, useProgress } from '@/data/progress';
import { db } from '@/data/db';
import { Button, Card, Emoji, Page, Photo, TopBar, cn } from '@/ui/primitives';
import { Loading, MascotTip, useLang } from '@/ui/Loading';

export default function UnitScreen() {
  const lang = useLang();
  const { unitId } = useParams();
  const nav = useNavigate();
  const u = unitById(lang, unitId!);
  const p = useProgress(lang);
  const [idx, setIdx] = useState<ContentIndex | null>(null);
  const [force, setForce] = useState(false);
  const badge = useLiveQuery(() => db.badges.get([lang, `challenge:${unitId}`]), [lang, unitId]);
  useEffect(() => {
    void loadIndex(lang).then(setIdx);
  }, [lang]);
  if (!u) return <Loading text="No encuentro esta unidad" />;
  if (!p || !idx) return <Loading />;
  const open = unitOpen(lang, u, p) || force;
  const done = unitDone(u, p);
  const firstPending = u.lessons.find((l) => !p.get(l)?.done);

  return (
    <div className="min-h-dvh">
      <TopBar title={u.stop.name} back={`/${lang}/lecciones`} />
      <Page nav={false}>
        <div className="postcard overflow-hidden p-0">
          <Photo
            k={u.stop.photo}
            ratio="16 / 9"
            eager
            fallback={
              <div className="grid aspect-[16/9] place-items-center bg-surface-2">
                <Emoji e={u.emoji} size={110} />
              </div>
            }
          />
          <div className="p-5">
            <p className="text-sm font-extrabold tracking-wide text-primary uppercase">
              {LEVEL_LABEL[u.level]} · Unidad {u.n}
            </p>
            <h1 className="font-display text-[2rem] leading-tight">{u.title}</h1>
            <p className="mt-2 text-base text-ink-soft">
              📍 <strong>{u.stop.name}:</strong> {u.stop.curiosity}
            </p>
          </div>
        </div>

        {!open ? (
          <div className="mt-6 space-y-3">
            <MascotTip lang={lang} mood="think">
              Esta parada se abre al terminar la anterior. ¡Pero si quieres echar un vistazo, adelante!
            </MascotTip>
            <Button variant="secondary" onClick={() => setForce(true)}>
              Abrirla igualmente
            </Button>
          </div>
        ) : (
          <>
            <h2 className="font-display mt-7 mb-3 text-[1.5rem]">Lecciones</h2>
            <ol className="space-y-3">
              {u.lessons.map((lid, k) => {
                const info = idx.lessons[lid];
                const lp = p.get(lid);
                const isNext = lid === firstPending;
                return (
                  <li key={lid}>
                    <button
                      onClick={() => nav(`/${lang}/leccion/${lid}`)}
                      className={cn('postcard flex w-full items-center gap-3 p-4 text-left active:translate-y-[2px]', isNext && 'ring-4 ring-pop')}
                    >
                      <span className={cn('grid h-12 w-12 shrink-0 place-items-center rounded-full text-lg font-extrabold', lp?.done ? 'bg-good text-white' : 'bg-surface-2')}>
                        {lp?.done ? <Check aria-label="Hecha" /> : k + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[1.15rem] leading-tight font-extrabold">{info?.title ?? `Lección ${k + 1}`}</span>
                        {lp?.done ? (
                          <span className="mt-1 flex gap-0.5" aria-label={`${lp.stars} estrellas`}>
                            {[1, 2, 3].map((s) => (
                              <Star key={s} size={18} className={s <= lp.stars ? 'fill-pop text-pop' : 'text-line'} aria-hidden />
                            ))}
                          </span>
                        ) : (
                          isNext && <span className="text-base font-bold text-primary">Siguiente ➜</span>
                        )}
                      </span>
                      {info?.emoji && <Emoji e={info.emoji} size={40} />}
                    </button>
                  </li>
                );
              })}
            </ol>

            {firstPending && (
              <div className="mt-5">
                <Button icon={<Play size={22} fill="currentColor" />} onClick={() => nav(`/${lang}/leccion/${firstPending}`)}>
                  {u.lessons.some((l) => p.get(l)?.done) ? 'Continuar' : 'Empezar la unidad'}
                </Button>
              </div>
            )}

            <h2 className="font-display mt-8 mb-3 text-[1.5rem]">Más práctica</h2>
            <div className="space-y-3">
              {u.grammar.map((g) => (
                <Card key={g} onClick={() => nav(`/${lang}/laboratorio/${g}`)} className="flex items-center gap-3">
                  <FlaskConical className="shrink-0 text-accent" size={30} aria-hidden />
                  <span className="flex-1">
                    <span className="block text-sm font-extrabold text-ink-soft uppercase">Laboratorio de gramática</span>
                    <span className="block text-[1.1rem] font-extrabold">{idx.grammar[g]?.title ?? g}</span>
                  </span>
                </Card>
              ))}
              {(u.chats ?? []).map((c) => (
                <Card key={c} onClick={() => nav(`/${lang}/charla/${c}`)} className="flex items-center gap-3">
                  <MessageCircle className="shrink-0 text-accent" size={30} aria-hidden />
                  <span className="flex-1">
                    <span className="block text-sm font-extrabold text-ink-soft uppercase">Charla con {lang === 'en' ? 'Emma' : 'Giulia'}</span>
                    <span className="block text-[1.1rem] font-extrabold">{idx.chats[c]?.title ?? 'Conversación'}</span>
                  </span>
                  {idx.chats[c]?.emoji && <Emoji e={idx.chats[c].emoji} size={36} />}
                </Card>
              ))}
              <Card onClick={() => nav(`/${lang}/reto/${u.id}`)} className={cn('flex items-center gap-3', !done && 'opacity-80')}>
                <Trophy className="shrink-0 text-primary" size={30} aria-hidden />
                <span className="flex-1">
                  <span className="block text-sm font-extrabold text-ink-soft uppercase">Repaso y mini-reto</span>
                  <span className="block text-[1.1rem] font-extrabold">{u.challenge.title}</span>
                  {!done && <span className="block text-base text-ink-soft">Mejor al terminar las lecciones</span>}
                </span>
                <Emoji e={u.challenge.badgeEmoji} size={40} className={badge ? '' : 'grayscale'} label={badge ? 'Insignia conseguida' : 'Insignia sin conseguir'} />
              </Card>
            </div>
          </>
        )}
      </Page>
    </div>
  );
}
