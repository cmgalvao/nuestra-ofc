import { describe, it, expect } from 'vitest';
import {
  CONSENT_KEY,
  readConsent,
  saveConsent,
  isValidGaId,
  gaScriptUrl,
  analyticsEnabled,
} from '../../src/lib/consent';

function memoria() {
  const dados = new Map<string, string>();
  return {
    getItem: (k: string) => dados.get(k) ?? null,
    setItem: (k: string, v: string) => void dados.set(k, v),
  };
}

describe('consentimento de cookies', () => {
  it('sem escolha anterior devolve null', () => {
    expect(readConsent(memoria())).toBeNull();
  });

  it('guarda e lê granted e denied', () => {
    const s = memoria();
    saveConsent(s, 'granted');
    expect(readConsent(s)).toBe('granted');
    saveConsent(s, 'denied');
    expect(readConsent(s)).toBe('denied');
  });

  it('valor desconhecido vira null', () => {
    const s = memoria();
    s.setItem(CONSENT_KEY, 'talvez');
    expect(readConsent(s)).toBeNull();
  });
});

describe('GA4', () => {
  it('valida o formato do ID de medição', () => {
    expect(isValidGaId('G-ABC123XYZ9')).toBe(true);
    expect(isValidGaId(undefined)).toBe(false);
    expect(isValidGaId('UA-1')).toBe(false);
    expect(isValidGaId('G-')).toBe(false);
  });

  it('monta a URL do script', () => {
    expect(gaScriptUrl('G-ABC123XYZ9')).toBe('https://www.googletagmanager.com/gtag/js?id=G-ABC123XYZ9');
  });

  it('só habilita com ID válido e fora da prévia', () => {
    expect(analyticsEnabled('G-ABC123XYZ9', '1')).toBe(false);
    expect(analyticsEnabled('G-ABC123XYZ9', undefined)).toBe(true);
    expect(analyticsEnabled(undefined, undefined)).toBe(false);
  });
});
