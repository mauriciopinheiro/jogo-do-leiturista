/**
 * AC-101 com dados reais: a própria v3.4.0 publicada joga uma partida e grava seu save; a v4,
 * aberta na mesma origem, deve aceitar esse save (assinatura da v3 incluída) e mostrar o mesmo
 * progresso. É a prova de que as crianças não perdem o que já conquistaram.
 */

export default {
  nome: 'Compatibilidade com o save gravado pela v3.4.0',
  criterios: ['AC-101', 'REQ-101'],
  async executar(ctx) {
    const urlAntiga = `${ctx.servidor.url}/versoes-preservadas/v3.4.0-no-ar/index.html`;
    const nav = await ctx.abrir({ largura: 844, altura: 390, dpr: 1, celular: true, url: urlAntiga });
    try {
      await ctx.esperar(600);
      await nav.avaliar("document.getElementById('startBtn').click()");
      await ctx.esperar(400);
      await nav.tocar(420, 200);
      // Sem mais toques: a v3 termina a partida sozinha (derrota ou rota concluída) e o painel volta.
      let fim = false;
      for (let i = 0; i < 180 && !fim; i++) {
        await ctx.esperar(500);
        fim = await nav.avaliar("!document.getElementById('overlay').hidden");
      }
      ctx.verificar(fim, 'a v3.4.0 não chegou ao fim de partida a tempo de gravar o save');
      await nav.avaliar("window.dispatchEvent(new Event('pagehide'))");
      const bruto = await nav.avaliar("localStorage.getItem('semae.jogo-do-leiturista-3.v2')");
      ctx.verificar(Boolean(bruto), 'a v3.4.0 deveria ter gravado o save v2');
      if (!bruto) return;
      const salvo = JSON.parse(bruto);
      ctx.verificar(String(salvo.assinatura).startsWith('sha256-'), `assinatura da v3: ${salvo.assinatura}`);
      ctx.registrar('saveDaV3', { versaoJogo: salvo.versaoJogo, best: salvo.estado.best, leituras: salvo.estado.lifetimeReadings, bytes: bruto.length });

      await nav.navegar(ctx.url);
      await ctx.esperar(800);
      const v4 = await nav.avaliar(`(() => { const g = window.__leiturista.gestor; return { origem: g.origem, recusado: g.recusado,
        melhor: g.progresso.melhor, leituras: g.progresso.leiturasVitalicias, liberada: g.progresso.faseMaxLiberada }; })()`);
      ctx.verificar(v4.origem === 'v2' && v4.recusado === null, `a v4 recusou o save da v3: ${JSON.stringify(v4)}`);
      ctx.verificar(v4.melhor === salvo.estado.best, `melhor pontuação ${v4.melhor} != ${salvo.estado.best}`);
      ctx.verificar(v4.leituras === salvo.estado.lifetimeReadings, `leituras ${v4.leituras} != ${salvo.estado.lifetimeReadings}`);
      ctx.verificar(nav.erros.length === 0, `erros: ${nav.erros.join(' | ')}`);
      ctx.verificar(nav.dialogos.length === 0, 'alert ao carregar o save antigo');
    } finally { nav.fechar(); }
  }
};
