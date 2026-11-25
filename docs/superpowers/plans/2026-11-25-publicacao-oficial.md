# Publicação oficial do site Nuestra — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Colocar o site em `https://agencianuestra.com.br/` (Netlify, branch `producao`), com página Sobre, política de privacidade, GA4 com consentimento e Search Console, e entregar ao Carlos.

**Architecture:** Site Astro estático já aprovado. Mudanças de código pequenas e testadas (domínio, Sobre, noindex de listas vazias, consentimento/GA, privacidade, `netlify.toml`), seguidas de tarefas de operação (GA4, Netlify, DNS, Search Console) em que o Carlos é o dono das contas e o Claude guia e verifica por linha de comando. `main` alimenta só a prévia (GitHub Pages); `producao` alimenta o Netlify.

**Tech Stack:** Astro 7, TypeScript, Vitest (`npm test`), Playwright (`npm run test:e2e`), `scripts/check-dist.mjs`, Netlify, Registro.br, GA4, Google Search Console.

**Spec:** `docs/superpowers/specs/2026-11-25-publicacao-oficial-design.md`

## Global Constraints

- Domínio oficial: `agencianuestra.com.br` (sem `www` como principal; `www` redireciona para ele). **Armadilha:** `agencianuestra.com.br` contém a string `nuestra.com.br`; ao procurar o domínio antigo use `grep -rnE "(^|[^a])nuestra\.com\.br"`.
- Grafia do nome: **Marília Zabott** (dois t) em todo texto novo.
- Responsável legal: Nuestra Agência — Marília Zabott, proprietária; CNPJ 47.807.866/0001-72; contato nuestraoficial@gmail.com; Santa Maria | RS.
- Sem dependências novas de runtime; o consentimento é código próprio. Node >=22.23.4.
- Nenhum script embutido na página além do JSON-LD (CSP `script-src` sem `'unsafe-inline'`); scripts novos ficam em `src/scripts/`.
- Links internos sempre com `withBase()`. Textos em português do Brasil. Sem flores/folhas; contraste conforme `CLAUDE.md`.
- GA nunca carrega antes do aceite; nunca na prévia (`PREVIEW=1`); a prévia continua `noindex`.
- Commits locais por tarefa. **Push (`main` e `producao`) só quando o Carlos pedir.**
- Ao final, cópia no Drive: `npm run copy:drive`.

## Review Focus

1. Visitante sem JavaScript: site funciona, nenhum banner, nenhum GA (Tarefa 4).
2. Visitante que recusa e volta: banner não reaparece e GA nunca carrega; quem aceitou e depois recusa tem os cookies `_ga*` apagados (Tarefa 4).
3. Build da prévia com `PUBLIC_GA_ID` definido: continua sem banner e sem GA (Tarefa 4).
4. Cases/Blog vazios: `noindex` e fora do sitemap; com conteúdo (fixtures), indexáveis e no sitemap (Tarefa 3).
5. `http://` e `www` redirecionam para `https://agencianuestra.com.br/`, e o canonical é sempre esse endereço (Tarefa 9).

---

### Task 1: Trocar o domínio para agencianuestra.com.br

**Files:**
- Modify: `tests/unit/seo.test.ts`, `src/config/site.ts` (`SITE.url`), `astro.config.mjs` (`site`), `public/robots.txt`, `scripts/check-dist.mjs` (`ORIGIN`), `README.md`, `.github/workflows/pages.yml`, `src/components/Seo.astro` e `src/lib/url.ts` (só comentários)

**Interfaces:**
- Produces: `SITE.url === 'https://agencianuestra.com.br'`; `canonicalUrl(path)` devolve URLs desse domínio. Todas as tarefas seguintes dependem disso.

