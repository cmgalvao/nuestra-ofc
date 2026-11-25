import { describe, it, expect } from 'vitest';
import { whatsappUrl, mailtoUrl } from '../../src/lib/contact';
const MSG = 'Ol%C3%A1!%20Gostaria%20de%20entrar%20em%20contato%20com%20a%20ag%C3%AAncia%20para%20solicitar%20uma%20informa%C3%A7%C3%A3o%20ou%20servi%C3%A7o.';
describe('contact links', () => {
  it('whatsapp abre conversa com a mensagem padrão', () => {
    expect(whatsappUrl()).toBe(`https://wa.me/5555991932679?text=${MSG}`);
  });
  it('mailto traz destinatário, assunto e corpo', () => {
    expect(mailtoUrl()).toBe(`mailto:nuestraoficial@gmail.com?subject=Contato%20pelo%20site&body=${MSG}`);
  });
});
