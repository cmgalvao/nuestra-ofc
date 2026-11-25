import { test, expect } from '@playwright/test';

// Tarefas seguintes acrescentam caminhos aqui.
export const PAGES: string[] = ['/404/', '/servicos/'];

for (const path of PAGES) {
  test(`sem rolagem horizontal em 320px: ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto(path);
    const width = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(width).toBeLessThanOrEqual(320);
  });
}
