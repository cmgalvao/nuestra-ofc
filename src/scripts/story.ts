// Arte de story (1080x1920) desenhada no próprio aparelho, com o título e a capa do post.
// O topo e o rodapé ficam livres para a interface do Instagram; entre "Leia no blog" e o logo
// sobra espaço para a figurinha "Link".
import { ajustarTitulo } from '../lib/story-linhas';

export interface DadosStory { titulo: string; capa: string; logo: string; papel: string }

const L = 1080;
const A = 1920;
const FONTE = "'Jost Variable', system-ui, sans-serif";

const carregar = (src: string) =>
  new Promise<HTMLImageElement>((ok, erro) => {
    const img = new Image();
    img.onload = () => ok(img);
    img.onerror = () => erro(new Error(`imagem não carregou: ${src}`));
    img.src = src;
  });

// Preenche o retângulo sem distorcer, cortando as sobras (como object-fit: cover).
function cobrir(c: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, l: number, a: number) {
  const escala = Math.max(l / img.naturalWidth, a / img.naturalHeight);
  const sl = l / escala;
  const sa = a / escala;
  c.drawImage(img, (img.naturalWidth - sl) / 2, (img.naturalHeight - sa) / 2, sl, sa, x, y, l, a);
}

export async function desenharStory(tela: HTMLCanvasElement, dados: DadosStory) {
  const [capa, logo, papel] = await Promise.all([dados.capa, dados.logo, dados.papel].map(carregar));
  await Promise.all([500, 600, 800].map((peso) => document.fonts.load(`${peso} 74px ${FONTE}`)));
  const c = tela.getContext('2d')!;
  c.textAlign = 'center';
  c.textBaseline = 'middle';

  c.fillStyle = '#1b5360';
  c.fillRect(0, 0, L, A);

  c.fillStyle = '#F5A160';
  c.font = `600 34px ${FONTE}`;
  c.letterSpacing = '9px';
  c.fillText('VISÃO DE CIMA', L / 2, 292);
  c.letterSpacing = '0px';

  // Capa do post numa janela em arco, a forma que o site usa.
  c.save();
  c.beginPath();
  c.roundRect(150, 360, 780, 860, [390, 390, 24, 24]);
  c.shadowColor = 'rgba(0, 0, 0, 0.35)';
  c.shadowBlur = 40;
  c.shadowOffsetY = 24;
  c.fillStyle = '#DF673D';
  c.fill();
  c.shadowColor = 'transparent';
  c.clip();
  cobrir(c, capa, 150, 360, 780, 860);
  c.restore();

  // Título em tiras de papel, levemente inclinadas, por cima da base da capa.
  const medirEm = (tamanho: number) => {
    c.font = `800 ${tamanho}px ${FONTE}`;
    return (texto: string) => c.measureText(texto).width;
  };
  const { tamanho, linhas } = ajustarTitulo(dados.titulo, 880, medirEm);
  const medir = medirEm(tamanho);
  const alto = tamanho * 1.42;
  c.save();
  c.translate(L / 2, 1135);
  c.rotate((-1.6 * Math.PI) / 180);
  linhas.forEach((linha, i) => {
    const largura = medir(linha) + 48;
    const y = i * alto;
    c.save();
    c.beginPath();
    c.rect(-largura / 2, y, largura, alto);
    c.shadowColor = 'rgba(0, 0, 0, 0.3)';
    c.shadowBlur = 16;
    c.shadowOffsetY = 8;
    c.fillStyle = '#f6efe2';
    c.fill();
    c.shadowColor = 'transparent';
    c.clip();
    c.globalAlpha = 0.5;
    c.globalCompositeOperation = 'multiply';
    cobrir(c, papel, -largura / 2, y, largura, alto);
    c.restore();
    c.fillStyle = '#013e50';
    c.fillText(linha, 0, y + alto / 2);
  });
  c.restore();

  c.fillStyle = '#fff';
  c.font = `500 38px ${FONTE}`;
  c.fillText('Leia no blog', L / 2, Math.max(1510, 1135 + linhas.length * alto + 60));

  const alturaLogo = 120;
  const larguraLogo = (logo.naturalWidth / logo.naturalHeight) * alturaLogo;
  c.drawImage(logo, (L - larguraLogo) / 2, 1660, larguraLogo, alturaLogo);

  tela.dataset.pronta = '';
}
