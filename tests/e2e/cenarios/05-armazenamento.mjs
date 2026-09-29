/**
 * AC-108/AC-101/AC-107 na prática: armazenamento cheio, bloqueado, save corrompido, importação
 * de arquivo inválido e válido. Nunca pode haver alert; o jogo continua funcionando.
 */

const TOAST = "[...document.querySelectorAll('#avisos .aviso')].map((n) => n.textContent)";
const importar = (nav, conteudo) => nav.avaliar(`(async () => {
  const dt = new DataTransfer();
  dt.items.add(new File([${JSON.stringify(conteudo)}], 'progresso.json', { type: 'application/json' }));
  const input = document.getElementById('inputImportar');
  input.files = dt.files;
  input.dispatchEvent(new Event('change'));
  await new Promise((r) => setTimeout(r, 200));
})()`);

export default {
  nome: 'Armazenamento cheio/bloqueado, save corrompido e importação',
  criterios: ['AC-108', 'AC-101', 'REQ-107'],
  async executar(ctx) {
    const cheio = await ctx.abrir({
      largura: 390, altura: 844, dpr: 2, celular: true, url: ctx.url,
      scriptInicial: "Storage.prototype.setItem = function () { throw new DOMException('cheio', 'QuotaExceededError'); };"
    });
    try {
      await ctx.esperar(500);
      await cheio.avaliar("document.getElementById('btnMusica').click()");
      await ctx.esperar(700);
      const avisos = await cheio.avaliar(TOAST);
      ctx.verificar(avisos.some((t) => /não foi possível salvar/i.test(t)), `aviso de armazenamento cheio ausente: ${JSON.stringify(avisos)}`);
      ctx.verificar(cheio.dialogos.length === 0, 'alert foi chamado com o armazenamento cheio');
      await cheio.avaliar("document.getElementById('btnIniciar').click()");
      await ctx.esperar(600);
      ctx.verificar(await cheio.avaliar('window.__leiturista.controlador.tela') === 'jogo', 'o jogo deveria funcionar sem armazenamento');
      ctx.verificar(cheio.erros.length === 0, `erros: ${cheio.erros.join(' | ')}`);
    } finally { cheio.fechar(); }

    const corrompido = await ctx.abrir({
      largura: 390, altura: 844, dpr: 2, celular: true, url: ctx.url,
      scriptInicial: "try { localStorage.setItem('semae.jogo-do-leiturista-3.v2', '{\"app\":\"jogo-do-leiturista-3\",\"quebrado\":'); } catch (e) {}"
    });
    try {
      await ctx.esperar(700);
      const avisos = await corrompido.avaliar(TOAST);
      ctx.verificar(avisos.some((t) => /inválido/i.test(t)), `aviso de save inválido ausente: ${JSON.stringify(avisos)}`);
      const guardado = await corrompido.avaliar("localStorage.getItem('semae.jogo-do-leiturista-3.v2.invalido')");
      ctx.verificar(Boolean(guardado), 'a cópia do save corrompido deveria ficar guardada');
      ctx.verificar(await corrompido.avaliar('window.__leiturista.gestor.progresso.leiturasVitalicias') === 0, 'progresso deveria começar zerado');
      ctx.verificar(corrompido.dialogos.length === 0 && corrompido.erros.length === 0, 'sem alert nem erro de console');

      await importar(corrompido, '{"lixo":true}');
      ctx.verificar((await corrompido.avaliar(TOAST)).some((t) => /incompatível|inválido|alterado/i.test(t)), 'importação de lixo deveria avisar erro');
      await importar(corrompido, 'x'.repeat(300 * 1024));
      ctx.verificar((await corrompido.avaliar(TOAST)).some((t) => /256 KB/i.test(t)), 'arquivo grande deveria ser recusado');

      const bom = await corrompido.avaliar("window.__leiturista.gestor.exportarTexto()");
      const adulterado = JSON.parse(bom);
      adulterado.estado.lifetimeReadings = 99999;
      await importar(corrompido, JSON.stringify(adulterado));
      ctx.verificar(await corrompido.avaliar('window.__leiturista.gestor.progresso.leiturasVitalicias') === 0, 'save adulterado não pode ser aplicado');

      await corrompido.avaliar("window.__leiturista.gestor.progresso.leiturasVitalicias = 33");
      const exportado = await corrompido.avaliar("window.__leiturista.gestor.exportarTexto()");
      await corrompido.avaliar("window.__leiturista.gestor.progresso.leiturasVitalicias = 0");
      await importar(corrompido, exportado);
      ctx.verificar(await corrompido.avaliar('window.__leiturista.gestor.progresso.leiturasVitalicias') === 33, 'save exportado deveria voltar íntegro');
      ctx.verificar(corrompido.dialogos.length === 0, 'alert na importação');
    } finally { corrompido.fechar(); }
  }
};
