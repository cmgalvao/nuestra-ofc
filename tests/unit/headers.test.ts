import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const csp = readFileSync('public/_headers', 'utf8')
  .split('\n')
  .find((l) => l.trim().startsWith('Content-Security-Policy:')) ?? '';
const diretiva = (nome: string) =>
  csp.replace('Content-Security-Policy:', '').split(';').map((d) => d.trim()).find((d) => d.startsWith(nome + ' ')) ?? '';

describe('CSP de public/_headers', () => {
  it('script-src libera o Google Tag Manager e continua sem unsafe-inline', () => {
    expect(diretiva('script-src')).toContain('https://*.googletagmanager.com');
    expect(diretiva('script-src')).not.toContain('unsafe-inline');
  });

  it('connect-src libera o Google Analytics', () => {
    expect(diretiva('connect-src')).toContain('https://*.google-analytics.com');
  });

  it('connect-src libera https://*.google.com, pedido pela documentação do GA4 sem Ads', () => {
    expect(diretiva('connect-src')).toContain('https://*.google.com');
  });
});
