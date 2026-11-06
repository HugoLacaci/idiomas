import { defineConfig, devices } from '@playwright/test';

// E2E en iPhone emulado (WebKit). PW_BASE permite probar contra la build (vite preview).
export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  retries: 0,
  use: {
    baseURL: process.env.PW_BASE ?? 'http://localhost:5180/',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'iphone-webkit', use: { ...devices['iPhone 13'] } },
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