- [ ] **Step 1: Atualizar o teste** em `tests/unit/seo.test.ts`: trocar todas as ocorrências esperadas por `https://agencianuestra.com.br/servicos/`, `https://agencianuestra.com.br/` e o `item` do breadcrumb equivalente.
- [ ] **Step 2: Rodar** `npx vitest run tests/unit/seo.test.ts` — Expected: FAIL (esperado `agencianuestra`, recebido `nuestra`).
- [ ] **Step 3: Trocar o domínio** nos demais arquivos listados (valor, não só comentário). `robots.txt` termina com `Sitemap: https://agencianuestra.com.br/sitemap-index.xml`.
- [ ] **Step 4: Verificar** `npm test` (PASS), `npm run build` (termina com `check-dist: N páginas OK`) e `grep -rnE "(^|[^a])nuestra\.com\.br" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude-dir=dist-fixtures --exclude-dir=.astro --exclude-dir=test-results --exclude-dir=lighthouse` — Expected: sem resultados.
- [ ] **Step 5: Commit** `git add -A && git commit -m "fix: domínio oficial agencianuestra.com.br"`

### Task 2: Página Sobre, menu e trecho na Home

**Files:**
- Create: `src/pages/sobre.astro`, `tests/e2e/sobre.spec.ts`
- Modify: `src/config/site.ts` (`NAV`), `src/pages/index.astro`, `tests/e2e/helpers.ts` (`PAGES`)

**Interfaces:**
- Consumes: `BaseLayout`, `PageHead` (props `title`, `intro`, `crumbs`), `whatsappUrl()` de `src/lib/contact.ts`, `withBase()`.
- Produces: rota `/sobre/`; item de menu `{ label: 'Sobre', href: '/sobre/' }` logo depois de Home em `NAV`; seção `#sobre` na Home; `PAGES` inclui `'/sobre/'` (os testes de acessibilidade/layout/base já percorrem `PAGES`).

Decisões (minhas, a conferir): rótulo "Sobre", URL `/sobre/`, título da aba "Sobre | Nuestra Agência"; sem foto; o texto vem de `Textos\Textos do site – Nuestra Agência.docx`, seção 1, **com "Zabott"**.

- [ ] **Step 1: Escrever `tests/e2e/sobre.spec.ts`** (padrão dos outros specs):
  - `h1` tem o texto `Do alto, vemos além.`; `title` é `Sobre | Nuestra Agência`; meta description não vazia e `canonical` é `https://agencianuestra.com.br/sobre/`.
  - a página contém `Marília Zabott` e nenhum texto casa `/Zabot(?!t)/`.
  - a lista "O que nos move" tem 4 itens (começam por `Planejamento e antecipação`, `Criatividade propositiva`, `Organização`, `Referência`).
  - `Porque aqui, o seu negócio vai mais longe.` aparece, seguido de um link para o WhatsApp (`whatsappUrl()`).
  - o menu (`#menu-principal`) e o rodapé têm o link `Sobre`, na ordem `Home, Sobre, Serviços, Cases, Blog, Contatos`.
  - a Home tem `#sobre` com link para `/sobre/`.
- [ ] **Step 2: Rodar** `npx playwright test tests/e2e/sobre.spec.ts` — Expected: FAIL (404).
- [ ] **Step 3: Criar `src/pages/sobre.astro`** com `BaseLayout` (`title="Sobre"`, `path="/sobre/"`, breadcrumbs `[{ name: 'Sobre', path: '/sobre/' }]`, `showBreadcrumbs={false}`), `PageHead` com `title="Do alto, vemos além."` e `intro` = primeiro parágrafo do texto; depois seção de corpo no mesmo estilo de `servicos.astro` (fundo de papel, `.wrap` de 48rem) com os dois parágrafos seguintes, o parágrafo de Marília Zabott, `<h2>O que nos move</h2>` e uma `<ul>` de 4 itens (rótulo em negrito), a frase final e o botão de WhatsApp (mesmo estilo `.btn` da Home).
- [ ] **Step 4: Inserir o item em `NAV`** e adicionar `'/sobre/'` a `PAGES`.
- [ ] **Step 5: Em `src/pages/index.astro`**, depois de `<ServicesCarousel />`, adicionar `<section class="trecho" id="sobre" aria-labelledby="sobre-titulo">` com `h2` "Do alto, vemos além.", o primeiro parágrafo e o link `Conheça a tripulação →` para `withBase('/sobre/')`, reaproveitando as classes `.trecho`, `.wrap` e `.todos`. A régua de altitude (`stops`) não muda.
- [ ] **Step 6: Rodar** `npm run test:e2e` (todos os specs, celular e computador) — Expected: PASS, inclusive `a11y` e `layout` com a nova página e o menu de 6 itens. Corrigir qualquer teste que contasse 5 itens de menu.
- [ ] **Step 7: Commit** `git add -A && git commit -m "feat: página Sobre, item de menu e trecho na Home"`

