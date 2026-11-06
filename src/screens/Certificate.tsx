import { useNavigate, useParams } from 'react-router-dom';
import { Printer } from 'lucide-react';
import { LEVEL_LABEL } from '@/content/load';
import { levelDone, useProgress } from '@/data/progress';
import { useProfile } from '@/data/settings';
import { Button, TopBar } from '@/ui/primitives';
import { Loading, useLang } from '@/ui/Loading';
import { BigBen, Bus, PostStamp } from '@/art/en';
import { Colosseum, Lemon, Tile } from '@/art/it';

/** Certificado imprimible (Imprimir › Guardar como PDF en el iPhone). */
export default function Certificate() {
  const lang = useLang();
  const { level } = useParams();
  const nav = useNavigate();
  const p = useProgress(lang);
  const profile = useProfile();
  if (!p) return <Loading />;
  const ok = levelDone(lang, level as never, p) || profile.unlockAll[lang];
  const en = lang === 'en';
  const date = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <div className="min-h-dvh">
      <div className="no-print">
        <TopBar title="Certificado" />
      </div>
      <main className="mx-auto max-w-[900px] px-4 pb-10">
        {!ok ? (
          <p className="mt-8 text-center text-lg">Termina todas las unidades del nivel {level} para conseguir este certificado. ¡Ya queda menos!</p>
        ) : (
          <>
            <div
              className="relative mx-auto mt-4 aspect-[1.414/1] w-full overflow-hidden rounded-xl border-[10px] p-[5%] text-center shadow-xl print:mt-0 print:shadow-none"
              style={{ borderColor: en ? '#1D2B53' : '#C8553D', background: en ? '#FAF7F0' : '#FFF8EC', color: en ? '#1D2B53' : '#40261C' }}
            >
              <div className="absolute inset-[10px] rounded border-2" style={{ borderColor: en ? '#F2B33D' : '#2A7DB8' }} aria-hidden />
              {en ? (
                <>
                  <BigBen className="absolute bottom-0 left-[3%] h-[55%] opacity-25" />
                  <Bus className="absolute right-[3%] bottom-[3%] w-[22%] opacity-30" />
                </>
              ) : (
                <>
                  <Colosseum className="absolute bottom-0 left-[3%] w-[28%] opacity-25" />
                  <Lemon className="absolute top-[6%] right-[4%] w-[14%] opacity-60" />
                  <div className="absolute top-[6%] left-[4%] opacity-60">
                    <Tile size={60} />
                  </div>
                </>
              )}
              <div className="relative flex h-full flex-col items-center justify-center">
                <p className="text-[clamp(12px,2.2vw,20px)] font-extrabold tracking-[0.3em] uppercase">Certificado</p>
                <p className="font-display mt-[2%] text-[clamp(18px,4vw,40px)] leading-tight">{en ? 'English' : 'Italiano'} · {LEVEL_LABEL[level ?? 'A1']}</p>
                <p className="mt-[3%] text-[clamp(12px,2vw,18px)]">Se otorga a</p>
                <p className="font-display text-[clamp(28px,7vw,72px)] leading-none" style={{ color: en ? '#D7262E' : '#C8553D' }}>
                  {profile.name}
                </p>
                <p className="mt-[3%] max-w-[80%] text-[clamp(12px,2.2vw,20px)]">
                  por haber completado el nivel <strong>{level}</strong> de {en ? 'inglés' : 'italiano'} con constancia, ganas y mucho cariño.
                </p>
                <p className="mt-[3%] text-[clamp(11px,1.8vw,16px)]">{date}</p>
                <div className="absolute right-[4%] bottom-[4%]">
                  <PostStamp color={en ? '#D7262E' : '#2A7DB8'} size={70} />
                </div>
              </div>
            </div>
            <div className="no-print mx-auto mt-6 max-w-[560px] space-y-3">
              <Button icon={<Printer size={22} />} onClick={() => window.print()}>
                Imprimir o guardar en PDF
              </Button>
              <p className="text-center text-base text-ink-soft">En el iPhone: Imprimir › pellizca la vista previa para abrirla › Compartir › Guardar en Archivos.</p>
              <Button variant="secondary" onClick={() => nav(-1)}>
                Volver
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
