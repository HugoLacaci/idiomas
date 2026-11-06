import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Mic } from 'lucide-react';
import type { Chat, ChatNode } from '@/content/types';
import { LANG_INFO, loadChat, loadIndex, units, type ContentIndex } from '@/content/load';
import { say } from '@/audio/voice';
import { bestSimilarity, canRecognize, recognizeOnce } from '@/audio/speech';
import { playCorrect } from '@/audio/sfx';
import { AudioButtons, Button, Emoji, Page, TopBar, cn } from '@/ui/primitives';
import { Loading, Mascot, useLang } from '@/ui/Loading';

function ChatList() {
  const lang = useLang();
  const nav = useNavigate();
  const [idx, setIdx] = useState<ContentIndex | null>(null);
  useEffect(() => {
    void loadIndex(lang).then(setIdx);
  }, [lang]);
  if (!idx) return <Loading />;
  const tutor = LANG_INFO[lang].tutor;
  return (
    <div className="min-h-dvh">
      <TopBar title={`Charla con ${tutor}`} />
      <Page nav={false}>
        <p className="pt-2 text-lg text-ink-soft">Conversaciones cortas: {tutor} te habla y tú eliges qué contestar (o lo dices en voz alta).</p>
        {units(lang).map((u) => {
          const cs = (u.chats ?? []).filter((c) => idx.chats[c]);
          if (!cs.length) return null;
          return (
            <section key={u.id} className="mt-5">
              <h2 className="mb-2 text-base font-extrabold text-ink-soft uppercase">{u.title}</h2>
              <div className="space-y-2">
                {cs.map((c) => (
                  <button key={c} onClick={() => nav(`/${lang}/charla/${c}`)} className="postcard flex w-full items-center gap-3 p-4 text-left">
                    <Emoji e={idx.chats[c].emoji} size={40} />
                    <span className="text-[1.1rem] font-extrabold">{idx.chats[c].title}</span>
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </Page>
    </div>
  );
}

type Msg = { from: 'bot' | 'me'; t: string; es: string; feedback?: string; ok?: boolean };

function Conversation({ chat }: { chat: Chat }) {
  const lang = useLang();
  const nav = useNavigate();
  const tutor = LANG_INFO[lang].tutor;
  const [node, setNode] = useState<ChatNode | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [showEs, setShowEs] = useState<number | null>(null);
  const [listening, setListening] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const byId = (id: string) => chat.nodes.find((n) => n.id === id) ?? null;

  const enter = (id: string) => {
    if (id === 'end') return setNode(null);
    const n = byId(id);
    if (!n) return setNode(null);
    setMsgs((m) => [...m, { from: 'bot', t: n.says.t, es: n.says.es }]);
    void say(n.says.t, lang);
    if (!n.options?.length && n.next) setTimeout(() => enter(n.next!), 1800);
    setNode(n);
  };
  useEffect(() => {
    enter(chat.start);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat]);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [msgs]);

  const choose = (o: NonNullable<ChatNode['options']>[number]) => {
    setMsgs((m) => [...m, { from: 'me', t: o.t, es: o.es, feedback: o.feedback, ok: o.ok !== false }]);
    void say(o.t, lang, { alt: true });
    if (o.ok !== false) playCorrect();
    setTimeout(() => enter(o.next), 1300);
  };

  const speak = async () => {
    if (!node?.options) return;
    setListening(true);
    const r = await recognizeOnce(LANG_INFO[lang].bcp47);
    setListening(false);
    if (!r.heard.length) return;
    const best = node.options.map((o) => ({ o, s: bestSimilarity(o.t, r.heard, lang) })).sort((a, b) => b.s - a.s)[0];
    if (best.s >= 0.5) choose(best.o);
    else setMsgs((m) => [...m, { from: 'me', t: r.heard[0], es: '', feedback: 'No estoy segura de haberte entendido. Prueba a tocar una de las respuestas.', ok: false }]);
  };

  const done = !node;
  return (
    <div className="min-h-dvh">
      <TopBar title={chat.title} />
      <Page nav={false} className="pb-80">
        <div className="flex items-center gap-3 pt-1">
          <Mascot lang={lang} size={56} />
          <p className="text-base text-ink-soft">
            <Emoji e={chat.emoji} size={22} /> {chat.setting}
          </p>
        </div>
        <div className="mt-4 space-y-3">
          {msgs.map((m, i) => (
            <div key={i} className={cn('flex flex-col', m.from === 'me' ? 'items-end' : 'items-start')}>
              <button
                onClick={() => {
                  setShowEs(showEs === i ? null : i);
                  void say(m.t, lang, { alt: m.from === 'me' });
                }}
                className={cn('max-w-[85%] rounded-3xl px-4 py-3 text-left', m.from === 'me' ? 'rounded-br-md bg-accent text-accent-ink' : 'rounded-bl-md border-2 border-line bg-surface')}
              >
                {m.from === 'bot' && <span className="block text-sm font-extrabold text-ink-soft">{tutor}</span>}
                <span lang={lang} className="block text-[1.15rem] font-bold">
                  {m.t}
                </span>
                {showEs === i && m.es && <span className="mt-1 block text-base opacity-80">{m.es}</span>}
              </button>
              {m.feedback && <p className={cn('mt-1 max-w-[85%] rounded-xl px-3 py-2 text-base', m.ok ? 'bg-good-soft' : 'bg-pop/30')}>💡 {m.feedback}</p>}
            </div>
          ))}
          <div ref={end} />
        </div>
        <p className="mt-3 text-center text-sm text-ink-soft">Toca un mensaje para oírlo y ver la traducción.</p>
      </Page>
      <div className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t-2 border-line bg-bg/95 backdrop-blur">
        <div className="mx-auto max-w-[720px] space-y-2 p-4">
          {done ? (
            <>
              <p className="text-center text-lg font-extrabold">¡Muy bien! Conversación terminada 🎉</p>
              <Button onClick={() => nav(-1)}>Volver</Button>
            </>
          ) : (
            node?.options && (
              <>
                {node.options.map((o) => (
                  <div key={o.t} className="flex items-center gap-2">
                    <button onClick={() => choose(o)} lang={lang} className="min-h-[56px] flex-1 rounded-2xl border-[3px] border-line bg-surface px-4 text-left text-[1.05rem] font-bold shadow-[0_3px_0_rgb(var(--line))]">
                      {o.t}
                    </button>
                    <AudioButtons text={o.t} lang={lang} size="sm" slow={false} />
                  </div>
                ))}
                {canRecognize() && (
                  <Button variant="accent" size="md" icon={<Mic size={22} />} disabled={listening} onClick={() => void speak()}>
                    {listening ? 'Te escucho…' : 'O dilo en voz alta'}
                  </Button>
                )}
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChatScreen() {
  const lang = useLang();
  const { chatId } = useParams();
  const [chat, setChat] = useState<Chat | null | undefined>(undefined);
  useEffect(() => {
    if (chatId !== 'lista') void loadChat(lang, chatId!).then(setChat);
  }, [lang, chatId]);
  if (chatId === 'lista') return <ChatList />;
  if (chat === undefined) return <Loading />;
  if (!chat) return <Loading text="Esta charla no está lista todavía" />;
  return <Conversation chat={chat} />;
}