### Task 3: Cases e Blog vazios ficam fora do Google

**Files:**
- Modify: `src/lib/optional-glob.ts`, `astro.config.mjs`, `src/pages/cases/index.astro`, `src/pages/blog/index.astro`, `scripts/check-dist.mjs`
- Test: `tests/unit/optional-glob.test.ts` (novo), `tests/e2e/cases-blog.spec.ts`, `tests/e2e/cases-blog-fixtures.spec.ts`

**Interfaces:**
- Produces: `export function emptySectionPaths(): string[]` em `optional-glob.ts` — devolve `'/cases/'` e/ou `'/blog/'` para cada coleção opcional sem arquivo `.md/.mdx` (usa `hasContentFiles(optionalDir(name))`); usada pelo filtro do sitemap.

- [ ] **Step 1: Teste unitário** `tests/unit/optional-glob.test.ts`: com `process.env.CONTENT_DIR` apontando para um diretório temporário sem `cases`/`blog`, `emptySectionPaths()` é `['/cases/', '/blog/']`; criando `cases/x.md`, passa a ser `['/blog/']`.
- [ ] **Step 2: Teste e2e**: em `cases-blog.spec.ts` (build padrão, sem conteúdo) `/cases/` e `/blog/` têm `meta[name=robots]` com `noindex`; em `cases-blog-fixtures.spec.ts` (com conteúdo) não têm. Se a prévia já força `noindex` nos testes, a asserção usa um build sem `PREVIEW`, como o `playwright.config.ts` definir — ajustar a config se preciso, sem mudar o comportamento da prévia.
- [ ] **Step 3: Rodar** os dois — Expected: FAIL.
- [ ] **Step 4: Implementar** `emptySectionPaths`; no `astro.config.mjs`, o filtro do sitemap passa a excluir também esses caminhos (se a config não importar `.ts`, mover só essa função e `hasContentFiles` para um `.mjs` sem tipos e reexportar); nas duas páginas de lista, `noindex={cases.length === 0}` / `noindex={posts.length === 0}` no `BaseLayout`.
- [ ] **Step 5: `check-dist.mjs`**: quando `PREVIEW !== '1'`, falhar se alguma página com `<meta name="robots" content="noindex">` aparecer em `sitemap-0.xml`. Verificar: `npm run build` PASS; `npm test` e `npm run test:e2e` PASS.
- [ ] **Step 6: Commit** `git add -A && git commit -m "feat: Cases e Blog vazios com noindex e fora do sitemap"`

### Task 4: Aviso de cookies e GA4 com consentimento

**Files:**
- Create: `src/lib/consent.ts`, `src/scripts/consent.ts`, `src/components/CookieBanner.astro`, `tests/unit/consent.test.ts`, `tests/unit/headers.test.ts`, `tests/e2e/cookies.spec.ts`
- Modify: `src/layouts/BaseLayout.astro` (renderiza o banner), `src/components/Footer.astro` (botão "Cookies"), `public/_headers`, `playwright.config.ts` (env do servidor de teste), `scripts/check-dist.mjs`

