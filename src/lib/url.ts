// Prefixo de pasta do site. Vazio no site oficial (agencianuestra.com.br); "/nuestra-ofc" na prévia do GitHub Pages.
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Link interno com o prefixo do site: withBase('/servicos/') → '/servicos/' ou '/nuestra-ofc/servicos/'. */
export const withBase = (path: string): string => (path.startsWith('/') ? `${BASE}${path}` : path);
