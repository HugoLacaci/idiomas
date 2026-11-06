import { NavLink, Outlet, useParams } from 'react-router-dom';
import { BookOpen, Dumbbell, Sun, Trophy } from 'lucide-react';
import type { Lang } from '@/content/types';
import { cn } from './primitives';
import { BigBen, Bus, LondonSkyline, PhoneBox, TeaCup } from '@/art/en';
import { Colosseum, Espresso, ItalySkyline, Lemon, Vespa } from '@/art/it';

const TABS = [
  { to: '', label: 'Hoy', icon: Sun },
  { to: 'lecciones', label: 'Lecciones', icon: BookOpen },
  { to: 'practicar', label: 'Practicar', icon: Dumbbell },
  { to: 'progreso', label: 'Mi progreso', icon: Trophy },
];

export function BottomNav({ lang }: { lang: Lang }) {
  return (
    <nav
      aria-label="Secciones"
      className="no-print safe-bottom fixed inset-x-0 bottom-0 z-30 border-t-2 border-line bg-surface/97 backdrop-blur"
    >
      <ul className="mx-auto grid max-w-[720px] grid-cols-4">
        {TABS.map(({ to, label, icon: Icon }) => (
          <li key={label}>
            <NavLink
              to={`/${lang}${to ? `/${to}` : ''}`}
              end={!to}
              className={({ isActive }) =>
                cn(
                  'flex min-h-[72px] flex-col items-center justify-center gap-0.5 text-[0.85rem] font-extrabold',
                  isActive ? 'text-primary' : 'text-ink-soft',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span className={cn('grid h-9 w-14 place-items-center rounded-full', isActive && 'bg-primary-soft')}>
                    <Icon size={26} strokeWidth={isActive ? 2.6 : 2} aria-hidden />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Ilustraciones laterales en escritorio (no es el móvil estirado). */
export function SideArt({ lang }: { lang: Lang }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-0 hidden xl:block">
      {lang === 'en' ? (
        <>
          <BigBen className="absolute bottom-24 left-[calc(50%-560px)] h-72 opacity-90" />
          <PhoneBox className="absolute bottom-24 left-[calc(50%-470px)] h-40" />
          <Bus className="absolute right-[calc(50%-600px)] bottom-28 w-56" />
          <TeaCup className="absolute top-28 right-[calc(50%-540px)] w-36" />
          <LondonSkyline className="absolute inset-x-0 bottom-0 h-32 w-full" />
        </>
      ) : lang === 'it' ? (
        <>
          <Colosseum className="absolute bottom-24 left-[calc(50%-620px)] w-60" />
          <Lemon className="absolute top-28 left-[calc(50%-540px)] w-36" />
          <Vespa className="absolute right-[calc(50%-610px)] bottom-28 w-56" />
          <Espresso className="absolute top-28 right-[calc(50%-520px)] w-28" />
          <ItalySkyline className="absolute inset-x-0 bottom-0 h-32 w-full" />
        </>
      ) : null}
    </div>
  );
}

export function LangShell() {
  const { lang } = useParams() as { lang: Lang };
  return (
    <>
      <SideArt lang={lang} />
      <div className="relative z-10">
        <Outlet />
      </div>
      <BottomNav lang={lang} />
    </>
  );
}
