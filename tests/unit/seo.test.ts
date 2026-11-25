import { describe, it, expect } from 'vitest';
import { pageTitle, canonicalUrl, localBusinessSchema, breadcrumbSchema } from '../../src/lib/seo';
describe('seo', () => {
  it('título da home e das seções', () => {
    expect(pageTitle()).toBe('Nuestra Agência | Comunicação e marketing em Santa Maria/RS');
    expect(pageTitle('Serviços')).toBe('Serviços | Nuestra Agência');
  });
  it('canonical absoluto', () => {
    expect(canonicalUrl('/servicos/')).toBe('https://nuestra.com.br/servicos/');
    expect(canonicalUrl('/')).toBe('https://nuestra.com.br/');
  });
  it('schema local sem endereço de rua', () => {
    const s: any = localBusinessSchema();
    expect(s['@type']).toBe('ProfessionalService');
    expect(s.name).toBe('Nuestra Agência');
    expect(s.telephone).toBe('+55-55-99193-2679');
    expect(s.email).toBe('nuestraoficial@gmail.com');
    expect(s.address).toEqual({ '@type': 'PostalAddress', addressLocality: 'Santa Maria', addressRegion: 'RS', addressCountry: 'BR' });
    expect(s.sameAs).toEqual(['https://www.instagram.com/agencianuestra']);
    expect(s.address.streetAddress).toBeUndefined();
  });
  it('breadcrumb com posições e URLs absolutas', () => {
    const b: any = breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Serviços', path: '/servicos/' }]);
    expect(b['@type']).toBe('BreadcrumbList');
    expect(b.itemListElement[1]).toEqual({ '@type': 'ListItem', position: 2, name: 'Serviços', item: 'https://nuestra.com.br/servicos/' });
  });
});
