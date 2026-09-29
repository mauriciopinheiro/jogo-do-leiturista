/**
 * AC-106 no navegador: sair para o menu no meio da rota, recarregar a página e continuar a
 * partida do ponto exato; a rota retomada precisa terminar (na v3 a fila ficava dessincronizada).
 */

export default {
  nome: 'Continuar partida depois de sair e recarregar a página',
  criterios: ['AC-106', 'REQ-106'],
  async executar(ctx) {
    const nav = await ctx.abrir({ largura: 844, altura: 390, dpr: 2, celular: true, url: ctx.url });
    try {
      await ctx.instalarPiloto(nav);
      await nav.avaliar("document.getElementById('btnIniciar').click()");
      await nav.avaliar("window.__robo.jogar({ perfil: 'perfeito', semente: 91, ate: (s) => s.fila.lidos >= 6 && s.jogador.noChao })");
      // Pausa primeiro: o relógio real continua correndo entre a rodada acelerada e o clique.
      await nav.avaliar("document.getElementById('btnPausa').click()");
      const antes = await nav.avaliar('(() => { const s = window.__leiturista.sim; return { lidos: s.fila.lidos, perdidos: s.fila.perdidos, pontos: Math.floor(s.pontos), fase: s.faseIdx }; })()');
      ctx.verificar(antes.lidos >= 6, `deveria ter lido 6+ hidrômetros, leu ${antes.lidos}`);
      await nav.avaliar("document.getElementById('btnPausaMenu').click()");
      await ctx.esperar(300);
      ctx.verificar(await nav.avaliar("!document.getElementById('btnContinuar').closest('[hidden]')"), 'o botão Continuar deveria aparecer no menu');

      await nav.navegar(ctx.url);
      await ctx.esperar(600);
      ctx.verificar(await nav.avaliar("!document.getElementById('btnContinuar').closest('[hidden]')"), 'depois de recarregar, Continuar deveria continuar disponível');
      await ctx.instalarPiloto(nav);
      // clica e lê no mesmo instante, antes de qualquer quadro: o relógio real não pode mexer nos números
      const depois = await nav.avaliar("document.getElementById('btnContinuar').click(); (() => { const s = window.__leiturista.sim; return { lidos: s.fila.lidos, perdidos: s.fila.perdidos, pontos: Math.floor(s.pontos), fase: s.faseIdx, estagio: s.estagio, tela: window.__leiturista.controlador.tela }; })()");
      ctx.verificar(depois.tela === 'jogo' && depois.estagio === 'corrida', `estado após continuar: ${JSON.stringify(depois)}`);
      ctx.verificar(depois.lidos === antes.lidos && depois.perdidos === antes.perdidos, `contagem ${depois.lidos}/${depois.perdidos} != ${antes.lidos}/${antes.perdidos}`);
      ctx.verificar(depois.fase === antes.fase && depois.pontos === antes.pontos, `fase/pontos divergiram: ${JSON.stringify({ antes, depois })}`);

      const fim = await nav.avaliar("window.__robo.jogar({ perfil: 'perfeito', semente: 91 })");
      ctx.verificar(fim.estagio === 'concluida', `a rota retomada deveria terminar, terminou em ${fim.estagio} (${fim.segundos}s)`);
      const contas = await nav.avaliar('(() => { const f = window.__leiturista.sim.fila; return f.lidos + f.perdidos; })()');
      ctx.verificar(contas === 15, `hidrômetros processados: ${contas} de 15`);
      await ctx.esperar(800);
      await nav.avaliar("document.getElementById('btnResMenu').click()");
      ctx.verificar(await nav.avaliar("document.getElementById('btnContinuar').closest('[hidden]') !== null"), 'depois de concluir, não deve sobrar partida para continuar');
      ctx.verificar(nav.erros.length === 0 && nav.dialogos.length === 0, `erros/dialogos: ${nav.erros.join(' | ')}`);
    } finally { nav.fechar(); }
  }
};
