import { test, expect } from '@playwright/test';

test.describe('página Serviços', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/servicos/');
  });

  test('um h1 "Serviços" e cinco h2 em ordem', async ({ page }) => {
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText('Serviços');
    await expect(page).toHaveTitle('Serviços | Nuestra Agência');
    await expect(page.locator('main h2')).toHaveText([
      'Identidade Visual',
      'Gestão de Redes Sociais',
      'Tráfego Pago',
      'Marketing 360º',
      'Jobs pontuais',
    ]);
  });

  test('Marketing 360º: frase e 7 entregas', async ({ page }) => {
    const card = page.locator('#marketing-360');
    await expect(card).toContainText('Para quem quer voar mais alto.');
    await expect(card.locator('li')).toHaveCount(7);
  });

  test('Jobs pontuais não tem a lista "O que entregamos"', async ({ page }) => {
    const card = page.locator('#jobs-pontuais');
    await expect(card).toBeVisible();
    await expect(card.locator('ul')).toHaveCount(0);
    await expect(card).not.toContainText('O que entregamos');
  });

  test('caminho de navegação e JSON-LD', async ({ page }) => {
    const nav = page.locator('nav[aria-label="Caminho"]');
    await expect(nav).toHaveCount(1);
    await expect(nav.getByRole('link', { name: 'Home' })).toBeVisible();
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(ld.join('')).toContain('"BreadcrumbList"');
  });

  test('sem flores na página', async ({ page }) => {
    const srcs = await page.locator('img').evaluateAll((els) => els.map((e) => (e as HTMLImageElement).src));
    for (const s of srcs) expect(s).not.toContain('flower');
  });
});
