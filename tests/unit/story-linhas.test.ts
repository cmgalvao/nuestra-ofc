import { describe, it, expect } from 'vitest';
import { quebrarLinhas, ajustarTitulo } from '../../src/lib/story-linhas';

// Medida de mentira: cada letra vale metade do tamanho da fonte.
const medir = (tamanho: number) => (s: string) => s.length * tamanho * 0.5;

describe('quebrarLinhas', () => {
  it('junta palavras até encher a largura', () => {
    expect(quebrarLinhas('um dois três quatro', 90, medir(20))).toEqual(['um dois', 'três', 'quatro']);
  });
  it('palavra maior que a largura fica sozinha na linha', () => {
    expect(quebrarLinhas('a extraordinariamente b', 60, medir(20))).toEqual(['a', 'extraordinariamente', 'b']);
  });
});

describe('ajustarTitulo', () => {
  it('título curto usa o maior tamanho', () => {
    expect(ajustarTitulo('Título curto', 900, medir)).toEqual({ tamanho: 74, linhas: ['Título curto'] });
  });
  it('título longo diminui a letra até caber em 4 linhas, sem perder palavras', () => {
    const longo = Array(20).fill('palavra').join(' ');
    const { tamanho, linhas } = ajustarTitulo(longo, 900, medir);
    expect(tamanho).toBeLessThan(74);
    expect(linhas.length).toBeLessThanOrEqual(4);
    expect(linhas.join(' ')).toBe(longo);
  });
});
