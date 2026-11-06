import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Star } from 'lucide-react';
import { loadIndex, type ContentIndex } from '@/content/load';
import { db } from '@/data/db';
import { AudioButtons, Button, Emoji, Page, TopBar } from '@/ui/primitives';
import { Loading, MascotTip, useLang } from '@/ui/Loading';

export default function Favorites() {
  const lang = useLang();
  const nav = useNavigate();
  const favs = useLiveQuery(() => db.favorites.where('lang').equals(lang).reverse().sortBy('at'), [lang]);
  const [idx, setIdx] = useState<ContentIndex | null>(null);
  useEffect(() => {
    void loadIndex(lang).then(setIdx);
  }, [lang]);
  if (!favs || !idx) return <Loading />;
  const items = favs.map((f) => idx.vocab[f.ref]).filter(Boolean);
  return (
    <div className="min-h-dvh">
      <TopBar title="Mis palabras favoritas" />
      <Page nav={false}>
        {items.length === 0 ? (
          <MascotTip lang={lang} className="mt-4">
            Aún no has guardado ninguna. En las lecciones, toca la ⭐ de una palabra para guardarla aquí.
          </MascotTip>
        ) : (
          <>
            <div className="mt-2">
              <Button onClick={() => nav(`/${lang}/repasar?modo=favoritas`)}>Repasar mis favoritas</Button>
            </div>
            <ul className="mt-4 space-y-3">
              {items.map((v) => (
                <li key={v.id} className="postcard flex items-center gap-3 p-3">
                  <Emoji e={v.emoji ?? '📘'} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[1.2rem] font-extrabold" lang={lang}>
                      {v.t}
                    </p>
                    <p className="text-base text-ink-soft">{v.es}</p>
                  </div>
                  <AudioButtons text={v.t} lang={lang} size="sm" slow={false} />
                  <button aria-label="Quitar de favoritas" onClick={() => db.favorites.delete([lang, v.id])} className="grid h-12 w-12 place-items-center">
                    <Star className="fill-pop text-pop" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </Page>
    </div>
  );
}
