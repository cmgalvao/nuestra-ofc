/**
 * Movimento da Home:
 * - o balão da abertura sobe conforme a rolagem dentro do Hero (até ~40% da altura dele);
 * - a régua de altitude acompanha o trecho visível (data-current);
 * - os pontos do carrossel acompanham o cartão visível.
 * A flutuação do balão é CSS (@keyframes) e o CSS global a desliga com "reduzir movimento".
 * O transform da subida vai no contêiner [data-balao], e não na <img> que flutua,
 * para que a animação CSS não sobrescreva o transform aplicado aqui.
 */

/** Intro opcional (pendente de confirmação do Carlos): balao-traco.png se transforma em balao.png. */
export const INTRO_TRACO = false;

const RISE = 0.4;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function balloonRise() {
  const hero = document.getElementById('decolagem');
  const rise = hero?.querySelector<HTMLElement>('[data-balao]');
  if (!hero || !rise) return;

  if (INTRO_TRACO && !reduceMotion.matches) {
    rise.classList.add('intro');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      rise.classList.add('intro-go');
      rise.classList.remove('intro');
    }));
  }

  let ticking = false;
  const update = () => {
    ticking = false;
    if (reduceMotion.matches) {
      rise.style.transform = '';
      return;
    }
    const h = hero.offsetHeight;
    const progress = Math.min(Math.max(window.scrollY / h, 0), 1);
    rise.style.transform = `translate3d(0, ${(-progress * RISE * h).toFixed(1)}px, 0)`;
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  reduceMotion.addEventListener('change', onScroll);
  // Ler scrollY já na carga força um layout síncrono; no quadro seguinte ele é o mesmo layout da primeira pintura.
  requestAnimationFrame(() => { if (window.scrollY > 0) onScroll(); });
}

function altimeter() {
  const regua = document.querySelector<HTMLElement>('[data-altimeter]');
  if (!regua || !('IntersectionObserver' in window)) return;
  const stops = Array.from(regua.querySelectorAll<HTMLElement>('[data-stop]'));
  const sections = stops
    .map((s) => document.getElementById(s.dataset.stop!))
    .filter((el): el is HTMLElement => !!el);

  const setCurrent = (id: string) => {
    if (regua.dataset.current === id) return;
    regua.dataset.current = id;
    for (const s of stops) s.toggleAttribute('data-active', s.dataset.stop === id);
  };

  // Faixa estreita no meio da tela: o trecho que a cruza é o atual.
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) if (e.isIntersecting) setCurrent(e.target.id);
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  sections.forEach((s) => io.observe(s));
}

function carouselDots() {
  for (const list of document.querySelectorAll<HTMLElement>('[data-carousel]')) {
    const dots = Array.from(list.parentElement?.querySelectorAll<HTMLElement>('[data-dot]') ?? []);
    const items = Array.from(list.children) as HTMLElement[];
    if (!dots.length || !items.length) continue;
    let ticking = false;
    const update = () => {
      ticking = false;
      const max = list.scrollWidth - list.clientWidth;
      const step = items.length > 1 ? items[1].offsetLeft - items[0].offsetLeft : list.clientWidth;
      const i = list.scrollLeft >= max - 2 ? items.length - 1 : Math.round(list.scrollLeft / step);
      dots.forEach((d, n) => d.toggleAttribute('data-active', n === i));
    };
    list.addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });
    // Telas largas em que os cartões cabem todos: os pontos e a dica de arrastar saem.
    const fits = () => list.toggleAttribute('data-fits', list.scrollWidth <= list.clientWidth + 1);
    // Só mede quando o carrossel chega à tela: com content-visibility nas seções abaixo da dobra,
    // medir antes forçaria o navegador a montar tudo logo na carga (custo no primeiro layout).
    const watch = () => {
      fits();
      if ('ResizeObserver' in window) new ResizeObserver(fits).observe(list);
      else window.addEventListener('resize', fits, { passive: true });
    };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        watch();
      }, { rootMargin: '200px' });
      io.observe(list);
    } else watch();
  }
}

balloonRise();
altimeter();
carouselDots();
