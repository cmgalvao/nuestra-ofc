// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://nuestra.com.br',
  trailingSlash: 'always',
  integrations: [sitemap()],
  // CSP com script-src 'self': nenhum script pode ser embutido na página
  vite: { build: { assetsInlineLimit: 0 } },
});
