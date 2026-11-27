// Quebra o título em linhas para a arte de story (o canvas não quebra texto sozinho).
type Medir = (texto: string) => number;

export function quebrarLinhas(texto: string, largura: number, medir: Medir): string[] {
  const linhas: string[] = [];
  for (const palavra of texto.split(/\s+/).filter(Boolean)) {
    const junto = linhas.length ? `${linhas[linhas.length - 1]} ${palavra}` : palavra;
    if (linhas.length && medir(junto) <= largura) linhas[linhas.length - 1] = junto;
    else linhas.push(palavra);
  }
  return linhas;
}

// Começa na letra grande e diminui até o título caber em 4 linhas.
export function ajustarTitulo(texto: string, largura: number, medirEm: (tamanho: number) => Medir) {
  let tamanho = 74;
  let linhas = quebrarLinhas(texto, largura, medirEm(tamanho));
  while (tamanho > 40 && linhas.length > 4) {
    tamanho -= 4;
    linhas = quebrarLinhas(texto, largura, medirEm(tamanho));
  }
  return { tamanho, linhas };
}
