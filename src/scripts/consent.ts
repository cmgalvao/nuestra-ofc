// Aviso de cookies: o GA4 só é carregado depois do aceite do visitante.
import { readConsent, saveConsent, gaScriptUrl } from '../lib/consent';

type GaWindow = Window & { dataLayer?: unknown[]; __gaLoaded?: boolean };

const banner = document.getElementById('cookie-banner');
const gaId = banner?.dataset.gaId;

function loadGa(id: string): void {
  const w = window as GaWindow;
  if (w.__gaLoaded) return;
  w.__gaLoaded = true;
  w.dataLayer = w.dataLayer || [];
  // O gtag precisa receber o objeto "arguments", não um array.
  function gtag(..._args: unknown[]) {
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer!.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', id);
  const script = document.createElement('script');
  script.async = true;
  script.src = gaScriptUrl(id);
  document.head.appendChild(script);
}

function clearGaCookies(): void {
  const dominios = [undefined, location.hostname, `.${location.hostname}`];
  for (const par of document.cookie.split(';')) {
    const nome = par.split('=')[0].trim();
    if (!/^_ga/.test(nome)) continue;
    for (const d of dominios) {
      document.cookie = `${nome}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d ? `; domain=${d}` : ''}`;
    }
  }
}

function lerConsentimento() {
  try {
    return readConsent(localStorage);
  } catch {
    return null;
  }
}

function guardar(valor: 'granted' | 'denied'): void {
  try {
    saveConsent(localStorage, valor);
  } catch {
    // Sem armazenamento (modo privado restrito): vale só para esta página.
  }
}

if (banner && gaId) {
  const mostrar = () => {
    banner.hidden = false;
    banner.focus();
  };
  const esconder = () => {
    banner.hidden = true;
  };

  // Com o GA desligado para este ID, o gtag não envia nada nem regrava cookies (opt-out oficial do Google).
  const desligarGa = () => {
    (window as unknown as Record<string, unknown>)[`ga-disable-${gaId}`] = true;
  };

  const inicial = lerConsentimento();
  if (inicial === 'granted') loadGa(gaId);
  else if (inicial === null) mostrar();
  else {
    // Recusou antes: garante que nenhum cookie _ga* sobrou (ex.: gravado pelo gtag ao fechar a página).
    desligarGa();
    clearGaCookies();
  }

  banner.querySelector('[data-cookie-accept]')?.addEventListener('click', () => {
    guardar('granted');
    esconder();
    loadGa(gaId);
  });

  banner.querySelector('[data-cookie-reject]')?.addEventListener('click', () => {
    const antes = lerConsentimento();
    guardar('denied');
    esconder();
    if (antes === 'granted' || (window as GaWindow).__gaLoaded) {
      desligarGa();
      clearGaCookies();
      location.reload();
    }
  });

  document.querySelectorAll('[data-open-cookies]').forEach((el) => el.addEventListener('click', mostrar));
}
