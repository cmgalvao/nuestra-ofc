import { test, expect, type Locator, type Page } from '@playwright/test';
import { SITE, NAV } from '../../src/config/site';
import { countAsset } from './helpers';

const SLUGS = ['identidade-visual', 'gestao-de-redes-sociais', 'trafego-pago', 'marketing-360', 'jobs-pontuais'];

const transformOf = (loc: Locator) => loc.evaluate((el) => getComputedStyle(el).transform);
const scrollTo = (page: Page, y: number) => page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
const frames = (page: Page) =>
  page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 150)))));

test.describe('Home: estrutura e conteúdo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('título, descrição e um único h1 com a frase da marca', async ({ page }) => {
    await expect(page).toHaveTitle('Nuestra Agência | Comunicação e marketing em Santa Maria/RS');
    await expect(page.locator('meta[name=description]')).toHaveAttribute(
      'content',
      'Do primeiro traço ao último clique, cuidamos da comunicação da sua empresa: identidade visual, redes sociais, tráfego pago e marketing 360º em Santa Maria/RS.',
    );
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
    await expect(page.locator('link[href="/favicon.ico"]')).toHaveCount(0);
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText(SITE.tagline);
    await expect(h1.locator('em')).toHaveText('último clique');
    await expect(page.locator('#decolagem')).toContainText(SITE.taglineSub);
  });

  test('botões da abertura', async ({ page }) => {
    const hero = page.locator('#decolagem');
    await expect(hero.getByRole('link', { name: 'Conheça os serviços' })).toHaveAttribute('href', '#servicos');
    // No celular o botão do WhatsApp da abertura dá lugar ao CTA fixo (como no mockup); continua no HTML.
    const wa = hero.getByRole('link', { name: 'Falar com a Nuestra', includeHidden: true });
    await expect(wa).toHaveCount(1);
    expect(await wa.getAttribute('href')).toMatch(/^https:\/\/wa\.me\/5555991932679\?text=/);
  });

  test('balão: imagem decorativa, carregamento prioritário', async ({ page }) => {
    const img = page.locator('[data-balao] img');
    await expect(img).toHaveCount(1);
    await expect(img).toHaveAttribute('alt', '');
    await expect(img).toHaveAttribute('loading', 'eager');
    await expect(img).toHaveAttribute('fetchpriority', 'high');
    expect(await img.getAttribute('srcset')).toMatch(/320w.*480w.*640w/);
  });

  test('cartões de embarque: 5 em ordem, Marketing 360º em destaque', async ({ page }) => {
    const servicos = page.locator('#servicos');
    await expect(servicos.locator('h2')).toHaveText('Escolha seu voo ou voe com a gente em todos.');
    await expect(servicos.locator('a[href="/servicos/#marketing-360"]')).toHaveCount(1);
    const cards = servicos.locator('[role=list] a');
    await expect(cards).toHaveCount(5);
    expect(await cards.evaluateAll((els) => els.map((e) => e.getAttribute('href')))).toEqual(
      SLUGS.map((s) => `/servicos/#${s}`),
    );
    await expect(cards.nth(0)).toContainText('Identidade Visual');
    await expect(cards.nth(0)).toContainText('Marcas com alma.');
    await expect(servicos.locator('.dots')).toHaveAttribute('aria-hidden', 'true');
  });

  test('nuvens: uma única camada, só na base do céu', async ({ page }) => {
    const ceu = await countAsset(page.locator('#decolagem'), 'nuvem');
    expect(ceu.imgs).toBeLessThanOrEqual(1);
    expect(ceu.imgs + ceu.fundos).toBe(1);
    const servicos = await countAsset(page.locator('#servicos'), 'nuvem');
    expect(servicos).toEqual({ imgs: 0, fundos: 0 });
    const srcs = await page.locator('img').evaluateAll((els) => els.map((e) => (e as HTMLImageElement).src));
    for (const s of srcs) expect(s).not.toContain('flower');
  });

  test('chamada final', async ({ page }) => {
    const contato = page.locator('#contato');
    await expect(contato.locator('h2')).toHaveText('Vamos decolar juntos?');
    await expect(contato).toContainText(
      'Conte um pouco sobre o seu negócio e o que você quer alcançar. A gente responde com o melhor caminho para chegar lá.',
    );
    expect(await contato.getByRole('link', { name: 'Falar com a Nuestra' }).getAttribute('href')).toMatch(
      /^https:\/\/wa\.me\/5555991932679\?text=/,
    );
  });

  test('sem trecho de Cases enquanto a coleção está vazia', async ({ page }) => {
    await expect(page.locator('main a[href^="/cases/"]')).toHaveCount(0);
  });
});

