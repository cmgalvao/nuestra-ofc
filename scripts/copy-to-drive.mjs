// Copia o projeto para o Google Drive (backup), depois de gerar o site.
// Uso: npm run copy:drive
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const ORIGEM = String.raw`C:\Projetos\nuestra-site`;
const DESTINO = String.raw`G:\Meu Drive\PROJETOS\2026-2027 SITES\NUESTRA\Site\Site Inicial\nuestra-site`;

// Trava de segurança: /MIR apaga o que não existe na origem, então o destino
// só pode ser a subpasta "nuestra-site", nunca "Site Inicial" em si.
if (!DESTINO.endsWith(String.raw`\Site Inicial\nuestra-site`) || resolve(ORIGEM) === resolve(DESTINO)) {
  console.error('Destino inválido. Abortando para não apagar arquivos.');
  process.exit(1);
}

console.log('1/2 Gerando o site (npm run build)...');
const build = spawnSync('npm run build', { shell: true, stdio: 'inherit', cwd: ORIGEM });
if (build.status !== 0) {
  console.error('O build falhou. A cópia não foi feita.');
  process.exit(1);
}

console.log('2/2 Copiando para o Drive...');
const pastasIgnoradas = [
  'node_modules', '.astro', 'test-results', 'playwright-report',
  'lighthouse', '.superpowers', 'dist-fixtures',
];
const copia = spawnSync(
  'robocopy',
  [ORIGEM, DESTINO, '/MIR', '/XD', ...pastasIgnoradas, '/NFL', '/NDL', '/NP'],
  { stdio: 'inherit' },
);
// robocopy: 0 a 7 = sucesso; 8 ou mais = falha.
if (copia.status === null || copia.status >= 8) {
  console.error(`A cópia falhou (código ${copia.status}).`);
  process.exit(1);
}

console.log(`Cópia concluída em ${DESTINO}`);
