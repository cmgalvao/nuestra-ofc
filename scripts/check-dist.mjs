// Verifica o site gerado em dist/: SEO básico, imagens, sitemap, robots e CSP (sem scripts embutidos).
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = process.env.OUT_DIR ?? 'dist';
const ORIGIN = 'https://nuestra.com.br/';
// Com BASE_PATH (prévia do GitHub Pages), todo link interno precisa começar pela pasta do site.
const BASE = (process.env.BASE_PATH ?? '/').replace(/\/?$/, '/');
const problems = [];

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

if (!existsSync(DIST)) {
  console.error(`Pasta ${DIST}/ não existe. Rode "npm run build" antes.`);
  process.exit(1);
}

const files = walk(DIST);
const pages = files.filter((f) => f.endsWith('.html'));
const titles = new Map();

for (const file of pages) {
  const name = relative(DIST, file).replaceAll(String.fromCharCode(92), '/');
  const html = readFileSync(file, 'utf8');
  const bad = (msg) => problems.push(`${name}: ${msg}`);

  if (!/<html[^>]*\blang="pt-BR"/.test(html)) bad('sem <html lang="pt-BR">');

  const h1 = (html.match(/<h1[\s>]/g) ?? []).length;
  if (h1 !== 1) bad(`${h1} elementos <h1> (esperado 1)`);

  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1] ?? '').trim();
  if (!title) bad('<title> vazio');
  else if (titles.has(title)) bad(`<title> repetido com ${titles.get(title)}: "${title}"`);
  else titles.set(title, name);

  const desc = html.match(/<meta[^>]*name="description"[^>]*>/)?.[0] ?? '';
  if (!/content="[^"]+"/.test(desc)) bad('sem meta description');

  const canon = html.match(/<link[^>]*rel="canonical"[^>]*>/)?.[0] ?? '';
  if (!new RegExp(`href="${ORIGIN}`).test(canon)) bad(`canonical ausente ou fora de ${ORIGIN}`);

  for (const img of html.match(/<img\b[^>]*>/g) ?? []) {
    // O Astro minifica alt="" para um "alt" sem valor; os dois formatos contam.
    if (!/\salt(\s|=|\/|>)/.test(img)) bad(`<img> sem alt: ${img.slice(0, 80)}`);
  }

  for (const m of html.matchAll(/\s(?:href|src)="(\/[^"]*)"/g)) {
    if (!m[1].startsWith(BASE) && !m[1].startsWith('//')) bad(`link interno fora de ${BASE}: ${m[1]}`);
  }

  if (/flower/i.test(html)) bad('referencia "flower"');

  for (const m of html.matchAll(/<script\b([^>]*)>/g)) {
    const attrs = m[1];
    if (/\ssrc=/.test(attrs)) continue;
    if (!/type="application\/ld\+json"/.test(attrs)) bad('<script> embutido que não é JSON-LD (quebra o CSP script-src \'self\')');
  }
}

if (!existsSync(join(DIST, 'sitemap-index.xml'))) problems.push('falta sitemap-index.xml');
if (!existsSync(join(DIST, 'robots.txt'))) problems.push('falta robots.txt');
for (const f of files.filter((f) => /sitemap.*\.xml$/.test(f))) {
  if (/<loc>[^<]*\/404\/?<\/loc>/.test(readFileSync(f, 'utf8'))) problems.push(`${relative(DIST, f)} lista /404/`);
}

if (problems.length) {
  console.error(`check-dist: ${problems.length} problema(s)\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log(`check-dist: ${pages.length} páginas OK`);