test.describe('Home: comportamento', () => {
  test('CTA "Falar com a Nuestra" visível sem rolar no celular', async ({ page }, info) => {
    test.skip(info.project.name !== 'mobile', 'só celular');
    await page.goto('/');
    const links = page.getByRole('link', { name: 'Falar com a Nuestra' });
    const algumNaTela = async () => {
      for (const link of await links.all()) {
        if (!(await link.isVisible())) continue;
        const inteiro = await link.evaluate((el) => {
          const r = el.getBoundingClientRect();
          return r.top >= 0 && r.left >= 0 && r.bottom <= window.innerHeight && r.right <= window.innerWidth;
        });
        if (inteiro) return true;
      }
      return false;
    };
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    await expect.poll(algumNaTela).toBe(true);
  });

  test('o balão sobe ao rolar e flutua', async ({ page }) => {
    await page.goto('/');
    const rise = page.locator('[data-balao]');
    const img = rise.locator('img');
    expect(await img.evaluate((el) => getComputedStyle(el).animationName)).not.toBe('none');
    const antes = await transformOf(rise);
    await scrollTo(page, 400);
    await expect.poll(() => transformOf(rise)).not.toBe(antes);
  });

  test('reduzir movimento: o balão não flutua nem sobe', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const rise = page.locator('[data-balao]');
    expect(await rise.locator('img').evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
    const antes = await transformOf(rise);
    await scrollTo(page, 400);
    await frames(page);
    expect(await transformOf(rise)).toBe(antes);
  });

  test('régua de altitude acompanha o trecho atual', async ({ page }, info) => {
    await page.goto('/');
    if (info.project.name === 'mobile') {
      await expect(page.locator('[data-altimeter]')).toBeHidden();
      return;
    }
    const regua = page.locator('[data-altimeter]');
    await expect(regua).toHaveAttribute('data-current', 'decolagem');
    await expect(regua.locator('[data-label]').filter({ visible: true })).toHaveText(['Home']);
    await page.evaluate(() => document.getElementById('servicos')!.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await expect(regua).toHaveAttribute('data-current', 'servicos');
    await expect(regua.locator('[data-label]').filter({ visible: true })).toHaveText(['Serviços']);
  });

  test('régua de altitude também para em Sobre, entre Serviços e Contato', async ({ page }, info) => {
    test.skip(info.project.name === 'mobile', 'a régua só aparece no desktop');
    await page.goto('/');
    const regua = page.locator('[data-altimeter]');
    await expect(regua.locator('[data-stop]')).toHaveText(['Home', 'Serviços', 'Sobre', 'Contato']);
    await page.evaluate(() => document.getElementById('sobre')!.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await expect(regua).toHaveAttribute('data-current', 'sobre');
    await expect(regua.locator('[data-label]').filter({ visible: true })).toHaveText(['Sobre']);
    await page.evaluate(() => document.getElementById('contato')!.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await expect(regua).toHaveAttribute('data-current', 'contato');
  });

  test('o trecho Sobre da Home é centralizado, como o de Contato', async ({ page }) => {
    await page.goto('/');
    const centro = (seletor: string) =>
      page.locator(seletor).evaluate((el) => {
        const r = el.getBoundingClientRect();
        return { meio: Math.round(r.left + r.width / 2), alinhamento: getComputedStyle(el).textAlign };
      });
    const larguraUtil = await page.evaluate(() => document.documentElement.clientWidth);
    for (const seletor of ['#sobre h2', '#sobre .lead', '#sobre .todos']) {
      await page.locator(seletor).scrollIntoViewIfNeeded();
      const { meio } = await centro(seletor);
      expect(Math.abs(meio - larguraUtil / 2), `${seletor} fora do centro`).toBeLessThanOrEqual(2);
    }
    expect((await centro('#sobre h2')).alinhamento).toBe('center');
    expect((await centro('#contato h2')).alinhamento).toBe('center');
  });

  test('desktop: os 5 cartões de serviço cabem sem rolagem horizontal e fora da faixa da régua', async ({ page }, info) => {
    test.skip(info.project.name === 'mobile', 'no celular o carrossel rola de lado, de propósito');
    await page.goto('/');
    const lista = page.locator('#servicos [data-carousel]');
    await lista.scrollIntoViewIfNeeded();
    const { sw, cw } = await lista.evaluate((el) => ({ sw: el.scrollWidth, cw: el.clientWidth }));
    expect(sw).toBeLessThanOrEqual(cw + 1);
    const largura = page.viewportSize()!.width;
    const cartoes = lista.locator('a');
    await expect(cartoes).toHaveCount(5);
    for (let i = 0; i < 5; i++) {
      const caixa = (await cartoes.nth(i).boundingBox())!;
      expect(caixa.x).toBeGreaterThanOrEqual(0);
      expect(caixa.x + caixa.width).toBeLessThanOrEqual(largura - 120);
    }
  });
});

test.describe('Home com JavaScript desligado', () => {
  test.use({ javaScriptEnabled: false });

  test('conteúdo visível, carrossel rolável e menu no rodapé', async ({ page }, info) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    const cards = page.locator('#servicos [role=list] a');
    await expect(cards).toHaveCount(5);
    for (let i = 0; i < 5; i++) await expect(cards.nth(i)).toBeVisible();
    if (info.project.name === 'mobile') {
      const list = page.locator('#servicos [role=list]');
      const { sw, cw } = await list.evaluate((el) => ({ sw: el.scrollWidth, cw: el.clientWidth }));
      expect(sw).toBeGreaterThan(cw);
    }
    await expect(page.locator('footer nav a')).toHaveText(NAV.map((n) => n.label));
  });
});
