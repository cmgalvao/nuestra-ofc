import { test, expect } from '@playwright/test';

import { PAGES } from './helpers';

for (const path of PAGES) {
  test(`sem rolagem horizontal em 320px: ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto(path);
    const width = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(width).toBeLessThanOrEqual(320);
  });
}

for (const path of ['/cases/', '/blog/', '/servicos/']) {
  test(`rodapé encosta no fim da página, sem faixa do corpo abaixo: ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const r = await page.evaluate(() => {
      const f = document.querySelector('footer')!;
      const rect = f.getBoundingClientRect();
      return {
        footerBottom: rect.bottom + window.scrollY,
        docHeight: document.documentElement.scrollHeight,
        bodyPad: getComputedStyle(document.body).paddingBottom,
      };
    });
    expect(r.bodyPad).toBe('0px');
    expect(r.footerBottom).toBeGreaterThanOrEqual(r.docHeight - 1);
    // Rolado até o fim, a borda de baixo do rodapé é a borda de baixo da janela (sem faixa creme).
    const gap = await page.evaluate(() => window.innerHeight - document.querySelector('footer')!.getBoundingClientRect().bottom);
    expect(Math.abs(gap)).toBeLessThanOrEqual(1);
  });
}