**Interfaces:**
- Produces em `src/lib/consent.ts` (código puro, sem DOM):
  - `type Consent = 'granted' | 'denied' | null`
  - `const CONSENT_KEY = 'nuestra-consent'`
  - `readConsent(store: Pick<Storage, 'getItem'>): Consent` (valor desconhecido → `null`)
  - `saveConsent(store: Pick<Storage, 'setItem'>, value: 'granted' | 'denied'): void`
  - `isValidGaId(id: string | undefined): boolean` — `/^G-[A-Z0-9]{6,12}$/`
  - `gaScriptUrl(id: string): string` — `https://www.googletagmanager.com/gtag/js?id=<id>`
  - `analyticsEnabled(id: string | undefined, preview: string | undefined): boolean` — ID válido e `preview !== '1'`
- Produces no HTML (só quando `analyticsEnabled(import.meta.env.PUBLIC_GA_ID, process.env.PREVIEW)`): `<aside id="cookie-banner" hidden data-ga-id="G-…">` com botões `Aceitar` e `Recusar` e link para `/politica-de-privacidade/`; e no rodapé o botão `Cookies` (`data-open-cookies`) que reabre o aviso.

- [ ] **Step 1: Testes unitários** `consent.test.ts`: `readConsent` com store vazio → `null`; após `saveConsent(s, 'granted')` → `'granted'`; valor lixo → `null`; `isValidGaId('G-ABC123XYZ9')` true, `undefined`/`'UA-1'`/`'G-'` false; `gaScriptUrl('G-ABC123XYZ9')` igual a `https://www.googletagmanager.com/gtag/js?id=G-ABC123XYZ9`; `analyticsEnabled('G-ABC123XYZ9', '1')` false, `(…, undefined)` true, `(undefined, undefined)` false. `headers.test.ts`: lê `public/_headers`; a diretiva `script-src` contém `https://*.googletagmanager.com` e **não** contém `unsafe-inline`; `connect-src` contém `https://*.google-analytics.com`.
- [ ] **Step 2: Teste e2e** `cookies.spec.ts` (servidor de teste com `PUBLIC_GA_ID=G-TEST000000`; interceptar `https://www.googletagmanager.com/**` com `page.route` respondendo `200` vazio e contar chamadas): (a) primeira visita mostra o banner e **zero** chamadas ao Google; (b) `Recusar` esconde o banner, grava `denied`, zero chamadas, e após recarregar o banner não volta; (c) `Aceitar` grava `granted`, faz 1 chamada a `gtag/js?id=G-TEST000000`, e após recarregar o banner não volta e a chamada acontece de novo; (d) com `granted`, clicar em `Cookies` no rodapé e `Recusar` apaga cookies `_ga*` (criar um `_ga=x` antes) e grava `denied`; (e) com JavaScript desligado (`javaScriptEnabled: false`) o banner continua oculto e o site é utilizável.
- [ ] **Step 3: Rodar** unitários e `npx playwright test tests/e2e/cookies.spec.ts` — Expected: FAIL.
- [ ] **Step 4: Implementar** `src/lib/consent.ts`; `CookieBanner.astro` (visual simples, tokens do site, foco visível, texto em português curto); `src/scripts/consent.ts` (importado pelo componente como `<script>` processado pelo Astro, nunca embutido): ao carregar lê o consentimento — `null` mostra o banner; `granted` chama `loadGa(id)`: cria `window.dataLayer`, `gtag('js', new Date())`, `gtag('config', id)` e injeta `<script async src=gaScriptUrl(id)>`; ao aceitar/recusar grava com `saveConsent`; recusar depois de aceito expira `_ga` e `_ga_*` e recarrega a página. Footer: botão `Cookies` renderizado sob a mesma condição `analyticsEnabled`.
- [ ] **Step 5: `public/_headers`** — trocar a linha `Content-Security-Policy` por (uma linha só):
  `Content-Security-Policy: default-src 'self'; img-src 'self' data: https://*.google-analytics.com https://*.googletagmanager.com; style-src 'self' 'unsafe-inline'; script-src 'self' https://*.googletagmanager.com; connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com; font-src 'self'; frame-ancestors 'none'; base-uri 'self'`
  Conferir esses domínios na documentação atual do Google ("Content Security Policy" para GA4/gtag) antes de fechar; ajustar só se divergirem.
