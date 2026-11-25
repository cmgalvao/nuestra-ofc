// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://nuestra.com.br',
  trailingSlash: 'always',
  integrations: [sitemap({ filter: (page) => !page.includes('/404') })],
  // Só o build das fixtures de teste (scripts/serve-fixtures.mjs) muda estas duas variáveis.
  outDir: process.env.OUT_DIR ?? './dist',
  cacheDir: process.env.CACHE_DIR ?? './node_modules/.astro',
  // CSP com script-src 'self': nenhum script pode ser embutido na página
  vite: { build: { assetsInlineLimit: 0 } },
});
