import { useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { LANG_INFO } from '@/content/load';
import { useProfile } from '@/data/settings';
import { say } from '@/audio/voice';
import { AudioButtons, Button, Page, TopBar, cn } from '@/ui/primitives';
import { MascotTip, useLang } from '@/ui/Loading';

type Turn = { role: 'user' | 'model'; text: string };

/** Tutor de IA opcional (desactivado por defecto). Lo configura Hugo en el Modo Hugo. */
export default function AiTutor() {
  const lang = useLang();
  const profile = useProfile();
  const tutor = LANG_INFO[lang].tutor;
  const [turns, setTurns] = useState<Turn[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const end = useRef<HTMLDivElement>(null);
  const langName = lang === 'en' ? 'English (British)' : 'Italian';

  const system = `You are ${tutor}, a warm, patient ${langName} tutor chatting with ${profile.name}, a Spanish woman (native Spanish speaker from Spain) who is a beginner (A1–A2). Rules: reply ONLY in very simple ${langName}, max 2 short sentences, then ask one simple question about her life (family, food, travel, hobbies). If she makes a mistake, first write her corrected sentence gently in a line starting with "✏️", then continue. After your ${langName} reply, add a new line starting with "ES:" with the Spanish (Spain) translation. Never use complex grammar.`;

  const send = async () => {
    const msg = text.trim();
    if (!msg || busy) return;
    const next: Turn[] = [...turns, { role: 'user', text: msg }];
    setTurns(next);
    setText('');
    setBusy(true);
    setErr('');
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(profile.ai.model)}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': profile.ai.apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: next.map((t) => ({ role: t.role, parts: [{ text: t.text }] })),
          generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error?.message ?? `Error ${r.status}`);
      const out: string = data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';
      setTurns([...next, { role: 'model', text: out }]);
      const spoken = out.split('\n').filter((l) => !l.startsWith('ES:') && !l.startsWith('✏️')).join(' ');
      void say(spoken, lang);
    } catch (e) {
      setErr(`${tutor} no puede contestar ahora. (${(e as Error).message})`);
    } finally {
      setBusy(false);
      setTimeout(() => end.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  };

  if (!profile.ai.enabled || !profile.ai.apiKey)
    return (
      <div className="min-h-dvh">
        <TopBar title={`Hablar con ${tutor}`} />
        <Page nav={false}>
          <MascotTip lang={lang} className="mt-4">
            Esta charla libre no está activada. Mientras tanto, prueba las «Charlas con {tutor}» de cada unidad.
          </MascotTip>
        </Page>
      </div>
    );

  return (
    <div className="min-h-dvh">
      <TopBar title={`Hablar con ${tutor}`} />
      <Page nav={false} className="pb-48">
        <MascotTip lang={lang} className="mt-2">
          Escríbeme en {lang === 'en' ? 'inglés' : 'italiano'}, ¡aunque sea con errores! Te contesto con frases cortas y te corrijo con cariño.
        </MascotTip>
        <div className="mt-4 space-y-3">
          {turns.map((t, i) => {
            const lines = t.text.split('\n').filter(Boolean);
            const es = lines.find((l) => l.startsWith('ES:'))?.slice(3).trim();
            const fix = lines.find((l) => l.startsWith('✏️'));
            const main = lines.filter((l) => !l.startsWith('ES:') && !l.startsWith('✏️')).join(' ');
            return (
              <div key={i} className={cn('flex', t.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div className={cn('max-w-[85%] rounded-3xl px-4 py-3', t.role === 'user' ? 'bg-accent text-accent-ink' : 'border-2 border-line bg-surface')}>
                  {fix && <p className="mb-1 rounded-lg bg-pop/30 px-2 text-base">{fix}</p>}
                  <p lang={lang} className="text-[1.1rem] font-bold">{main}</p>
                  {es && <p className="mt-1 text-base text-ink-soft">{es}</p>}
                  {t.role === 'model' && <AudioButtons text={main} lang={lang} size="sm" className="mt-2" />}
                </div>
              </div>
            );
          })}
          {busy && <p className="text-ink-soft">{tutor} está escribiendo…</p>}
          {err && <p className="rounded-xl bg-bad-soft p-3">{err}</p>}
          <div ref={end} />
        </div>
      </Page>
      <div className="safe-bottom fixed inset-x-0 bottom-0 border-t-2 border-line bg-bg/95">
        <div className="mx-auto flex max-w-[720px] gap-2 p-4">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void send()}
            lang={lang}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="Escribe aquí…"
            aria-label="Tu mensaje"
            className="min-h-[56px] flex-1 rounded-2xl border-[3px] border-line bg-surface px-4 text-lg"
          />
          <Button block={false} onClick={() => void send()} disabled={busy || !text.trim()} aria-label="Enviar" icon={<Send size={22} />}>
            {''}
          </Button>
        </div>
      </div>
    </div>
  );
}
