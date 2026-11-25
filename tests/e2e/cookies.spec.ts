// Rodam só no projeto "cookies" (porta 4324, build com PUBLIC_GA_ID=G-TEST000000).
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const GA = 'googletagmanager.com';
const GA_SCRIPT = 'gtag/js?id=G-TEST000000';

/** Intercepta o Google (nada sai para a rede) e devolve a lista das URLs pedidas. */
async function vigiarGoogle(page: Page): Promise<string[]> {
  const chamadas: string[] = [];
  await page.route(`https://www.${GA}/**`, (route) => {
    chamadas.push(route.request().url());
    return route.fulfill({ status: 200, contentType: 'text/javascript', body: '' });
  });
  return chamadas;
}

test.describe('aviso de cookies', () => {
  test('primeira visita mostra o aviso e não chama o Google', async ({ page }) => {
    const chamadas = await vigiarGoogle(page);
    await page.goto('/');
    await expect(page.locator('#cookie-banner')).toBeVisible();
    await page.waitForTimeout(500);
    expect(chamadas).toEqual([]);
  });

  test('o aviso visível passa no axe', async ({ page }) => {
    await vigiarGoogle(page);
    await page.goto('/');
    await expect(page.locator('#cookie-banner')).toBeVisible();
    const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    const graves = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(graves.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
  });

  test('o aviso tem link para a política de privacidade', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#cookie-banner a')).toHaveAttribute('href', '/politica-de-privacidade/');
  });

  test('Recusar: some, grava denied, nunca chama o Google e não volta', async ({ page }) => {
    const chamadas = await vigiarGoogle(page);
    await page.goto('/');
    await page.getByRole('button', { name: 'Recusar' }).click();
    await expect(page.locator('#cookie-banner')).toBeHidden();
    expect(await page.evaluate(() => localStorage.getItem('nuestra-consent'))).toBe('denied');
    await page.reload();
    await expect(page.locator('#cookie-banner')).toBeHidden();
    await page.waitForTimeout(500);
    expect(chamadas).toEqual([]);
  });

  test('Aceitar: grava granted, chama o Google e, ao recarregar, chama de novo sem mostrar o aviso', async ({ page }) => {
    const chamadas = await vigiarGoogle(page);
    await page.goto('/');
    await page.getByRole('button', { name: 'Aceitar' }).click();
    await expect(page.locator('#cookie-banner')).toBeHidden();
    expect(await page.evaluate(() => localStorage.getItem('nuestra-consent'))).toBe('granted');
    await expect.poll(() => chamadas.filter((u) => u.includes(GA_SCRIPT)).length).toBe(1);
    await page.reload();
    await expect(page.locator('#cookie-banner')).toBeHidden();
    await expect.poll(() => chamadas.filter((u) => u.includes(GA_SCRIPT)).length).toBe(2);
  });

  test('revogar pelo botão Cookies do rodapé apaga _ga* e grava denied', async ({ page }) => {
    await vigiarGoogle(page);
    await page.goto('/');
    await page.getByRole('button', { name: 'Aceitar' }).click();
    await page.evaluate(() => {
      document.cookie = '_ga=x; path=/';
      document.cookie = '_ga_TEST000000=y; path=/';
    });
    await page.locator('footer').getByRole('button', { name: 'Cookies' }).click();
    await expect(page.locator('#cookie-banner')).toBeVisible();
    await Promise.all([page.waitForEvent('load'), page.getByRole('button', { name: 'Recusar' }).click()]);
    expect(await page.evaluate(() => localStorage.getItem('nuestra-consent'))).toBe('denied');
    expect(await page.evaluate(() => document.cookie)).not.toMatch(/_ga/);
  });
});

test.describe('sem JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('o aviso fica oculto e o site continua utilizável', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#cookie-banner')).toHaveCount(1);
    await expect(page.locator('#cookie-banner')).toBeHidden();
    await expect(page.locator('h1')).toBeVisible();
  });
});
