import type { Locator } from '@playwright/test';

export const PAGES: string[] = ['/404/', '/servicos/', '/', '/sobre/', '/politica-de-privacidade/', '/contatos/', '/cases/', '/blog/'];

/** Imagens (<img>) e fundos CSS dentro de `root` cuja origem contém `nome`. */
export async function countAsset(root: Locator, nome: string) {
  return root.evaluate((el, n) => {
    const all = [el, ...Array.from(el.querySelectorAll('*'))];
    let imgs = 0;
    let fundos = 0;
    for (const node of all) {
      if (node instanceof HTMLImageElement && (node.currentSrc || node.src).includes(n)) imgs++;
      for (const pseudo of [null, '::before', '::after']) {
        if (getComputedStyle(node, pseudo).backgroundImage.includes(n)) fundos++;
      }
    }
    return { imgs, fundos };
  }, nome);
}
