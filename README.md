# Site da Nuestra

Este é o código do site da agência Nuestra. Este guia explica, em linguagem simples, como ver o site no computador e onde ficam os textos.

O código fica em `C:\Projetos\nuestra-site`. A cópia no Google Drive é só um backup (veja "Guardar uma cópia no Drive").

## Como abrir o site no computador

1. Abra o terminal dentro da pasta `C:\Projetos\nuestra-site`.
2. Só na primeira vez (ou depois de baixar o projeto de novo), instale as peças que o site usa:
   ```
   npm install
   ```
3. Ligue o site de teste:
   ```
   npm run dev
   ```
4. Abra no navegador: <http://localhost:4321>

O site de teste só existe no seu computador. Para desligar, volte ao terminal e aperte `Ctrl + C`.

## Onde ficam os textos

Os textos ficam em arquivos simples, dentro de `src/content`. Cada arquivo começa com um bloco entre duas linhas `---` (os "campos") e, depois dele, o texto livre.

### Serviços — `src/content/servicos`

Há um arquivo por serviço. Campos:

- `order`: posição do serviço na lista (1, 2, 3...).
- `slug`: nome usado no endereço da página, sem espaços nem acentos.
- `nome`: nome do serviço.
- `frase`: frase curta de destaque.
- `entregas`: lista do que está incluído no serviço.

### Cases — `src/content/cases`

Um arquivo `.md` por case. A pasta está vazia por enquanto. Enquanto não houver nenhum arquivo, o site mostra a mensagem de "sem conteúdo ainda". Campos:

- `titulo`: título do case.
- `cliente`: nome do cliente.
- `capa`: imagem principal do case.
- `imagens`: lista de imagens do case.
- `descricao`: resumo curto.
- `desafio`: qual era o problema (opcional).
- `solucao`: o que foi feito (opcional).
- `resultado`: o que foi alcançado (opcional).
- `data`: data do projeto, no formato `2026-12-31`.

Modelo de um arquivo (exemplo apenas, os valores abaixo são inventados para mostrar o formato; troque tudo pelos dados reais):

```
---
titulo: "EXEMPLO — título do case"
cliente: "EXEMPLO — nome do cliente"
capa: "../../assets/exemplo-capa.jpg"
imagens:
  - "../../assets/exemplo-1.jpg"
descricao: "EXEMPLO — resumo em uma ou duas frases."
data: 2026-12-31
---

Texto livre do case, se quiser.
```

As imagens precisam estar na pasta `src/assets`, e o caminho é escrito a partir do arquivo do case.

### Blog — `src/content/blog`

Um arquivo `.md` por post. Também está vazia por enquanto. Campos:

- `titulo`: título do post.
- `descricao`: resumo curto (aparece nas listas e no Google).
- `capa`: imagem de capa.
- `capaAlt`: descrição da imagem de capa, para quem não consegue vê-la.
- `data`: data de publicação, no formato `2026-12-31`.
- `autor`: nome de quem escreveu.

Modelo (exemplo apenas, valores inventados):

```
---
titulo: "EXEMPLO — título do post"
descricao: "EXEMPLO — resumo do post."
capa: "../../assets/exemplo-capa.jpg"
capaAlt: "EXEMPLO — descrição da imagem"
data: 2026-12-31
autor: "EXEMPLO — nome do autor"
---

Texto do post.
```

Se algum campo obrigatório faltar, o `npm run dev` mostra um aviso dizendo qual.

### Regras para os arquivos de Cases e Blog

- Os nomes dos arquivos não têm acento nem espaço (exemplo: `padaria-sao-joao.md`).
- O texto de um post ou case usa `##` para os subtítulos, nunca `#` (o título da página já é o `#`).

## Guardar uma cópia no Drive

```
npm run copy:drive
```

Esse comando gera o site e copia o projeto para `G:\Meu Drive\PROJETOS\2026-2027 SITES\NUESTRA\Site\Site Inicial\nuestra-site`. No final aparece "Cópia concluída". Lembrete: o código de verdade mora em `C:\Projetos\nuestra-site`; a cópia no Drive é um backup e é sobrescrita a cada vez. Não edite os arquivos por lá.

## Prévia para o cliente (GitHub Pages)

O código fica em <https://github.com/cmgalvao/nuestra-ofc>. A cada envio para o `main`, o GitHub gera sozinho uma prévia navegável em <https://cmgalvao.github.io/nuestra-ofc/> (arquivo `.github/workflows/pages.yml`).

- A prévia fica fora do Google de propósito, para não competir com o agencianuestra.com.br quando ele for ao ar.
- Links internos usam `withBase()` (`src/lib/url.ts`), para funcionarem tanto na prévia (pasta `/nuestra-ofc/`) quanto no site oficial (raiz).

## Como publicar no site oficial

O site oficial (<https://agencianuestra.com.br>) fica no Netlify e é montado a partir do branch `producao`. O branch `main` alimenta só a prévia do GitHub Pages.

1. As mudanças entram no `main` e aparecem na prévia, para a Marília validar.
2. Quando estiver aprovado, o Carlos pede ao Claude "publica". O Claude leva o `main` para o `producao` (`git push origin main:producao`).
3. O Netlify publica sozinho em poucos minutos.
4. Para voltar atrás: no painel do Netlify, em *Deploys*, abra um deploy anterior e clique em *Publish deploy*.

Configuração do Netlify: arquivo `netlify.toml` (comando de build, pasta, Node 24). Cópias de teste do Netlify (`deploy-preview` e `branch-deploy`) saem com `PREVIEW=1`, ou seja, fora do Google.

### Google Analytics e aviso de cookies

O Google Analytics só existe no site oficial e só liga depois que o visitante aceita o aviso de cookies. Ele depende da variável `PUBLIC_GA_ID` (o ID de medição, no formato `G-XXXXXXXXXX`), cadastrada no Netlify em *Site configuration → Environment variables*. Sem essa variável não há aviso nem Google Analytics. Na prévia nunca aparecem.

## O que está pendente

- Cases (aguardando o material da Marília).
- Blog (aguardando o primeiro texto).
- Perguntas frequentes.
- Avaliações de clientes.
- Prazo de resposta (quanto tempo a agência leva para responder um contato).
- E-mail com o domínio (hoje só o Gmail).
- A animação de abertura "do traço ao balão" (a decisão ainda não foi tomada).

Enquanto Cases e Blog estão vazios, as páginas continuam no menu, mas ficam fora do Google (`noindex` e fora do mapa do site); passam a ser indexadas quando entrar o primeiro conteúdo.

## Testes (para quem for mexer no código)

- `npm test`: testes rápidos de partes do código.
- `npm run test:e2e`: abre o site num navegador automático e confere as páginas, no celular e no computador.
- `npm run check:dist`: confere o site gerado (títulos, endereços, mapa do site etc.).
