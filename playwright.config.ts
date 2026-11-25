import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  // Porta 4323 (não 4321) para nunca reaproveitar o `npm run dev` aberto, que injeta a barra de ferramentas do Astro.
  webServer: [
    {
      command: 'npm run build && npm run preview -- --port 4323 --ignore-lock',
      url: 'http://localhost:4323/',
      reuseExistingServer: true,
      timeout: 180_000,
    },
    {
      // Site com as fixtures FICTÍCIAS de Cases/Blog, em outra pasta de saída (dist-fixtures).
      command: 'node scripts/serve-fixtures.mjs',
      url: 'http://localhost:4322/',
      reuseExistingServer: true,
      timeout: 180_000,
    },
    {
      // Site com ID de GA4 FICTÍCIO, só para o aviso de cookies (dist-ga).
      command: 'node scripts/serve-ga.mjs',
      url: 'http://localhost:4324/',
      reuseExistingServer: true,
      timeout: 180_000,
    },
  ],
  use: { baseURL: 'http://localhost:4323' },
  projects: [
    { name: 'mobile', testIgnore: /(fixtures|cookies).spec/, use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 812 } } },
    { name: 'desktop', testIgnore: /(fixtures|cookies).spec/, use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
    {
      name: 'fixtures',
      testMatch: /fixtures.spec/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 }, baseURL: 'http://localhost:4322' },
    },
    {
      name: 'cookies',
      testMatch: /cookies.spec/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 }, baseURL: 'http://localhost:4324' },
    },
  ],
});
