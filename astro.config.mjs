// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://agencianuestra.com.br',
  // Prévia no GitHub Pages: BASE_PATH=/nuestra-ofc/ (ver .github/workflows/pages.yml). Site oficial: raiz.
  base: process.env.BASE_PATH ?? '/',
  trailingSlash: 'always',
  integrations: [sitemap({ filter: (page) => new URL(page).pathname !== '/404/' })],
  // Só o build das fixtures de teste (scripts/serve-fixtures.mjs) muda estas duas variáveis.
  outDir: process.env.OUT_DIR ?? './dist',
  cacheDir: process.env.CACHE_DIR ?? './node_modules/.astro',
  // CSP com script-src 'self': nenhum script pode ser embutido na página
  vite: { build: { assetsInlineLimit: 0 } },
});
