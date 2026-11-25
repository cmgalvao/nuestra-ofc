const button = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
const nav = document.getElementById('menu-principal');

if (button && nav) {
  const setOpen = (open: boolean) => {
    button.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
    // Com o menu aberto, nada fora do menu (e do botão) recebe foco.
    const fora = document.querySelectorAll<HTMLElement>('body > :not(header), .site-header .logo');
    fora.forEach((el) => {
      if (open) el.setAttribute('inert', '');
      else el.removeAttribute('inert');
    });
  };

  button.addEventListener('click', () => {
    setOpen(button.getAttribute('aria-expanded') !== 'true');
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      button.focus();
    }
  });

  document.querySelector('[data-menu-scrim]')?.addEventListener('click', () => setOpen(false));

  nav.addEventListener('click', (event) => {
    if ((event.target as HTMLElement).closest('a')) setOpen(false);
  });

  window.matchMedia('(min-width: 900px)').addEventListener('change', (e) => {
    if (e.matches) setOpen(false);
  });
}
