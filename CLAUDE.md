# Site da Nuestra: regras para o Claude

Este repositório é o site da agência Nuestra, mantido para o Carlos. Leia também `AGENTS.md` e `README.md`.

## Regras que não mudam

- Nunca invente serviços, clientes, cases, resultados, contatos ou textos institucionais. O conteúdo vem só do roteiro do Carlos em `G:\Meu Drive\PROJETOS\2026-2027 SITES\NUESTRA\Roteiros` ou das mensagens dele.
- Nada de flores ou folhas em lugar nenhum. Nuvens só no contexto de céu, e o mínimo possível.
- As cores da marca vêm de `src/styles/tokens.css`; não escreva cores novas no código. Fontes: Jost e Bitter.
- Contraste: texto azul-marinho sobre laranja só em tamanhos e contrastes que passem WCAG AA. A faixa destacada do cartão de embarque usa `--orange-light`.
- As fixtures de teste são fictícias e ficam em `tests/fixtures`.
- Textos de posts e cases usam `##` para subtítulos, nunca `#`. Nomes de arquivo sem acento nem espaço (`padaria-sao-joao.md`).
- CSP: `script-src 'self'`. Scripts de comportamento ficam em arquivos externos; nada de script embutido.

## Fluxo depois de cada mudança

1. `npm run build` (já inclui `check:dist`).
2. `npm test` e `npm run test:e2e`.
3. Commit.
4. `npm run copy:drive`.
5. Avisar o Carlos que a cópia no Drive foi feita.

## Git

- Nunca publique, faça push nem merge sem perguntar ao Carlos.
- A identidade do git é a configuração local do repositório; não use e-mails pessoais.

## Especificação

`G:\Meu Drive\PROJETOS\2026-2027 SITES\NUESTRA\Site\docs\2026-11-24-site-nuestra-design.md`
