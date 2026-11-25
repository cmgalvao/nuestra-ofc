// Gera public/og-image.jpg (1200x630) a partir de src/assets/banner.png.
// Uso: node scripts/make-og-image.mjs
import sharp from 'sharp';

const SRC = 'src/assets/banner.png';
const OUT = 'public/og-image.jpg';
// Recorte horizontal que mantém o texto e a logo; o banner é mais largo que 1,91:1,
// então a faixa que sobra em cima e embaixo é completada espelhando as bordas.
const left = 120, width = 4100;

const cropped = await sharp(SRC).extract({ left, top: 0, width, height: 2017 }).resize(1200).toBuffer();
const { height } = await sharp(cropped).metadata();
const pad = 630 - height;
await sharp(cropped)
  .extend({ top: Math.floor(pad / 2), bottom: Math.ceil(pad / 2), extendWith: 'mirror' })
  .jpeg({ quality: 78, mozjpeg: true })
  .toFile(OUT);
console.log(`og-image gerada (${height}px de banner + ${pad}px de borda)`);
