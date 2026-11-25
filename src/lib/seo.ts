import { SITE } from '../config/site';

export function pageTitle(section?: string): string {
  return section
    ? `${section} | ${SITE.name}`
    : `${SITE.name} | Comunicação e marketing em ${SITE.city}/${SITE.region}`;
}

export function canonicalUrl(path: string): string {
  return new URL(path, SITE.url).href;
}

export function localBusinessSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: SITE.name,
    url: SITE.url,
    logo: canonicalUrl('/logo.png'),
    telephone: '+55-55-99193-2679',
    email: SITE.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: SITE.city,
      addressRegion: SITE.region,
      addressCountry: 'BR',
    },
    areaServed: `${SITE.city}, ${SITE.region}`,
    sameAs: [SITE.instagramUrl],
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: canonicalUrl(item.path),
    })),
  };
}
