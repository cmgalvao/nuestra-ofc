import { test, expect } from '@playwright/test';

test.describe('página 404', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/404/');
  });

  test('estrutura e SEO básicos', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText('Esse voo não existe.');
    await expect(page).toHaveTitle('Página não encontrada | Nuestra Agência');
    expect(await page.locator('link[rel=canonical]').getAttribute('href')).toMatch(/^https:\/\/nuestra\.com\.br/);
    await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', 'noindex');
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(ld.join('')).toContain('"ProfessionalService"');
  });

  test('rodapé com menu e e-mail', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer.locator('nav a')).toHaveCount(5);
    await expect(footer.locator('a[href^="mailto:nuestraoficial@gmail.com"]')).toHaveCount(1);
  });

  test('links para Home, Serviços e Contatos', async ({ page }) => {
    const acoes = page.locator('.nf .actions');
    await expect(acoes.locator('a[href="/"]')).toHaveCount(1);
    await expect(acoes.locator('a[href="/servicos/"]')).toHaveCount(1);
    await expect(acoes.locator('a[href="/contatos/"]')).toHaveCount(1);
  });

  test('CTA fixo só no celular', async ({ page }, info) => {
    const cta = page.locator('.sticky-cta a', { hasText: 'Falar com a Nuestra' });
    if (info.project.name === 'mobile') {
      await expect(cta).toBeVisible();
      expect(await cta.getAttribute('href')).toMatch(/^https:\/\/wa\.me\/5555991932679\?text=/);
    } else {
      await expect(cta).toBeHidden();
    }
  });

  test('teclado: pular, abrir e fechar menu', async ({ page }, info) => {
    test.skip(info.project.name !== 'mobile', 'só celular');
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveText('Pular para o conteúdo');
    const btn = page.getByRole('button', { name: 'Menu' });
    await btn.focus();
    await page.keyboard.press('Enter');
    await expect(btn).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#menu-principal').getByRole('link', { name: 'Serviços' })).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(page.locator('#menu-principal a').first()).toBeFocused();
    // Tab além do último item do menu nunca cai no conteúdo coberto (main, rodapé, CTA fixo, logo...).
    const dentro = () =>
      page.evaluate(() => !document.activeElement?.closest('main, footer, .sticky-cta, .breadcrumbs, .skip, .logo'));
    await page.locator('#menu-principal a').last().focus();
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('Tab');
      expect(await dentro()).toBe(true);
    }
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Shift+Tab');
      expect(await dentro()).toBe(true);
    }
    await page.keyboard.press('Escape');
    await expect(page.locator('main')).not.toHaveAttribute('inert', '');
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    await expect(btn).toBeFocused();
  });
});
