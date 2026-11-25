import { test, expect } from '@playwright/test';

test.describe('política de privacidade', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/politica-de-privacidade/');
  });

  test('um h1, título da aba e canonical do domínio oficial', async ({ page }) => {
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText('Política de Privacidade');
    await expect(page).toHaveTitle('Política de Privacidade | Nuestra Agência');
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute(
      'href',
      'https://agencianuestra.com.br/politica-de-privacidade/',
    );
  });

  test('identifica o responsável pelo site', async ({ page }) => {
    const texto = await page.locator('main').innerText();
    expect(texto).toContain('Nuestra Agência');
    expect(texto).toContain('Marília Zabott');
    expect(texto).not.toMatch(/Zabot(?!t)/);
    expect(texto).toContain('47.807.866/0001-72');
    await expect(page.locator('main a[href^="mailto:nuestraoficial@gmail.com"]').first()).toBeVisible();
  });

  test('tem as seções principais', async ({ page }) => {
    for (const titulo of ['Dados que coletamos', 'Cookies e Google Analytics', 'Seus direitos']) {
      await expect(page.getByRole('heading', { level: 2, name: titulo })).toBeVisible();
    }
  });
});

test('o rodapé de toda página leva à política de privacidade', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('footer a[href="/politica-de-privacidade/"]')).toHaveText('Política de privacidade');
});
