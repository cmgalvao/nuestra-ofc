// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { emptySectionPaths } from './src/lib/optional-glob.ts';

// Páginas de lista sem conteúdo (Cases/Blog vazios) ficam fora do sitemap, como a 404.
const vazias = emptySectionPaths();

// https://astro.build/config
export default defineConfig({
  site: 'https://agencianuestra.com.br',
  // Prévia no GitHub Pages: BASE_PATH=/nuestra-ofc/ (ver .github/workflows/pages.yml). Site oficial: raiz.
  base: process.env.BASE_PATH ?? '/',
  trailingSlash: 'always',
  integrations: [sitemap({
      filter: (page) => {
        const caminho = new URL(page).pathname;
        return caminho !== '/404/' && !vazias.includes(caminho);
      },
    })],
  // Só o build das fixtures de teste (scripts/serve-fixtures.mjs) muda estas duas variáveis.
  outDir: process.env.OUT_DIR ?? './dist',
  cacheDir: process.env.CACHE_DIR ?? './node_modules/.astro',
  // CSP com script-src 'self': nenhum script pode ser embutido na página
  vite: { build: { assetsInlineLimit: 0 } },
});
