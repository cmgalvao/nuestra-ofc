// Pré-renderiza a textura de grão (feTurbulence) em src/assets/grain.webp.
// O SVG com filtro e o mix-blend-mode custavam caro na rasterização (Lighthouse). Aqui o ruído vira
// pontos claros e escuros com transparência, que dão efeito parecido com "overlay" usando mistura normal.
import sharp from 'sharp';

const SIZE = 128;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`;
const { data, info } = await sharp(Buffer.from(svg)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const out = Buffer.alloc(data.length);
for (let i = 0; i < data.length; i += 4) {
  const lum = (data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11) / 255; // o ruído é quase cinza
  const clear = lum > 0.5 ? 255 : 0;
  out[i] = out[i + 1] = out[i + 2] = clear;
  out[i + 3] = Math.min(255, Math.round(Math.abs(lum - 0.5) * 2 * 255 * 1.6));
}
await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).webp({ quality: 70 }).toFile('src/assets/grain.webp');
console.log('grain.webp gerada');
