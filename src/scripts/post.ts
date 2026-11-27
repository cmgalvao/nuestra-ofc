// Página de post: botões "Copiar link" e "Instagram".
import { desenharStory } from './story';

document.querySelectorAll<HTMLButtonElement>('[data-copiar]').forEach((botao) => {
  botao.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(botao.dataset.copiar!);
      botao.textContent = 'Link copiado';
    } catch {
      botao.textContent = 'Não deu para copiar';
    }
    setTimeout(() => { botao.textContent = 'Copiar link'; }, 2500);
  });
});

// O Instagram não aceita link vindo de site: copiamos o link e entregamos só a arte.
const story = document.querySelector<HTMLDialogElement>('[data-story]');
if (story) {
  const { link, titulo, capa, logo, papel, arquivo: nome } = story.dataset as Record<string, string>;
  const tela = story.querySelector('canvas')!;
  const enviar = story.querySelector<HTMLButtonElement>('[data-enviar]')!;
  const aviso = story.querySelector<HTMLElement>('[data-aviso]')!;
  let arte: Promise<File> | undefined;
  let arquivo: File | undefined;
  // Menu de compartilhar só em aparelho de toque; no computador a arte é baixada.
  const peloMenu = () => !!arquivo && matchMedia('(pointer: coarse)').matches && !!navigator.canShare?.({ files: [arquivo] });

  const gerar = async () => {
    await desenharStory(tela, { titulo, capa, logo, papel });
    const blob = await new Promise<Blob>((ok, erro) =>
      tela.toBlob((b) => (b ? ok(b) : erro(new Error('arte vazia'))), 'image/jpeg', 0.9));
    return new File([blob], nome, { type: 'image/jpeg' });
  };

  // A arte fica pronta antes do toque: o iPhone só abre o menu se não houver espera.
  const preparar = async () => {
    enviar.disabled = true;
    try {
      arquivo = await (arte ??= gerar());
      enviar.textContent = peloMenu() ? 'Compartilhar no Instagram' : 'Baixar a arte e copiar o link';
      enviar.disabled = false;
    } catch {
      arte = undefined;
      enviar.textContent = 'Arte indisponível';
      aviso.textContent = 'Não deu para criar a arte. Use "Copiar link".';
    }
  };

  document.querySelector('[data-abrir-story]')!.addEventListener('click', () => {
    aviso.textContent = '';
    story.showModal();
    void preparar();
  });
  story.querySelector('[data-fechar]')!.addEventListener('click', () => story.close());

  enviar.addEventListener('click', async () => {
    if (!arquivo) return;
    const copia = navigator.clipboard?.writeText(link).then(() => true, () => false) ?? Promise.resolve(false);
    if (peloMenu()) {
      try {
        await navigator.share({ files: [arquivo] });
      } catch {
        // A pessoa fechou o menu do aparelho.
      }
    } else {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(arquivo);
      a.download = nome;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }
    aviso.textContent = (await copia) ? 'Link copiado. Cole na figurinha Link.' : 'Não deu para copiar o link. Use "Copiar link".';
  });
}
