import { Printer } from 'lucide-react';
import gift from '@content/gift.json';
import { Button, TopBar } from '@/ui/primitives';
import { Bus, BigBen } from '@/art/en';
import { Lemon, Vespa } from '@/art/it';

/** Tarjeta regalo imprimible con el código QR de la web. */
export default function GiftCard() {
  const url = (gift as { url?: string }).url || window.location.href.split('#')[0];
  return (
    <div className="min-h-dvh bg-[#FAF7F0]">
      <div className="no-print">
        <TopBar title="Tarjeta regalo" back="/" />
      </div>
      <main className="mx-auto max-w-[760px] px-4 pb-10">
        <div className="relative mx-auto mt-4 aspect-[1.6/1] w-full overflow-hidden rounded-3xl border-[6px] border-[#1D2B53] bg-white p-[4%] text-[#1D2B53] shadow-xl print:shadow-none">
          <div className="absolute inset-y-0 left-0 w-1/2 bg-[#1D2B53]" aria-hidden />
          <div className="absolute top-0 right-0 h-4 w-1/2 bg-[repeating-linear-gradient(90deg,#C8553D_0_20px,#FFF8EC_20px_40px)]" aria-hidden />
          <BigBen className="absolute bottom-0 left-[3%] h-[60%] opacity-90" />
          <Bus className="absolute bottom-[3%] left-[16%] w-[26%]" />
          <Lemon className="absolute top-[10%] right-[3%] w-[14%]" />
          <Vespa className="absolute right-[3%] bottom-[3%] w-[22%] opacity-90" />
          <div className="relative grid h-full grid-cols-2 gap-[4%]">
            <div className="pt-[2%] text-white">
              <p className="font-display text-[clamp(18px,4.4vw,36px)] leading-tight">¡Feliz cumpleaños, mamá!</p>
              <p className="mt-2 text-[clamp(11px,2vw,16px)] opacity-90">Inglés 🇬🇧 e italiano 🇮🇹, un ratito cada día.</p>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <img src="./qr.svg" alt="Código QR de la web" className="aspect-square w-[62%] rounded-xl border-4 border-[#F2B33D] bg-white p-1" />
              <p className="mt-2 text-[clamp(10px,1.8vw,15px)] font-bold">Apunta con la cámara del iPhone</p>
              <p className="text-[clamp(9px,1.5vw,13px)] break-all">{url.replace(/^https?:\/\//, '')}</p>
            </div>
          </div>
        </div>
        <div className="no-print mx-auto mt-6 max-w-[560px] space-y-3">
          <Button icon={<Printer size={22} />} onClick={() => window.print()}>
            Imprimir la tarjeta
          </Button>
          <p className="text-center text-base text-[#485270]">Consejo: imprímela en cartulina y dóblala por la mitad. También está en docs/QR.png.</p>
        </div>
      </main>
    </div>
  );
}
