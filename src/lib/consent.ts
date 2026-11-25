// Consentimento de cookies e GA4. Código puro (sem DOM), para poder ser testado.
export type Consent = 'granted' | 'denied' | null;

export const CONSENT_KEY = 'nuestra-consent';

export function readConsent(store: Pick<Storage, 'getItem'>): Consent {
  const valor = store.getItem(CONSENT_KEY);
  return valor === 'granted' || valor === 'denied' ? valor : null;
}

export function saveConsent(store: Pick<Storage, 'setItem'>, value: 'granted' | 'denied'): void {
  store.setItem(CONSENT_KEY, value);
}

/** ID de medição do GA4, como "G-ABC123XYZ9". */
export function isValidGaId(id: string | undefined): boolean {
  return !!id && /^G-[A-Z0-9]{6,12}$/.test(id);
}

export function gaScriptUrl(id: string): string {
  return `https://www.googletagmanager.com/gtag/js?id=${id}`;
}

/** O aviso e o GA só existem no site oficial (nunca na prévia) e com um ID válido. */
export function analyticsEnabled(id: string | undefined, preview: string | undefined): boolean {
  return isValidGaId(id) && preview !== '1';
}
