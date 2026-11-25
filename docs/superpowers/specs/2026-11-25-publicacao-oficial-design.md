# Publicação oficial do site Nuestra — design

Data: 25/11/2026. Status: aguardando aprovação final do Carlos.

## Intenção e porquê
Colocar o site da agência Nuestra no ar em **agencianuestra.com.br** e entregá-lo à Marília Zabot. O site precisa aparecer no Google e passar credibilidade; o visitante deve terminar chamando no WhatsApp. O Carlos administra tudo (contas, domínio, manutenção); a Marília só fornece conteúdo e valida na homologação.

## Objetivos
- Página **Sobre / Quem somos** construída e validada na homologação antes de ir ao ar (o texto já existe no documento de textos).
- Site oficial no ar em `https://agencianuestra.com.br/` com HTTPS válido.
- Homologação (GitHub Pages, `cmgalvao.github.io/nuestra-ofc/`) continua separada e fora do Google.
- Publicar no oficial só por decisão explícita do Carlos.
- Google conhece o site (Search Console, sitemap) e mede visitas (GA4) com consentimento.
- Política de privacidade (LGPD) publicada e ligada ao aviso de cookies.
- Carlos recebe um guia curto de manutenção e a lista de acessos.

## Não objetivos
- E-mail com o domínio (depois; hoje só Gmail).
- Conteúdo que ainda não existe: Cases, Blog, perguntas frequentes, avaliações e prazo de resposta. Entram depois, por roteiro, com o site já no ar.
- Foto do time na página Sobre (não há foto; a página sai sem ela).
- Redesenho de qualquer página.

## Anti-objetivos (seria falha mesmo funcionando)
- A homologação indexada no Google, competindo com o oficial.
- Qualquer push no `main` mudar o site oficial sem o Carlos querer.
- GA rodando antes do consentimento do visitante.
- O domínio antigo `nuestra.com.br` aparecendo em canonical, sitemap ou dados estruturados.

## Restrições
- Carlos é leigo em programação: passos em linguagem simples; o Claude executa o que for código.
- Código mora em `C:\Projetos\nuestra-site`; cópia no Drive a cada entrega (`npm run copy:drive`).
- Domínio já pago no Registro.br; DNS fica lá (sem trocar servidores de nomes).
- CSP atual (`public/_headers`) é `script-src 'self'`: precisa ser ajustada só o necessário para o GA.
- Push e publicação só quando o Carlos pedir.

## Abordagens consideradas
- **A. Netlify ligado ao `main`:** simples, mas todo push vai ao ar; anula a homologação.
- **B. Netlify ligado ao branch `producao` (escolhida pelo Carlos):** `main` alimenta só a prévia; "publicar" = levar o `main` para `producao`. Um passo a mais, feito pelo Claude.
- **C. Deploy manual:** controle total, mas depende de comando local a cada vez.

## Design
0. **Página Sobre (antes de tudo):** o texto está na seção 1 de `Textos\Textos do site – Nuestra Agência.docx` ("Do alto, vemos além", a tripulação, Marília Zabot e "O que nos move"). Criar `/sobre/` no estilo "O voo" já aprovado, com item no menu entre Home e Serviços (ordem do documento de textos; minha escolha), entrada no sitemap e um trecho na Home que leva à página. Vai para a homologação (`main`) para a Marília validar; só depois segue para `producao`. Motivo de não ter sido feita antes: o menu do roteiro V2 não lista Sobre e o design anterior leu o roteiro ao pé da letra, sem confrontar com o documento de textos — falha de leitura, não falta de conteúdo.
1. **Trocar o domínio no código:** `nuestra.com.br` → `agencianuestra.com.br` em `astro.config.mjs`, `public/robots.txt`, `src/config/site.ts`, `scripts/check-dist.mjs`, `tests/unit/seo.test.ts` e comentários/README. Rodar testes e build.
2. **Netlify:** conta do Carlos (plano gratuito); site ligado ao repositório `cmgalvao/nuestra-ofc`, branch `producao`; build `npm run build`, pasta `dist`, Node 24. `public/_headers` já é lido pelo Netlify. O build do Netlify não define `BASE_PATH` nem `PREVIEW` (raiz, indexável).
3. **Fluxo de publicação:** `main` → prévia (GitHub Pages). Quando aprovado, o Claude atualiza `producao` a partir do `main` (fast-forward) e o Netlify publica. Reverter = voltar o `producao` ou "publicar deploy anterior" no painel do Netlify.
4. **Domínio:** no Netlify, domínio principal `agencianuestra.com.br`, `www` redirecionando para ele. No Registro.br (modo DNS do próprio Registro.br), criar os registros que o Netlify indicar (A para o domínio raiz, CNAME para `www`); valores conferidos na documentação na hora. Aguardar propagação, emitir o certificado HTTPS (Let's Encrypt, automático) e ativar "forçar HTTPS".
5. **Google Search Console:** propriedade de domínio (verificação por TXT no Registro.br), enviar `sitemap-index.xml`, pedir indexação da home.
6. **GA4 + consentimento:** script do GA4 carregado só após aceite no banner de cookies (padrão: negado; sem aceite, nada é enviado). Ajustar a CSP para permitir só os domínios do Google necessários. Banner simples, em português, com "Aceitar" e "Recusar", e link para a política. Não carregar GA na prévia.
7. **Política de privacidade:** nova página `/politica-de-privacidade/`, linkada no rodapé e no banner; conteúdo cobre dados coletados (WhatsApp/e-mail por clique, GA4), finalidade, cookies, direitos do titular e contato. Dados do responsável (nome/razão social, CNPJ) fornecidos pelo Carlos/Marília.
8. **Verificação pós-publicação:** check-dist no build; abrir o site oficial e conferir canonical, `robots.txt`, sitemap, HTTPS, redirecionamento do `www`, links do WhatsApp, banner de cookies, ausência de `noindex`, e que a prévia segue `noindex`. Lighthouse na home.
9. **Entrega:** README atualizado (como publicar, onde está cada conta), lista de acessos (Registro.br, Netlify, GitHub, Search Console, GA4) com o Carlos como dono; cópia no Drive.

## O que fica para quem constrói
Valores exatos de DNS do Netlify; ID de medição do GA4 (depende da conta do Carlos); texto final da política; escolha da biblioteca ou do código do banner (preferir código próprio, sem dependência, compatível com CSP).

## Decisões do Carlos (25/11/2026)
- Publicar já, com Cases, Blog, perguntas frequentes, avaliações e prazo de resposta ainda pendentes.
- Responsável pelo site na política de privacidade: Nuestra Agência — Marília Zabott, proprietária; CNPJ 47.807.866/0001-72; contato: nuestraoficial@gmail.com.
- E-mail com o domínio fica para depois desta fase.

## Minhas escolhas a conferir
- Endereço principal sem `www` (`agencianuestra.com.br`), com `www` redirecionando para ele. O roteiro V2 escreve `www.agencianuestra.com.br`; é trocável se o Carlos preferir.
- Enquanto Cases e Blog estiverem vazios, suas páginas de lista continuam no menu com a mensagem "sem conteúdo ainda", mas marcadas `noindex` e fora do sitemap, para o Google não indexar página vazia; ao entrar o primeiro conteúdo, passam a ser indexadas.
- Grafia confirmada pelo Carlos: **Marília Zabott** (dois t). O documento de textos escreve "Zabot"; a página Sobre e a política usam "Zabott", e o Carlos corrige o documento de textos se quiser.
