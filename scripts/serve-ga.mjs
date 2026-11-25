// Monta e serve o site com um ID de GA4 FICTÍCIO (só para testar o aviso de cookies),
// em pasta de saída e cache próprios, sem tocar no build padrão.
import { spawnSync, spawn } from 'node:child_process';

const env = {
  ...process.env,
  PUBLIC_GA_ID: 'G-TEST000000',
  OUT_DIR: './dist-ga',
  CACHE_DIR: './node_modules/.astro-ga',
};
delete env.PREVIEW;
const astro = 'node_modules/astro/bin/astro.mjs';
const build = spawnSync(process.execPath, [astro, 'build'], { stdio: 'inherit', env });
if (build.status !== 0) process.exit(build.status ?? 1);
const preview = spawn(process.execPath, [astro, 'preview', '--port', '4324', '--ignore-lock'], { stdio: 'inherit', env });
preview.on('exit', (code) => process.exit(code ?? 0));
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => preview.kill(sig));
