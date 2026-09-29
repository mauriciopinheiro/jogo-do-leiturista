/**
 * AC-104 (giro de tela no meio da partida não encerra nem mata o jogador) e EC-001 (aba oculta
 * pausa e a volta não dá salto). Também redimensionamento contínuo.
 */
import { join } from 'node:path';

export default {
  nome: 'Giro de tela e aba oculta durante a partida',
  criterios: ['AC-104', 'EC-001', 'REQ-103'],
  async executar(ctx) {
    const nav = await ctx.abrir({ largura: 390, altura: 844, dpr: 2, celular: true, url: ctx.url });
    try {
      await ctx.instalarPiloto(nav);
      await nav.avaliar("document.getElementById('btnIniciar').click()");
      await nav.avaliar("window.__robo.jogar({ perfil: 'perfeito', semente: 33, ate: (s) => s.fila.lidos >= 4 })");
      const antes = await nav.avaliar('(() => { const s = window.__leiturista.sim; return { ameaca: s.ameaca, lidos: s.fila.lidos, x: s.jogador.x, L: s.mundo.L }; })()');

      await nav.redimensionar(844, 390);
      await ctx.esperar(500);
      const paisagem = await nav.avaliar('(() => { const s = window.__leiturista.sim; return { estagio: s.estagio, ameaca: s.ameaca, x: s.jogador.x, L: s.mundo.L, cao: s.cao.x, visivel: s.jogador.visivel, canvas: document.getElementById("palco").width }; })()');
      ctx.verificar(paisagem.estagio === 'corrida', `após girar: estágio ${paisagem.estagio}`);
      ctx.verificar(paisagem.L !== antes.L, 'o mundo deveria ter mudado de largura ao girar');
      ctx.verificar(paisagem.ameaca <= antes.ameaca + 1, `ameaça saltou de ${antes.ameaca} para ${paisagem.ameaca} ao girar (v3 matava o jogador)`);
      ctx.verificar(paisagem.cao < paisagem.x - 40, 'o cão não pode estar colado no jogador logo após girar');
      await nav.foto(join(ctx.saida, 'giro-paisagem.png'));

      await nav.avaliar("window.__robo.jogar({ perfil: 'perfeito', semente: 33, ate: (s) => s.fila.lidos >= 8 })");
      await nav.redimensionar(390, 844);
      for (const [l, a] of [[500, 700], [844, 390], [1024, 768], [390, 844]]) { await nav.redimensionar(l, a); await ctx.esperar(120); }
      const fim = await nav.avaliar('(() => { const s = window.__leiturista.sim; return { estagio: s.estagio, ameaca: s.ameaca }; })()');
      ctx.verificar(fim.estagio === 'corrida', `após vários redimensionamentos: ${fim.estagio}`);
      const concluiu = await nav.avaliar("window.__robo.jogar({ perfil: 'perfeito', semente: 33 })");
      ctx.verificar(concluiu.estagio === 'concluida', `terminar a rota depois de girar: ${concluiu.estagio}`);

      await nav.avaliar("document.getElementById('btnResMenu').click()");
      await nav.avaliar("document.getElementById('btnIniciar').click()");
      await ctx.esperar(200);
      await nav.avaliar('window.__leiturista.controlador.pressionar()');
      await ctx.esperar(300);
      await nav.avaliar("Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange'));");
      const oculta = await nav.avaliar('({ tela: window.__leiturista.controlador.tela, pausado: window.__leiturista.sim.pausado })');
      ctx.verificar(oculta.tela === 'pausa' && oculta.pausado, `aba oculta deveria pausar: ${JSON.stringify(oculta)}`);
      const t0 = await nav.avaliar('window.__leiturista.sim.tempoCorrida');
      await ctx.esperar(1200);
      await nav.avaliar("Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange'));");
      await ctx.esperar(300);
      const t1 = await nav.avaliar('window.__leiturista.sim.tempoCorrida');
      ctx.verificar(t1 - t0 < 0.05, `o tempo de jogo andou ${t1 - t0}s com a aba oculta`);
      ctx.verificar(await nav.avaliar('window.__leiturista.controlador.tela') === 'pausa', 'ao voltar deve continuar pausado (sem retomar sozinho)');
      ctx.verificar(nav.erros.length === 0, `erros: ${nav.erros.join(' | ')}`);
    } finally { nav.fechar(); }
  }
};