- [ ] **Step 6: `check-dist.mjs`**: falhar se qualquer HTML contiver `googletagmanager.com` (o GA só entra pelo script, depois do aceite); em build com `PREVIEW=1`, falhar se houver `cookie-banner`.
- [ ] **Step 7: Verificar** `PREVIEW=1 PUBLIC_GA_ID=G-TEST000000 npm run build` — PASS e `grep -c cookie-banner dist/index.html` → `0`; `PUBLIC_GA_ID=G-TEST000000 npm run build` — `grep -c cookie-banner dist/index.html` → `1`; `npm test` e `npm run test:e2e` PASS.
- [ ] **Step 8: Commit** `git add -A && git commit -m "feat: aviso de cookies e GA4 só após consentimento"`

### Task 5: Política de privacidade

**Files:**
- Create: `src/pages/politica-de-privacidade.astro`, `tests/e2e/privacidade.spec.ts`
- Modify: `src/components/Footer.astro` (link), `tests/e2e/helpers.ts` (`PAGES`)

**Interfaces:**
- Produces: rota `/politica-de-privacidade/` (título `Política de Privacidade | Nuestra Agência`); link `Política de privacidade` no rodapé de todas as páginas. Fora de `NAV` (não vai no menu).

- [ ] **Step 1: Teste e2e**: `h1` = `Política de Privacidade`; texto contém `Nuestra Agência`, `Marília Zabott`, `47.807.866/0001-72`; link `mailto:` para `nuestraoficial@gmail.com`; contém os títulos `Dados que coletamos`, `Cookies e Google Analytics`, `Seus direitos`; rodapé de `/` tem o link para a página; `'/politica-de-privacidade/'` entra em `PAGES`.
- [ ] **Step 2: Rodar** — Expected: FAIL.
- [ ] **Step 3: Criar a página** (mesmo molde de `sobre.astro`) com as seções: Quem somos (controlador e contato); Dados que coletamos (o site não tem formulário; clicar em WhatsApp, e-mail ou Instagram leva a conversa para esses serviços, com política própria; medição de visitas via Google Analytics 4 só com consentimento); Finalidade e base legal (consentimento, LGPD art. 7º, I); Cookies e Google Analytics (cookies `_ga*`, como recusar ou revogar pelo botão "Cookies" do rodapé); Compartilhamento (Google, Netlify como hospedagem); Por quanto tempo guardamos; Seus direitos (LGPD art. 18, como pedir pelo e-mail); Alterações; data de atualização `25/11/2026`. Linguagem simples. **Nota ao Carlos na entrega:** é texto padrão; vale a Marília ou um advogado revisar.
- [ ] **Step 4: Link no rodapé** (perto do `©`), com `withBase('/politica-de-privacidade/')`.
- [ ] **Step 5: Verificar** `npm test`, `npm run build`, `npm run test:e2e` PASS.
- [ ] **Step 6: Commit** `git add -A && git commit -m "feat: política de privacidade"`

### Task 6: Configuração do Netlify e documentação

**Files:**
- Create: `netlify.toml`
- Modify: `README.md`

- [ ] **Step 1: Criar `netlify.toml`** exatamente:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "24"

# Cópias de teste do Netlify nunca entram no Google.
[context.deploy-preview.environment]
  PREVIEW = "1"

[context.branch-deploy.environment]
  PREVIEW = "1"
