import { existsSync, readdirSync } from 'node:fs';
import type { Loader } from 'astro/loaders';
import { glob } from 'astro/loaders';

/** Pastas das coleções que podem estar vazias (sem nenhum arquivo de conteúdo). */
export const OPTIONAL_DIRS = {
  cases: './src/content/cases',
  blog: './src/content/blog',
} as const;

/** true se a pasta tem pelo menos um arquivo .md/.mdx. */
export function hasContentFiles(base: string): boolean {
  return existsSync(base) && readdirSync(base, { recursive: true }).some((f) => /\.(md|mdx)$/.test(String(f)));
}

/** glob() que não emite aviso quando a pasta ainda não tem nenhum arquivo de conteúdo. */
export function optionalGlob(base: string): Loader {
  if (hasContentFiles(base)) return glob({ pattern: '**/*.{md,mdx}', base });
  return { name: 'optional-glob-empty', load: async () => {} };
}
