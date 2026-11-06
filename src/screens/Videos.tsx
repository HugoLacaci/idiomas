import { useEffect, useState } from 'react';
import type { Video } from '@/content/types';
import { LEVEL_LABEL, loadVideos } from '@/content/load';
import { Button, Page, Pill, TopBar } from '@/ui/primitives';
import { OptionButton } from '@/exercises/bodies';
import { Loading, MascotTip, useLang } from '@/ui/Loading';

function VideoCard({ v }: { v: Video }) {
  const [play, setPlay] = useState(false);
  const [quiz, setQuiz] = useState(false);
  const [ans, setAns] = useState<(string | null)[]>(v.questions.map(() => null));
  return (
    <article className="postcard overflow-hidden p-0">
      <div className="relative aspect-video bg-black">
        {play ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0&cc_load_policy=1&cc_lang_pref=es&hl=es&playsinline=1`}
            title={v.title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <button onClick={() => setPlay(true)} className="absolute inset-0" aria-label={`Ver el vídeo: ${v.title}`}>
            <img src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover" />
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid h-20 w-20 place-items-center rounded-full bg-primary text-4xl text-primary-ink shadow-lg">▶</span>
            </span>
          </button>
        )}
      </div>
      <div className="space-y-2 p-4">
        <div className="flex flex-wrap gap-2">
          <Pill>{LEVEL_LABEL[v.level] ?? v.level}</Pill>
          <Pill>⏱️ {v.minutes} min</Pill>
          <Pill>📺 {v.channel}</Pill>
        </div>
        <p className="text-[1.15rem] font-extrabold">{v.topic}</p>
        <p className="text-sm text-ink-soft">«{v.title}»</p>
        {!quiz ? (
          <Button variant="secondary" size="md" onClick={() => setQuiz(true)}>
            Ya lo he visto: 3 preguntas
          </Button>
        ) : (
          <div className="space-y-4 pt-2">
            {v.questions.map((q, i) => (
              <div key={i} className="space-y-2">
                <p className="text-lg font-extrabold">{q.q}</p>
                {q.options.map((o) => (
                  <OptionButton
                    key={o}
                    selected={ans[i] === o}
                    disabled={ans[i] !== null}
                    state={ans[i] !== null ? (o === q.answer ? 'ok' : ans[i] === o ? 'bad' : null) : null}
                    onClick={() => setAns((a) => a.map((x, j) => (j === i ? o : x)))}
                  >
                    {o}
                  </OptionButton>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export default function Videos() {
  const lang = useLang();
  const [list, setList] = useState<Video[] | null>(null);
  const [level, setLevel] = useState<string>('todos');
  useEffect(() => {
    void loadVideos(lang).then(setList);
  }, [lang]);
  if (!list) return <Loading />;
  const levels = [...new Set(list.map((v) => v.level))];
  const shown = list.filter((v) => level === 'todos' || v.level === level);
  return (
    <div className="min-h-dvh">
      <TopBar title="Vídeos" />
      <Page nav={false}>
        <MascotTip lang={lang} className="mt-2">
          Activa los subtítulos con el botón «CC» del vídeo. ¡No hace falta entenderlo todo!
        </MascotTip>
        <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4">
          {['todos', ...levels].map((l) => (
            <button key={l} onClick={() => setLevel(l)} aria-pressed={level === l} className={`min-h-[48px] shrink-0 rounded-full border-2 px-4 font-extrabold ${level === l ? 'border-primary bg-primary text-primary-ink' : 'border-line bg-surface'}`}>
              {l === 'todos' ? 'Todos' : (LEVEL_LABEL[l] ?? l)}
            </button>
          ))}
        </div>
        <div className="mt-4 space-y-5">
          {shown.map((v) => (
            <VideoCard key={v.id} v={v} />
          ))}
          {!shown.length && <p className="text-lg">Pronto habrá vídeos aquí.</p>}
        </div>
      </Page>
    </div>
  );
}