```

- [ ] **Step 2: Build como o Netlify faz** (sem `BASE_PATH` nem `PREVIEW`): `npm ci && npm run build` — Expected: `check-dist ... OK`; `grep -c noindex dist/index.html` → `0`; `grep -o 'href="https://agencianuestra.com.br/"' dist/index.html` encontra o canonical.
- [ ] **Step 3: README**: substituir "O que está pendente" pelo estado real (pendentes: Cases, Blog, perguntas frequentes, avaliações, prazo de resposta, e-mail do domínio, intro do traço) e adicionar a seção "Como publicar no site oficial": `main` = prévia; para publicar, o Carlos pede ao Claude, que leva o `main` para `producao` (`git push origin main:producao`); o Netlify publica sozinho; para voltar atrás, "Publish deploy" de um deploy anterior no painel do Netlify. Incluir `PUBLIC_GA_ID` como variável do Netlify. Sem senhas no README.
- [ ] **Step 4: Verificar** `npm test`, `npm run test:e2e` PASS. **Commit** `git add -A && git commit -m "chore: netlify.toml e guia de publicação"`

### Task 7: Homologação — validação do cliente (gate)

**Quem:** Carlos pede o push; Claude executa; Carlos e Marília validam.

- [ ] **Step 1: Quando o Carlos pedir**, `git push origin main`. Acompanhar o workflow "Prévia no GitHub Pages" até concluir (`gh run list --limit 1`) — Expected: `completed success`.
- [ ] **Step 2: Conferir** em `https://cmgalvao.github.io/nuestra-ofc/sobre/` e `…/politica-de-privacidade/` que carregam; `curl -s https://cmgalvao.github.io/nuestra-ofc/ | grep -c noindex` ≥ 1; sem banner de cookies na prévia.
- [ ] **Step 3: Carlos e Marília validam** Sobre, política e o restante. **Não seguir sem o "ok" do Carlos.** Ajustes voltam como mudanças no `main` e repetem a Tarefa 7.

### Task 8: Criar a medição do GA4 (Carlos)

**Quem:** Carlos (conta Google dele); Claude guia.

- [ ] **Step 1:** em analytics.google.com criar uma propriedade GA4 "Nuestra Agência" e um fluxo de dados Web com URL `agencianuestra.com.br`; manter as configurações padrão.
- [ ] **Step 2:** copiar o **ID de medição** (`G-XXXXXXXXXX`) e entregar ao Claude no chat (não é segredo). Conferir o formato (`/^G-[A-Z0-9]{6,12}$/`, o mesmo de `isValidGaId` da Tarefa 4).

### Task 9: Netlify, branch `producao` e domínio

**Quem:** Carlos cria a conta e autoriza; Claude guia e verifica. Cada tela abaixo é do Netlify ou do Registro.br — conferir os valores exatos que elas mostrarem.

