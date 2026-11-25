import { existsSync, readdirSync } from 'node:fs';
import type { Loader } from 'astro/loaders';
import { glob } from 'astro/loaders';

/** glob() que não emite aviso quando a pasta ainda não tem nenhum arquivo de conteúdo. */
export function optionalGlob(base: string): Loader {
  const hasFiles = existsSync(base) && readdirSync(base, { recursive: true }).some((f) => /\.(md|mdx)$/.test(String(f)));
  if (hasFiles) return glob({ pattern: '**/*.{md,mdx}', base });
  return { name: 'optional-glob-empty', load: async () => {} };
}
