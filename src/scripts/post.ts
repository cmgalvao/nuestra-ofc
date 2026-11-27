// Página de post: botão "Copiar link".
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