- [ ] **Step 1: Branch.** Quando o Carlos pedir: `git push origin main:producao`.
- [ ] **Step 2: Netlify.** Carlos entra em netlify.com com a conta do GitHub dele → *Add new site → Import an existing project* → repositório `cmgalvao/nuestra-ofc` → *Branch to deploy:* `producao`. Build e pasta vêm do `netlify.toml`. Em *Site configuration → Environment variables* criar `PUBLIC_GA_ID` com o ID da Tarefa 8, escopo *Production*. Em *Build & deploy → Branches and deploy contexts*, deixar só o branch de produção publicando.
- [ ] **Step 3: Verificar o endereço provisório** `https://<nome>.netlify.app/`: `curl -sI` retorna `200` e `content-security-policy` com `googletagmanager`; `curl -s … | grep -c noindex` → `0`.
- [ ] **Step 4: Domínio no Netlify.** *Domain management → Add a domain* → `agencianuestra.com.br`; marcá-lo como domínio principal e adicionar `www.agencianuestra.com.br` (o Netlify redireciona o `www` para o principal). Anotar os registros que o Netlify indicar.
- [ ] **Step 5: DNS no Registro.br.** Painel do Registro.br → domínio → confirmar que usa o **DNS do Registro.br** (não servidores externos) → *Editar zona*: criar o registro `A` do domínio raiz com o IP do balanceador que o Netlify mostrou (hoje `75.2.60.5`, confirmar na tela) e o `CNAME` de `www` para `<nome>.netlify.app`. Não mexer em outros registros.
- [ ] **Step 6: Esperar a propagação** (minutos a horas) e conferir: `nslookup agencianuestra.com.br` (IP do Netlify) e `nslookup -type=CNAME www.agencianuestra.com.br`.
- [ ] **Step 7: HTTPS.** No Netlify, *Verify DNS configuration* e *Provision certificate* (Let's Encrypt), depois *Force HTTPS*.
- [ ] **Step 8: Verificar os redirecionamentos** — Expected em cada linha:
  - `curl -sI https://agencianuestra.com.br/` → `200`
  - `curl -sI https://www.agencianuestra.com.br/` → `301` com `location: https://agencianuestra.com.br/`
  - `curl -sI http://agencianuestra.com.br/` → `301` com `location: https://agencianuestra.com.br/`
  - `curl -s https://agencianuestra.com.br/ | grep -o '<link rel="canonical"[^>]*>'` → `href="https://agencianuestra.com.br/"`

### Task 10: Google Search Console (Carlos)

**Quem:** Carlos (conta Google dele); Claude guia.

- [ ] **Step 1:** em search.google.com/search-console *Adicionar propriedade → Domínio* → `agencianuestra.com.br`; copiar o registro `TXT` de verificação.
- [ ] **Step 2:** criar esse `TXT` na zona do Registro.br (raiz do domínio) e clicar em *Verificar* — Expected: propriedade verificada.
- [ ] **Step 3:** *Sitemaps → Adicionar* `sitemap-index.xml` — Expected: status *Sucesso*. Em *Inspeção de URL*, inspecionar `https://agencianuestra.com.br/` e *Solicitar indexação*.

### Task 11: Verificação final do site oficial

**Quem:** Claude.

- [ ] **Step 1: Arquivos públicos.** `curl -s https://agencianuestra.com.br/robots.txt` mostra `Sitemap: https://agencianuestra.com.br/sitemap-index.xml`; `curl -s https://agencianuestra.com.br/sitemap-0.xml` lista `/sobre/`, `/servicos/`, `/contatos/`, `/politica-de-privacidade/` e **não** `/cases/` nem `/blog/` (vazios).
- [ ] **Step 2: Páginas.** `curl -s -o /dev/null -w "%{http_code}" https://agencianuestra.com.br/<rota>/` → `200` para `/`, `/sobre/`, `/servicos/`, `/cases/`, `/blog/`, `/contatos/`, `/politica-de-privacidade/`; uma rota inexistente → `404`.
- [ ] **Step 3: Consentimento na produção** (navegador): banner aparece na primeira visita; sem aceitar, nenhuma chamada a `googletagmanager.com` na aba de rede; ao aceitar, a chamada acontece e o acesso aparece em *Relatórios → Tempo real* do GA4; links de WhatsApp, e-mail e Instagram funcionam.
- [ ] **Step 4: Lighthouse** na home em produção (celular): registrar as quatro notas no README; investigar qualquer nota abaixo de 90.
- [ ] **Step 5: A prévia segue fora do Google:** `curl -s https://cmgalvao.github.io/nuestra-ofc/ | grep -c noindex` ≥ 1.

### Task 12: Entrega ao Carlos

**Quem:** Claude, com o Carlos.

- [ ] **Step 1: Guia de acessos** em `README.md` (sem senhas): onde está cada coisa e quem é o dono — Registro.br (domínio), Netlify (hospedagem), GitHub `cmgalvao/nuestra-ofc` (código e prévia), Google Search Console, GA4 — todos no nome do Carlos; lembrar de ativar verificação em duas etapas nessas contas.
- [ ] **Step 2: Lembretes de manutenção** no README: renovação anual do domínio no Registro.br; como pedir mudanças (roteiro → Claude → prévia → "publica"); o que ainda falta (Cases, Blog, FAQ, avaliações, prazo de resposta, e-mail do domínio).
- [ ] **Step 3: Commit** `git add -A && git commit -m "docs: guia de acessos e manutenção"`; `git push origin main` e `git push origin main:producao` quando o Carlos pedir.
- [ ] **Step 4: Cópia no Drive:** `npm run copy:drive` — Expected: "Cópia concluída". Avisar o Carlos.
- [ ] **Step 5: Memória do projeto:** atualizar a nota do projeto com "site oficial no ar em agencianuestra.com.br desde <data>".
