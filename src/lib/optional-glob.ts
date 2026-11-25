import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Loader } from 'astro/loaders';
import { glob } from 'astro/loaders';

/**
 * Raiz do conteúdo de Cases e Blog, sempre absoluta. `CONTENT_DIR` só é usado
 * pelos testes (fixtures FICTÍCIAS); sem ela vale `./src/content`.
 */
export function contentBase(): string {
  return resolve(process.cwd(), process.env.CONTENT_DIR ?? './src/content');
}

/** Pastas das coleções que podem estar vazias (sem nenhum arquivo de conteúdo). */
export const OPTIONAL_DIRS = {
  cases: 'cases',
  blog: 'blog',
} as const;

/** Caminho absoluto da pasta de uma coleção opcional. */
export function optionalDir(name: keyof typeof OPTIONAL_DIRS): string {
  return resolve(contentBase(), OPTIONAL_DIRS[name]);
}

/** true se a pasta tem pelo menos um arquivo .md/.mdx. */
export function hasContentFiles(base: string): boolean {
  return existsSync(base) && readdirSync(base, { recursive: true }).some((f) => /\.(md|mdx)$/.test(String(f)));
}

/**
 * glob() que não emite aviso quando a pasta ainda não tem arquivo de conteúdo.
 * A checagem acontece em cada `load()` (e não na leitura da config), então o
 * primeiro arquivo criado durante `astro dev` entra na próxima sincronização.
 */
export function optionalGlob(name: keyof typeof OPTIONAL_DIRS): Loader {
  return {
    name: 'optional-glob',
    async load(ctx) {
      const dir = optionalDir(name);
      if (!hasContentFiles(dir)) {
        ctx.store.clear();
        return;
      }
      const base = pathToFileURL(dir).href;
      await glob({ pattern: '**/*.{md,mdx}', base }).load(ctx);
    },
  };
}
