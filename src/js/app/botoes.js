/**
 * @file botoes.js
 * @description Liga os botões das telas às ações do controlador (menu, pausa, resultado,
 * ajuda e backup do progresso por arquivo).
 */

function baixarArquivo(janela, texto, nome) {
  const doc = janela.document;
  const url = janela.URL.createObjectURL(new janela.Blob([texto], { type: 'application/json' }));
  const link = doc.createElement('a');
  link.href = url;
  link.download = nome;
  doc.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => janela.URL.revokeObjectURL(url), 1000);
}

export function ligarBotoes({ el, controlador, gestor, mensagens, menu, telas, janela, limiteBytes }) {
  const ao = (botao, acao) => botao.addEventListener('click', acao);

  ao(el.btnIniciar, () => controlador.iniciar(menu.selecionada));
  ao(el.btnContinuar, () => controlador.continuar());
  ao(el.btnInfinito, () => controlador.iniciar(4, true));
  ao(el.btnMusica, () => controlador.alternar('musica'));
  ao(el.btnEfeitos, () => controlador.alternar('efeitos'));
  ao(el.btnRever, () => controlador.iniciarFinal(true));
  ao(el.btnAjuda, () => telas.mostrar('ajuda'));
  ao(el.btnPausaAjuda, () => telas.mostrar('ajuda'));
  ao(el.btnAjudaFechar, () => telas.voltar());

  ao(el.btnPausa, () => { el.btnPausa.blur(); controlador.pausar(); });
  ao(el.btnRetomar, () => controlador.retomar());
  ao(el.btnReiniciar, () => controlador.reiniciar());
  ao(el.btnPausaMenu, () => controlador.sairParaMenu());

  ao(el.btnResPrimario, () => controlador.executarPrimario());
  ao(el.btnResSecundario, () => controlador.executarSecundario());
  ao(el.btnResMenu, () => controlador.sairParaMenu());

  ao(el.btnExportar, () => {
    baixarArquivo(janela, gestor.exportarTexto(), 'leiturista-semae-progresso.json');
    mensagens.aviso('Progresso baixado. Guarde o arquivo com cuidado.', 'ok');
  });
  ao(el.btnImportar, () => el.inputImportar.click());
  el.inputImportar.addEventListener('change', async () => {
    const arquivo = el.inputImportar.files && el.inputImportar.files[0];
    el.inputImportar.value = '';
    if (!arquivo) return;
    if (arquivo.size > limiteBytes) { mensagens.aviso('O arquivo é maior que o limite de 256 KB.', 'erro'); return; }
    try {
      const resultado = gestor.importarTexto(await arquivo.text());
      if (!resultado.ok) { mensagens.aviso(resultado.mensagem, 'erro', 3500); return; }
      controlador.atualizarMenu();
      mensagens.aviso('Progresso carregado com sucesso.', 'ok');
    } catch {
      mensagens.aviso('Não foi possível ler o arquivo escolhido.', 'erro');
    }
  });
}
