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
    expect(await page.locator('link[rel=canonical]').getAttribute('href')).toMatch(/^https:\/\/agencianuestra\.com\.br/);
    await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', 'noindex');
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(ld.join('')).toContain('"ProfessionalService"');
  });

  test('rodapé com menu e e-mail', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer.locator('nav a')).toHaveCount(6);
    await expect(footer.locator('a[href^="mailto:nuestraoficial@gmail.com"]')).toHaveCount(1);
  });

  test('links para Home, Serviços e Contatos', async ({ page }) => {
    const acoes = page.locator('.nf .actions');
    await expect(acoes.locator('a[href="/"]')).toHaveCount(1);
    await expect(acoes.locator('a[href="/servicos/"]')).toHaveCount(1);
    await expect(acoes.locator('a[href="/contatos/"]')).toHaveCount(1);
  });

  test('botão de WhatsApp no cabeçalho só no celular, e nada fixo no rodapé', async ({ page }, info) => {
    const cta = page.locator('.cta-topo');
    await expect(page.locator('.sticky-cta')).toHaveCount(0);
    if (info.project.name === 'mobile') {
      await expect(cta).toBeVisible();
      expect(await cta.getAttribute('href')).toMatch(/^https:\/\/wa\.me\/5555991932679\?text=/);
      // Ao lado do Menu e rola junto com o cabeçalho (não fica preso na tela).
      await page.mouse.wheel(0, 1500);
      await expect(cta).not.toBeInViewport();
      await page.evaluate(() => scrollTo(0, 0));
      await page.getByRole('button', { name: 'Menu' }).click();
      await expect(cta).toBeHidden();
    } else {
      await expect(cta).toBeHidden();
    }
  });

  test('menu é uma gaveta pela direita, não cobre a tela, e fecha ao tocar fora', async ({ page }, info) => {
    test.skip(info.project.name !== 'mobile', 'só celular');
    await page.getByRole('button', { name: 'Menu' }).click();
    const gaveta = page.locator('#menu-principal');
    await expect(gaveta).toBeVisible();
    const box = (await gaveta.boundingBox())!;
    const vw = page.viewportSize()!.width;
    expect(box.width).toBeLessThan(vw * 0.85);
    await expect.poll(async () => Math.round((await gaveta.boundingBox())!.x + box.width)).toBe(vw);
    await page.mouse.click(10, 300);
    await expect(page.getByRole('button', { name: 'Menu' })).toHaveAttribute('aria-expanded', 'false');
    await expect(gaveta).toBeHidden();
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
    // Tab além do último item do menu nunca cai no conteúdo coberto (main, rodapé, logo...).
    const dentro = () =>
      page.evaluate(() => !document.activeElement?.closest('main, footer, .breadcrumbs, .skip, .logo'));
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
