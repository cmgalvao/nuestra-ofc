import { SITE } from '../config/site';

const message = () => encodeURIComponent(SITE.contactMessage);

export function whatsappUrl(): string {
  return `https://wa.me/${SITE.whatsappNumber}?text=${message()}`;
}

export function mailtoUrl(): string {
  return `mailto:${SITE.email}?subject=${encodeURIComponent(SITE.emailSubject)}&body=${message()}`;
}
