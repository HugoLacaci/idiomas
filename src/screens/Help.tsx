import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Button, Emoji, Page, TopBar, cn } from '@/ui/primitives';
import { reducedMotion } from '@/data/settings';

const SLIDES = [
  { emoji: '👆', title: 'Todo se hace tocando', text: 'Toca las respuestas. Nada de arrastrar. Si te equivocas, puedes deshacer.' },
  { emoji: '🔊', title: 'Escucha todo lo que quieras', text: 'El altavoz lo lee en voz alta. La tortuga 🐢 lo dice despacio.' },
  { emoji: '💡', title: 'Si fallas, te explico por qué', text: 'Sin vidas, sin castigos y sin prisas. La pregunta vuelve al final para que la aciertes.' },
  { emoji: '❓', title: 'El botón «?» te ayuda', text: 'En cada ejercicio, el «?» te enseña un ejemplo resuelto.' },
  { emoji: '🔁', title: 'Repasar', text: 'Las palabras vuelven justo cuando estás a punto de olvidarlas. Así se quedan para siempre.' },
  { emoji: '⭐', title: 'Tus palabras favoritas', text: 'Toca la estrella para guardar las palabras que más te gusten.' },
];

/** Tutorial animado de "¿Cómo funciona?" (se ve la primera vez y desde Ayuda). */
export function Tutorial() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reducedMotion()) return;
    const t = setInterval(() => setI((x) => (x + 1) % SLIDES.length), 3800);
    return () => clearInterval(t);
  }, []);
  const s = SLIDES[i];
  return (
    <div className="mt-5">
      <div className="postcard relative min-h-[260px] overflow-hidden p-6 text-center">
        <AnimatePresence mode="wait">
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.35 }}>
            <motion.div animate={reducedMotion() ? {} : { scale: [1, 1.12, 1] }} transition={{ repeat: Infinity, duration: 1.6 }} className="flex justify-center">
              <Emoji e={s.emoji} size={92} />
            </motion.div>
            <p className="font-display mt-4 text-[1.6rem] leading-tight">{s.title}</p>
            <p className="mt-2 text-lg">{s.text}</p>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-4 flex justify-center gap-2">
        {SLIDES.map((_, k) => (
          <button
            key={k}
            onClick={() => setI(k)}
            aria-label={`Paso ${k + 1}`}
            className={cn('h-4 rounded-full transition-all', k === i ? 'w-10 bg-primary' : 'w-4 bg-line')}
          />
        ))}
      </div>
    </div>
  );
}

const FAQ = [
  {
    q: '¿Cómo pongo la app en la pantalla de inicio?',
    a: 'En Safari, toca el botón Compartir (el cuadrado con la flecha hacia arriba) y luego «Añadir a pantalla de inicio». Así se abre como una app y tu progreso queda mejor guardado.',
    link: '/instalar',
  },
  {
    q: 'No se oye nada',
    a: 'Comprueba que el botón lateral del iPhone no está en silencio (la rayita naranja) y sube el volumen. Después toca de nuevo el altavoz.',
  },
  {
    q: 'La voz suena rara',
    a: 'Casi todo tiene audio grabado con voces de calidad. Si alguna frase usa la voz del iPhone, puedes descargar voces mejoradas en Ajustes del iPhone › Accesibilidad › Contenido leído › Voces.',
    link: '/ajustes',
  },
  {
    q: 'El micrófono no me entiende',
    a: 'Habla cerca del teléfono, sin ruido alrededor. Si no funciona, puedes grabarte y comparar tu voz con el modelo. La nota es orientativa: ¡lo importante es practicar!',
  },
  {
    q: '¿Puedo perder mi progreso?',
    a: 'Tu progreso se guarda en el teléfono. Para estar tranquila, en «Mi progreso» puedes «Guardar copia de mi progreso» y mandártela por WhatsApp o guardarla en Archivos.',
  },
  {
    q: '¿Cómo cambio de idioma?',
    a: 'Toca «Volver» hasta la pantalla de inicio, o el botón con la bandera arriba en «Hoy». Cada idioma guarda su progreso.',
  },
];

export default function Help() {
  const nav = useNavigate();
  return (
    <div className="min-h-dvh">
      <TopBar title="Ayuda" />
      <Page nav={false}>
        <h1 className="font-display mt-2 text-[2rem]">¿Cómo funciona?</h1>
        <Tutorial />
        <h2 className="font-display mt-8 mb-3 text-[1.6rem]">Preguntas frecuentes</h2>
        <div className="space-y-3">
          {FAQ.map((f) => (
            <details key={f.q} className="postcard p-4">
              <summary className="min-h-[44px] cursor-pointer text-lg font-extrabold">{f.q}</summary>
              <p className="mt-2 text-lg">{f.a}</p>
              {f.link && (
                <div className="mt-3">
                  <Button variant="secondary" size="md" onClick={() => nav(f.link!)}>
                    Ir allí
                  </Button>
                </div>
              )}
            </details>
          ))}
        </div>
        <div className="mt-8 space-y-3">
          <Button variant="secondary" onClick={() => nav('/creditos')}>
            Créditos y licencias
          </Button>
        </div>
      </Page>
    </div>
  );
}
