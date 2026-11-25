// Rodam só no projeto "fixtures" (porta 4322, CONTENT_DIR=./tests/fixtures/content).
import { test, expect } from '@playwright/test';

test.describe('Cases com conteúdo (fixtures FICTÍCIAS)', () => {
  test('a lista tem os itens, ligando a /cases/<id>/', async ({ page }) => {
    await page.goto('/cases/');
    const itens = page.locator('main ul.grade > li');
    await expect(itens).toHaveCount(2);
    await expect(page.locator('main a.item[href^="/cases/"]')).toHaveCount(2);
    await expect(page.locator('main').getByText('Em breve, os cases por aqui.')).toHaveCount(0);
    await expect(itens.first()).toContainText('FICTÍCIO');
    await expect(itens.first().locator('img')).toHaveCount(1);
  });

  test('case com resultado mostra Desafio, O que fizemos e Resultado', async ({ page }) => {
    await page.goto('/cases/exemplo-completo/');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toContainText('FICTÍCIO');
    await expect(page.locator('main')).toContainText('Cliente Exemplo Ficticio');
    await expect(page.locator('main h2')).toHaveText(['Desafio', 'O que fizemos', 'Resultado']);
    await expect(page.locator('main img[alt="Descrição FICTÍCIA, exemplo de teste. Não é um case real da Nuestra."]').first()).toBeVisible();
  });

  test('case sem resultado não mostra a seção Resultado', async ({ page }) => {
    await page.goto('/cases/exemplo-sem-resultado/');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main h2')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Resultado', exact: true })).toHaveCount(0);
  });
});

test.describe('Blog com conteúdo (fixtures FICTÍCIAS)', () => {
  test('lista ordenada do mais recente ao mais antigo, com data em pt-BR', async ({ page }) => {
    await page.goto('/blog/');
    const itens = page.locator('main ul.posts > li');
    await expect(itens).toHaveCount(2);
    await expect(itens.nth(0)).toContainText('Post de exemplo FICTÍCIO recente');
    await expect(itens.nth(1)).toContainText('Post de exemplo FICTÍCIO antigo');
    await expect(itens.nth(0)).toContainText('10 de março de 2026');
    await expect(itens.nth(0).locator('img')).toHaveCount(1);
  });

  test('post: um h1, article, JSON-LD BlogPosting completo', async ({ page }) => {
    await page.goto('/blog/exemplo-recente/');
    await expect(page.locator('h1')).toHaveCount(1);
    const article = page.locator('main article');
    await expect(article).toHaveCount(1);
    await expect(article).toContainText('Autoria Ficticia');
    await expect(article.locator('time')).toHaveAttribute('datetime', '2026-03-10');
    const blocos = await page.locator('script[type="application/ld+json"]').allTextContents();
    const post = blocos.map((b) => JSON.parse(b)).find((j) => j['@type'] === 'BlogPosting');
    expect(post).toBeTruthy();
    expect(post.headline).toContain('FICTÍCIO');
    expect(post.datePublished).toBe('2026-03-10');
    expect(post.author.name).toBe('Autoria Ficticia');
    expect(String(post.image)).toMatch(/^https:\/\/agencianuestra\.com\.br\/_astro\//);
  });
});

test('Home com conteúdo mostra os trechos de Cases e Blog', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#cases a.item')).toHaveCount(2);
  await expect(page.locator('#blog a.item')).toHaveCount(2);
});

for (const path of ['/cases/', '/blog/', '/cases/exemplo-completo/', '/blog/exemplo-recente/']) {
  test(`sem rolagem horizontal em 320px com conteúdo: ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto(path);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  });
}
