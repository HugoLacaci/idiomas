/**
 * Ajustes y perfil. Se guardan en localStorage (arranque instantáneo) y se copian
 * en IndexedDB (kv) para que entren en la copia de seguridad.
 */
import { create } from 'zustand';
import type { Lang } from '@/content/types';
import { getKV, setKV } from './db';
import { setVoicePrefs } from '@/audio/voice';
import { setSfx } from '@/audio/sfx';

export interface Settings {
  fontSize: 'normal' | 'grande' | 'muy-grande';
  contrast: boolean;
  reduceMotion: boolean;
  dark: boolean;
  voiceRate: number; // 0.75 · 0.9 · 1 · 1.1
  enAccent: 'gb' | 'us';
  voiceGender: 'f' | 'm';
  sounds: boolean;
  soundVolume: number;
  readInstructions: boolean; // leer en voz alta las instrucciones al abrir cada ejercicio
}

export interface Profile {
  name: string;
  giftSeen: boolean;
  onboarded: boolean;
  tutorialSeen: boolean;
  minutes: 5 | 10 | 15 | 20;
  lang: Lang | null; // último idioma usado
  startUnit: Partial<Record<Lang, string>>; // resultado de la prueba de nivel
  unlockAll: Partial<Record<Lang, boolean>>; // Modo Hugo
  reminderTime: string; // "19:00"
  installDismissedAt: number;
  ai: { enabled: boolean; provider: 'gemini'; apiKey: string; model: string };
  giftOverride?: { message?: string; title?: string };
}

export const DEFAULT_SETTINGS: Settings = {
  fontSize: 'grande',
  contrast: false,
  reduceMotion: false,
  dark: false,
  voiceRate: 1,
  enAccent: 'gb',
  voiceGender: 'f',
  sounds: true,
  soundVolume: 0.25,
  readInstructions: false,
};

export const DEFAULT_PROFILE: Profile = {
  name: 'Yolanda',
  giftSeen: false,
  onboarded: false,
  tutorialSeen: false,
  minutes: 10,
  lang: null,
  startUnit: {},
  unlockAll: {},
  reminderTime: '19:00',
  installDismissedAt: 0,
  ai: { enabled: false, provider: 'gemini', apiKey: '', model: 'gemini-2.5-flash' },
};

const LS = 'yolanda-state-v1';

function load(): { settings: Settings; profile: Profile } {
  try {
    const raw = localStorage.getItem(LS);
    if (raw) {
      const p = JSON.parse(raw);
      return {
        settings: { ...DEFAULT_SETTINGS, ...p.settings },
        profile: { ...DEFAULT_PROFILE, ...p.profile, ai: { ...DEFAULT_PROFILE.ai, ...p.profile?.ai } },
      };
    }
  } catch {
    /* sin almacenamiento */
  }
  return { settings: DEFAULT_SETTINGS, profile: DEFAULT_PROFILE };
}

interface Store {
  settings: Settings;
  profile: Profile;
  setSettings: (p: Partial<Settings>) => void;
  setProfile: (p: Partial<Profile>) => void;
  replaceAll: (s: Settings, p: Profile) => void;
}

export const useStore = create<Store>((set) => ({
  ...load(),
  setSettings: (p) => set((s) => ({ settings: { ...s.settings, ...p } })),
  setProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),
  replaceAll: (settings, profile) => set({ settings, profile }),
}));

export const useSettings = () => useStore((s) => s.settings);
export const useProfile = () => useStore((s) => s.profile);

function applySideEffects(s: Settings) {
  setVoicePrefs({ accent: s.enAccent, gender: s.voiceGender, rate: s.voiceRate });
  setSfx({ enabled: s.sounds, volume: s.soundVolume });
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    const scale = s.fontSize === 'normal' ? 1 : s.fontSize === 'grande' ? 1.1 : 1.25;
    root.style.setProperty('--font-scale', String(scale));
    root.dataset.contrast = s.contrast ? 'high' : 'normal';
    root.dataset.theme = s.dark ? 'dark' : 'light';
    root.dataset.accent = s.enAccent;
    const reduce = s.reduceMotion || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    root.dataset.motion = reduce ? 'reduce' : 'full';
  }
}

export function reducedMotion() {
  return typeof document !== 'undefined' && document.documentElement.dataset.motion === 'reduce';
}

let started = false;
export function startSettingsSync() {
  if (started) return;
  started = true;
  applySideEffects(useStore.getState().settings);
  useStore.subscribe((s, prev) => {
    try {
      localStorage.setItem(LS, JSON.stringify({ settings: s.settings, profile: s.profile }));
    } catch {
      /* lleno o privado */
    }
    if (s.settings !== prev.settings) applySideEffects(s.settings);
    void setKV('settings', s.settings);
    void setKV('profile', s.profile);
  });
  // Si localStorage se vació pero IndexedDB conserva datos (o tras recuperar una copia)
  void hydrateFromDB();
}

export async function hydrateFromDB() {
  const settings = await getKV<Settings | null>('settings', null);
  const profile = await getKV<Profile | null>('profile', null);
  const hasLocal = (() => {
    try {
      return !!localStorage.getItem(LS);
    } catch {
      return false;
    }
  })();
  if ((settings || profile) && (!hasLocal || (profile && profile.onboarded && !useStore.getState().profile.onboarded))) {
    useStore.getState().replaceAll(
      { ...DEFAULT_SETTINGS, ...(settings ?? {}) },
      { ...DEFAULT_PROFILE, ...(profile ?? {}), ai: { ...DEFAULT_PROFILE.ai, ...(profile?.ai ?? {}) } },
    );
  }
}

/** Tras recuperar una copia, forzar la lectura desde la base de datos. */
export async function reloadFromDB() {
  const settings = await getKV<Settings | null>('settings', null);
  const profile = await getKV<Profile | null>('profile', null);
  useStore.getState().replaceAll(
    { ...DEFAULT_SETTINGS, ...(settings ?? {}) },
    { ...DEFAULT_PROFILE, ...(profile ?? {}), ai: { ...DEFAULT_PROFILE.ai, ...(profile?.ai ?? {}) } },
  );
}
