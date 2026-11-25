import { test, expect } from '@playwright/test';
import { whatsappUrl } from '../../src/lib/contact';

test.describe('página Sobre', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sobre/');
  });

  test('um h1, título da aba, descrição e canonical do domínio oficial', async ({ page }) => {
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText('Do alto, vemos além.');
    await expect(page).toHaveTitle('Sobre | Nuestra Agência');
    await expect(page.locator('meta[name=description]')).toHaveAttribute('content', /\S+/);
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', 'https://agencianuestra.com.br/sobre/');
  });

  test('Marília Zabott com dois t, nunca com um', async ({ page }) => {
    const texto = await page.locator('main').innerText();
    expect(texto).toContain('Marília Zabott');
    expect(texto).not.toMatch(/Zabot(?!t)/);
  });

  test('"O que nos move" tem 4 itens', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 2, name: 'O que nos move' })).toBeVisible();
    const itens = page.locator('main ul li');
    await expect(itens).toHaveCount(4);
    const textos = await itens.allInnerTexts();
    expect(textos.map((t) => t.split(':')[0].trim())).toEqual([
      'Planejamento e antecipação',
      'Criatividade propositiva',
      'Organização',
      'Referência',
    ]);
  });

  test('frase final seguida do link de WhatsApp', async ({ page }) => {
    await expect(page.getByText('Porque aqui, o seu negócio vai mais longe.')).toBeVisible();
    await expect(page.locator('main a[href^="https://wa.me/"]')).toHaveAttribute('href', whatsappUrl());
  });

  test('menu e rodapé: Home, Sobre, Serviços, Cases, Blog, Contatos', async ({ page }) => {
    const ordem = ['Home', 'Sobre', 'Serviços', 'Cases', 'Blog', 'Contatos'];
    await expect(page.locator('#menu-principal li a')).toHaveText(ordem);
    await expect(page.locator('footer nav a')).toHaveText(ordem);
  });
});

test('a Home tem o trecho #sobre com link para /sobre/', async ({ page }) => {
  await page.goto('/');
  const trecho = page.locator('#sobre');
  await expect(trecho).toBeVisible();
  await expect(trecho.getByRole('link')).toHaveAttribute('href', '/sobre/');
});
