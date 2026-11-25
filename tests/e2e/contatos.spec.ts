import { test, expect } from '@playwright/test';
import { SITE } from '../../src/config/site';
import { mailtoUrl, whatsappUrl } from '../../src/lib/contact';
import { countAsset } from './helpers';

test.describe('página Contatos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contatos/');
  });

  test('título, descrição, um h1 e caminho Home › Contatos', async ({ page }) => {
    await expect(page).toHaveTitle('Contatos | Nuestra Agência');
    await expect(page.locator('meta[name=description]')).toHaveAttribute(
      'content',
      'Vamos decolar juntos? Fale com a Nuestra pelo WhatsApp, e-mail ou Instagram. Santa Maria | RS.',
    );
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText('Vamos decolar juntos?');
    await expect(h1.locator('b, em, strong')).toHaveText('decolar');
    const trilha = page.getByRole('navigation', { name: 'Caminho' });
    await expect(trilha.locator('a')).toHaveAttribute('href', '/');
    await expect(trilha.locator('[aria-current=page]')).toHaveText('Contatos');
    await expect(page.locator('main')).toContainText(
      'Conte um pouco sobre o seu negócio e o que você quer alcançar. A gente responde com o melhor caminho para chegar lá.',
    );
  });

  test('três links com os href exatos e nomes acessíveis', async ({ page }) => {
    const lista = page.locator('main ul[role=list]');
    const email = lista.locator('a[href^="mailto:"]');
    const insta = lista.locator('a[href*="instagram.com"]');
    const wa = lista.locator('a[href^="https://wa.me/"]');
    await expect(email).toHaveAttribute('href', mailtoUrl());
    await expect(insta).toHaveAttribute('href', SITE.instagramUrl);
    await expect(wa).toHaveAttribute('href', whatsappUrl());
    await expect(email).toContainText('nuestraoficial@gmail.com');
    await expect(insta).toContainText('@agencianuestra');
    await expect(wa).toContainText('+55 55 9 9193-2679');
    for (const l of [insta, wa]) {
      await expect(l).toHaveAttribute('target', '_blank');
      await expect(l).toHaveAttribute('rel', 'noopener');
    }
    await expect(email).not.toHaveAttribute('target', /.*/);
    await expect(page.getByRole('link', { name: /^E-mail: nuestraoficial@gmail\.com/ })).toHaveCount(1);
    await expect(page.getByRole('link', { name: /^Instagram: @agencianuestra.*nova aba/ })).toHaveCount(1);
    await expect(page.getByRole('link', { name: /^WhatsApp: \+55 55 9 9193-2679.*nova aba/ })).toHaveCount(1);
    await expect(lista.locator('svg:not([aria-hidden=true])')).toHaveCount(0);
  });

  test('local "Santa Maria | RS" sem link', async ({ page }) => {
    const local = page.locator('main').getByText('Santa Maria | RS', { exact: true });
    await expect(local).toHaveCount(1);
    expect(await local.evaluate((el) => el.closest('a') !== null)).toBe(false);
    await expect(page.locator('main ul[role=list] li')).toHaveCount(4);
  });

  test('botão "Falar com a Nuestra" abre o WhatsApp', async ({ page }) => {
    const btn = page.locator('main').getByRole('link', { name: 'Falar com a Nuestra', includeHidden: true });
    await expect(btn).toHaveAttribute('href', whatsappUrl());
    await expect(btn).toHaveAttribute('target', '_blank');
    await expect(btn).toHaveAttribute('rel', 'noopener');
  });

  test('céu sem nuvens nem flores', async ({ page }) => {
    for (const nome of ['nuvem', 'cloud', 'flower']) {
      expect(await countAsset(page.locator('body'), nome)).toEqual({ imgs: 0, fundos: 0 });
    }
  });
});
