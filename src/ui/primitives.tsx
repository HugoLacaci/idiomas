import { useEffect, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { ChevronLeft, Turtle, Volume2 } from 'lucide-react';
import { say, unlockAudio } from '@/audio/voice';
import type { Lang, PhotoCredit } from '@/content/types';
import { loadCredits } from '@/content/load';

export const cn = clsx;

// ───────── Botones ─────────
type Variant = 'primary' | 'secondary' | 'ghost' | 'accent' | 'good' | 'pop';

export function Button({
  variant = 'primary',
  icon,
  children,
  className,
  block = true,
  size = 'lg',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  icon?: ReactNode;
  block?: boolean;
  size?: 'lg' | 'md';
}) {
  return (
    <button
      {...rest}
      className={cn(
        'inline-flex items-center justify-center gap-3 rounded-2xl font-extrabold select-none',
        'transition-[transform,box-shadow,background] active:translate-y-[2px] disabled:opacity-45 disabled:active:translate-y-0',
        size === 'lg' ? 'min-h-[60px] px-6 text-[1.1rem]' : 'min-h-[52px] px-4 text-base',
        block && 'w-full',
        variant === 'primary' && 'bg-primary text-primary-ink shadow-[0_4px_0_rgb(0_0_0/0.22)] active:shadow-[0_2px_0_rgb(0_0_0/0.22)]',
        variant === 'accent' && 'bg-accent text-accent-ink shadow-[0_4px_0_rgb(0_0_0/0.22)]',
        variant === 'good' && 'bg-good text-white shadow-[0_4px_0_rgb(0_0_0/0.22)]',
        variant === 'pop' && 'bg-pop text-pop-ink shadow-[0_4px_0_rgb(0_0_0/0.18)]',
        variant === 'secondary' && 'bg-surface text-ink border-2 border-line shadow-[0_3px_0_rgb(var(--line))]',
        variant === 'ghost' && 'bg-transparent text-ink underline-offset-4 hover:underline',
        className,
      )}
    >
      {icon}
      <span className="leading-tight">{children}</span>
    </button>
  );
}

/** Barra superior con "Volver" siempre visible. */
export function TopBar({
  title,
  back = -1,
  right,
  className,
}: {
  title?: ReactNode;
  back?: string | number | false;
  right?: ReactNode;
  className?: string;
}) {
  const nav = useNavigate();
  return (
    <header className={cn('safe-top sticky top-0 z-20 bg-bg/95 backdrop-blur', className)}>
      <div className="mx-auto flex min-h-[60px] max-w-[720px] items-center gap-2 px-3">
        {back !== false && (
          <button
            onClick={() => (typeof back === 'number' ? (window.history.length > 1 ? nav(back) : nav('/')) : nav(back))}
            className="flex min-h-[48px] items-center gap-1 rounded-xl pr-3 pl-1 text-base font-bold text-ink active:bg-surface-2"
          >
            <ChevronLeft size={28} aria-hidden />
            Volver
          </button>
        )}
        <div className="min-w-0 flex-1 truncate text-center text-lg font-extrabold">{title}</div>
        <div className="flex min-w-[88px] justify-end">{right}</div>
      </div>
    </header>
  );
}

export function Page({ children, className, nav = true }: { children: ReactNode; className?: string; nav?: boolean }) {
  return <main className={cn('mx-auto w-full max-w-[720px] px-4', nav ? 'pb-nav' : 'pb-8 safe-bottom', className)}>{children}</main>;
}

// ───────── Emoji (Twemoji local con respaldo nativo) ─────────
export function emojiFile(e: string) {
  const cps = Array.from(e).map((c) => c.codePointAt(0)!.toString(16));
  const hasZwj = cps.includes('200d');
  return (hasZwj ? cps : cps.filter((c) => c !== 'fe0f')).join('-');
}

export function Emoji({ e, size = 48, className, label }: { e: string; size?: number; className?: string; label?: string }) {
  const [failed, setFailed] = useState(false);
  if (!e) return null;
  if (failed)
    return (
      <span role="img" aria-label={label} aria-hidden={!label} className={className} style={{ fontSize: size * 0.85, lineHeight: 1 }}>
        {e}
      </span>
    );
  return (
    <img
      src={`./img/emoji/${emojiFile(e)}.svg`}
      alt={label ?? ''}
      aria-hidden={!label}
      width={size}
      height={size}
      draggable={false}
      onError={() => setFailed(true)}
      className={cn('inline-block select-none', className)}
      style={{ width: size, height: size }}
    />
  );
}

// ───────── Fotos libres con su crédito ─────────
export function usePhoto(key?: string) {
  const [credit, setCredit] = useState<PhotoCredit | null>(null);
  useEffect(() => {
    if (!key) return;
    let alive = true;
    loadCredits().then((m) => alive && setCredit(m.get(key) ?? null));
    return () => {
      alive = false;
    };
  }, [key]);
  return credit;
}

export function Photo({
  k,
  className,
  fallback,
  ratio = '4 / 3',
  sizes = '(max-width: 720px) 100vw, 720px',
  eager,
}: {
  k?: string;
  className?: string;
  fallback?: ReactNode;
  ratio?: string;
  sizes?: string;
  eager?: boolean;
}) {
  const c = usePhoto(k);
  if (!k || !c) return fallback ? <>{fallback}</> : null;
  const base = `./img/photos/${c.file}`;
  return (
    <figure className={cn('relative overflow-hidden', className)} style={{ aspectRatio: ratio }}>
      <picture>
        <source type="image/avif" srcSet={`${base}-480.avif 480w, ${base}-960.avif 960w`} sizes={sizes} />
        <img
          src={`${base}-480.webp`}
          srcSet={`${base}-480.webp 480w, ${base}-960.webp 960w`}
          sizes={sizes}
          alt={c.title ?? ''}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          width={c.w}
          height={c.h}
          className="h-full w-full object-cover"
        />
      </picture>
      <figcaption className="absolute right-1 bottom-1 max-w-[85%] truncate rounded-md bg-black/50 px-2 text-[0.85rem] leading-6 text-white">
        © {c.author} · {c.license}
      </figcaption>
    </figure>
  );
}

// ───────── Audio ─────────
export function AudioButtons({
  text,
  lang,
  alt,
  size = 'md',
  slow = true,
  className,
  autoPlay,
}: {
  text: string;
  lang: Lang | 'es';
  alt?: boolean;
  size?: 'sm' | 'md' | 'lg';
  slow?: boolean;
  className?: string;
  autoPlay?: boolean;
}) {
  useEffect(() => {
    if (autoPlay) void say(text, lang, { alt });
  }, [autoPlay, text, lang, alt]);
  const dim = size === 'lg' ? 'h-16 w-16' : size === 'md' ? 'h-14 w-14' : 'h-12 w-12';
  const icon = size === 'lg' ? 30 : size === 'md' ? 26 : 22;
  return (
    <span className={cn('inline-flex shrink-0 items-center gap-2', className)}>
      <button
        type="button"
        aria-label="Escuchar"
        onClick={(ev) => {
          ev.stopPropagation();
          unlockAudio();
          void say(text, lang, { alt });
        }}
        className={cn(dim, 'grid place-items-center rounded-full bg-accent text-accent-ink shadow-[0_3px_0_rgb(0_0_0/0.2)] active:translate-y-[2px]')}
      >
        <Volume2 size={icon} aria-hidden />
      </button>
      {slow && (
        <button
          type="button"
          aria-label="Escuchar despacio"
          onClick={(ev) => {
            ev.stopPropagation();
            unlockAudio();
            void say(text, lang, { slow: true, alt });
          }}
          className={cn(
            size === 'lg' ? 'h-14 w-14' : 'h-12 w-12',
            'grid place-items-center rounded-full border-2 border-line bg-surface text-ink active:translate-y-[2px]',
          )}
        >
          <Turtle size={icon - 4} aria-hidden />
        </button>
      )}
    </span>
  );
}

/** Texto en el idioma que se aprende, con el atributo lang correcto. */
export function T({ lang, children, className }: { lang: Lang; children: ReactNode; className?: string }) {
  return (
    <span lang={lang} className={className}>
      {children}
    </span>
  );
}

/** Pinta **negrita** y ==resaltado== (la parte que cambia). */
export function Rich({ text, className, lang }: { text: string; className?: string; lang?: string }) {
  const parts = text.split(/(==[^=]+==|\*\*[^*]+\*\*)/g).filter(Boolean);
  return (
    <span className={className} lang={lang}>
      {parts.map((p, i) =>
        p.startsWith('==') ? (
          <mark key={i} className="hl">
            {p.slice(2, -2)}
          </mark>
        ) : p.startsWith('**') ? (
          <strong key={i}>{p.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </span>
  );
}

export function ProgressBar({ value, className, label }: { value: number; className?: string; label?: string }) {
  const v = Math.max(0, Math.min(1, value));
  return (
    <div
      className={cn('h-4 w-full overflow-hidden rounded-full bg-surface-2', className)}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v * 100)}
    >
      <div className="h-full rounded-full bg-good transition-[width] duration-500" style={{ width: `${v * 100}%` }} />
    </div>
  );
}

export function Card({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag onClick={onClick} className={cn('postcard block w-full p-4 text-left', onClick && 'active:translate-y-[2px]', className)}>
      {children}
    </Tag>
  );
}

export function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full bg-surface-2 px-3 py-1 text-[0.9rem] font-bold text-ink', className)}>
      {children}
    </span>
  );
}

export function SectionTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cn('font-display mt-7 mb-3 text-[1.55rem] leading-tight', className)}>{children}</h2>;
}
