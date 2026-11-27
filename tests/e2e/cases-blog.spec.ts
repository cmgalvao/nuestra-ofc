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

test.describe('Blog com o primeiro post (build padrão)', () => {
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

  test('lista o post, sem o aviso de vazio', async ({ page }) => {
    const main = page.locator('main');
    await expect(main.getByText(BLOG_VAZIO)).toHaveCount(0);
    const itens = main.locator('ul.posts li a.item');
    await expect(itens).toHaveCount(1);
    await expect(itens.first()).toHaveAttribute('href', '/blog/ninguem-controla-o-vento/');
    await expect(itens.first()).toContainText('Ninguém controla o vento, mas dá pra escolher a altitude');
  });
});

test.describe('Post "Ninguém controla o vento"', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/blog/ninguem-controla-o-vento/');
  });

  test('cabeçalho, texto revisado e chamada final', async ({ page }) => {
    await expect(page).toHaveTitle('Ninguém controla o vento, mas dá pra escolher a altitude | Nuestra Agência');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText('Ninguém controla o vento, mas dá pra escolher a altitude');
    const article = page.locator('main article');
    await expect(article.locator('.meta')).toContainText('Marília Zabott');
    await expect(article.locator('time')).toHaveAttribute('datetime', '2026-11-26');
    const corpo = article.locator('.corpo');
    await expect(corpo).toContainText('O segredo é o piloto subir');
    await expect(corpo).toContainText('não tem como brigar com o vento. Mesmo assim');
    await expect(corpo).toContainText('Santos-Dumont, aliás, mostrou a que veio');
    await expect(corpo.locator('p')).toHaveCount(7);
    const cta = article.locator('.cta');
    await expect(cta).toContainText('Quando quiser voar, é só nos chamar.');
    expect(await cta.getByRole('link', { name: 'Falar com a Nuestra' }).getAttribute('href')).toMatch(/^https:\/\/wa\.me\/5555991932679\?text=/);
  });

  test('JSON-LD BlogPosting e indexável', async ({ page, request }) => {
    await expect(page.locator('meta[name=robots]')).toHaveCount(0);
    const blocos = await page.locator('script[type="application/ld+json"]').allTextContents();
    const post = blocos.map((b) => JSON.parse(b)).find((j) => j['@type'] === 'BlogPosting');
    expect(post.headline).toBe('Ninguém controla o vento, mas dá pra escolher a altitude');
    expect(post.author.name).toBe('Marília Zabott');
    expect(post.datePublished).toBe('2026-11-26');
    const sitemap = await (await request.get('/sitemap-0.xml')).text();
    expect(sitemap).toContain('agencianuestra.com.br/blog/ninguem-controla-o-vento/');
    expect(sitemap).toContain('agencianuestra.com.br/blog/</loc>');
  });
});

test.describe('Post: compartilhar no Instagram', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { copiado?: string };
      Object.defineProperty(navigator, 'clipboard', { value: { writeText: async (t: string) => { w.copiado = t; } } });
    });
    await page.goto('/blog/ninguem-controla-o-vento/');
    await page.getByRole('button', { name: 'Instagram' }).click();
  });
  const copiado = (page: import('@playwright/test').Page) => page.evaluate(() => (window as unknown as { copiado?: string }).copiado);
  const LINK = 'https://agencianuestra.com.br/blog/ninguem-controla-o-vento/';

  test('abre a janela com a arte vertical pronta', async ({ page }) => {
    const janela = page.getByRole('dialog', { name: 'Leve este voo para o seu story' });
    await expect(janela).toBeVisible();
    const arte = janela.locator('canvas');
    await expect(arte).toHaveAttribute('width', '1080');
    await expect(arte).toHaveAttribute('height', '1920');
    await expect(arte).toHaveAttribute('data-pronta', '');
    await expect(janela.locator('input')).toHaveCount(0);
    await janela.getByRole('button', { name: 'Fechar' }).click();
    await expect(janela).toBeHidden();
  });

  test('no computador baixa a arte e copia o link', async ({ page }, info) => {
    test.skip(info.project.name === 'mobile', 'só computador');
    const baixar = page.getByRole('button', { name: 'Baixar a arte e copiar o link' });
    await expect(baixar).toBeEnabled();
    const [arquivo] = await Promise.all([page.waitForEvent('download'), baixar.click()]);
    expect(arquivo.suggestedFilename()).toBe('nuestra-ninguem-controla-o-vento.jpg');
    expect(await copiado(page)).toBe(LINK);
    await expect(page.getByRole('status')).toHaveText('Link copiado. Cole na figurinha Link.');
  });

  test('no celular abre o menu do aparelho só com a imagem e copia o link', async ({ page }, info) => {
    test.skip(info.project.name !== 'mobile', 'só celular');
    await page.evaluate(() => {
      const w = window as unknown as { enviado?: string };
      const original = window.matchMedia.bind(window);
      window.matchMedia = (q: string) => (q === '(pointer: coarse)' ? ({ matches: true } as MediaQueryList) : original(q));
      Object.defineProperty(navigator, 'canShare', { value: () => true, configurable: true });
      Object.defineProperty(navigator, 'share', {
        configurable: true,
        value: async (d: ShareData) => { w.enviado = `${Object.keys(d).join()}|${d.files![0].name}|${d.files![0].type}`; },
      });
    });
    // Reabre para o botão ser preparado já com o menu de compartilhar disponível.
    await page.getByRole('button', { name: 'Fechar' }).click();
    await page.getByRole('button', { name: 'Instagram' }).click();
    await page.getByRole('button', { name: 'Compartilhar no Instagram' }).click();
    await expect.poll(() => page.evaluate(() => (window as unknown as { enviado?: string }).enviado))
      .toBe('files|nuestra-ninguem-controla-o-vento.jpg|image/jpeg');
    expect(await copiado(page)).toBe(LINK);
  });
});

test('Home mostra o trecho do Blog e ainda não o de Cases', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#cases')).toHaveCount(0);
  await expect(page.locator('main a[href^="/cases/"]')).toHaveCount(0);
  await expect(page.locator('#blog a.item')).toHaveCount(1);
  await expect(page.locator('#blog a.item')).toHaveAttribute('href', '/blog/ninguem-controla-o-vento/');
});

test.describe('Cases vazio fica fora do Google (build padrão)', () => {
  for (const rota of ['/cases/']) {
    test(`${rota} tem noindex e não está no sitemap`, async ({ page, request }) => {
      await page.goto(rota);
      await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', 'noindex');
      const sitemap = await (await request.get('/sitemap-0.xml')).text();
      expect(sitemap).not.toContain(`agencianuestra.com.br${rota}`);
      expect(sitemap).toContain('agencianuestra.com.br/servicos/');
    });
  }
});
