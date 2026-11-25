// Monta e serve o site com as fixtures FICTÍCIAS de Cases/Blog (só para testes),
// em pasta de saída e cache próprios, sem tocar no build padrão.
import { spawnSync, spawn } from 'node:child_process';

const env = {
  ...process.env,
  CONTENT_DIR: './tests/fixtures/content',
  OUT_DIR: './dist-fixtures',
  CACHE_DIR: './node_modules/.astro-fixtures',
};
const astro = 'node_modules/astro/bin/astro.mjs';
const build = spawnSync(process.execPath, [astro, 'build'], { stdio: 'inherit', env });
if (build.status !== 0) process.exit(build.status ?? 1);
const preview = spawn(process.execPath, [astro, 'preview', '--port', '4322', '--ignore-lock'], { stdio: 'inherit', env });
preview.on('exit', (code) => process.exit(code ?? 0));
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => preview.kill(sig));
