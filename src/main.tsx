import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { startSettingsSync } from '@/data/settings';
import { unlockAudio } from '@/audio/voice';
import { unlockSfx } from '@/audio/sfx';

startSettingsSync();

// iOS: el audio solo puede sonar tras un toque. Desbloqueamos en el primero.
const unlock = () => {
  unlockAudio();
  unlockSfx();
  window.removeEventListener('pointerdown', unlock, true);
  window.removeEventListener('touchend', unlock, true);
};
window.addEventListener('pointerdown', unlock, true);
window.addEventListener('touchend', unlock, true);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
