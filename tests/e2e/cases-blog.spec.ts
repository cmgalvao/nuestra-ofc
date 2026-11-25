import { test, expect } from '@playwright/test';

const CASES_VAZIO = 'Em breve, os cases por aqui. Enquanto isso, veja nossos trabalhos no Instagram.';
const BLOG_VAZIO = 'Em breve, o primeiro post. Enquanto isso, acompanhe a Nuestra no Instagram.';
const INSTAGRAM = 'https://www.instagram.com/agencianuestra';

test.describe('Cases sem conteúdo (build padrão)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cases/');
  });

  test('título, h1 e intro', async ({ page }) => {
    await expect(page).toHaveTitle('Cases | Nuestra Agência');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText('Marcas que ajudamos a decolar.');
    await expect(page.locator('.page-head .intro')).toHaveText(
      'Identidades, campanhas e estratégias que saíram do papel. Veja alguns dos trabalhos que fizemos ao lado de quem embarcou com a gente.',
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      'Marcas que ajudamos a decolar: identidades, campanhas e estratégias que saíram do papel.',
    );
  });

  test('estado sem conteúdo, sem grade nem article', async ({ page }) => {
    const main = page.locator('main');
    await expect(main.getByText(CASES_VAZIO)).toBeVisible();
    await expect(main.getByRole('link', { name: 'Ver no Instagram' })).toHaveAttribute('href', INSTAGRAM);
    await expect(main.locator('article')).toHaveCount(0);
    await expect(main.locator('ul.grade, .grade li')).toHaveCount(0);
  });
});

test.describe('Blog sem conteúdo (build padrão)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/blog/');
  });

  test('título, h1 e intro', async ({ page }) => {
    await expect(page).toHaveTitle('Blog | Nuestra Agência');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText('Visão de cima.');
    await expect(page.locator('.page-head .intro')).toHaveText(
      'Ideias, tendências e reflexões sobre comunicação e marketing para quem toma decisões. Conteúdo direto, sem fórmulas prontas, para você enxergar o seu negócio com outros olhos.',
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      'Visão de cima: ideias, tendências e reflexões sobre comunicação e marketing para quem toma decisões.',
    );
  });

  test('estado sem conteúdo, sem lista nem article', async ({ page }) => {
    const main = page.locator('main');
    await expect(main.getByText(BLOG_VAZIO)).toBeVisible();
    await expect(main.getByRole('link', { name: 'Ver no Instagram' })).toHaveAttribute('href', INSTAGRAM);
    await expect(main.locator('article')).toHaveCount(0);
    await expect(main.locator('ul.posts li, .grade li')).toHaveCount(0);
  });
});

test('Home sem conteúdo não linka Cases nem Blog fora do menu e do rodapé', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('main a[href^="/cases/"], main a[href^="/blog/"]')).toHaveCount(0);
  await expect(page.locator('#cases, #blog')).toHaveCount(0);
});

test.describe('Cases e Blog vazios ficam fora do Google (build padrão)', () => {
  for (const rota of ['/cases/', '/blog/']) {
    test(`${rota} tem noindex e não está no sitemap`, async ({ page, request }) => {
      await page.goto(rota);
      await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', 'noindex');
      const sitemap = await (await request.get('/sitemap-0.xml')).text();
      expect(sitemap).not.toContain(`agencianuestra.com.br${rota}`);
      expect(sitemap).toContain('agencianuestra.com.br/servicos/');
    });
  }
});
