/**
 * AC-112: teclado (Espaço/↑/W pulam, P/Esc pausam, M/S alternam áudio), foco visível, toque
 * real (touchStart/touchEnd) para pular, e áudio só depois de um gesto do usuário.
 */

const ESTADO = `(() => { const l = window.__leiturista; return { tela: l.controlador.tela, noChao: l.sim.jogador.noChao,
  alt: l.sim.jogador.alt, musica: l.gestor.progresso.musica, efeitos: l.gestor.progresso.efeitos, audio: l.audio.criado, estagio: l.sim.estagio }; })()`;

export default {
  nome: 'Teclado, toque real e áudio após gesto',
  criterios: ['AC-112', 'REQ-108', 'REQ-110'],
  async executar(ctx) {
    const nav = await ctx.abrir({ largura: 900, altura: 600, dpr: 1, celular: false, url: ctx.url });
    try {
      await ctx.esperar(500);
      ctx.verificar((await nav.avaliar(ESTADO)).audio === false, 'o AudioContext não pode existir antes de um gesto');
      ctx.verificar(await nav.avaliar("document.activeElement && document.activeElement.id") === 'btnIniciar', 'foco inicial deveria estar em Iniciar');
      await nav.tecla('m');
      ctx.verificar((await nav.avaliar(ESTADO)).musica === false, 'tecla M deveria desligar a música');
      await nav.tecla('s');
      ctx.verificar((await nav.avaliar(ESTADO)).efeitos === false, 'tecla S deveria desligar os efeitos');
      await nav.tecla('m');
      await nav.tecla('s');
      await nav.tecla('Enter');
      await ctx.esperar(400);
      let e = await nav.avaliar(ESTADO);
      ctx.verificar(e.tela === 'jogo' && e.estagio === 'abertura', `Enter em Iniciar: ${JSON.stringify(e)}`);
      ctx.verificar(e.audio === true, 'o áudio deveria ser criado após o gesto de iniciar');
      await nav.tecla(' ');
      await ctx.esperar(150);
      e = await nav.avaliar(ESTADO);
      ctx.verificar(e.estagio === 'corrida', 'Espaço durante a abertura deveria pular a animação');
      await ctx.esperar(200);
      let pulou = false;
      for (const tecla of [' ', 'ArrowUp', 'w']) {
        await nav.enviar('Input.dispatchKeyEvent', { type: 'keyDown', key: tecla, code: tecla === ' ' ? 'Space' : tecla === 'w' ? 'KeyW' : tecla });
        await ctx.esperar(80);
        pulou = (await nav.avaliar(ESTADO)).alt > 0;
        await nav.enviar('Input.dispatchKeyEvent', { type: 'keyUp', key: tecla, code: tecla === ' ' ? 'Space' : tecla === 'w' ? 'KeyW' : tecla });
        ctx.verificar(pulou, `a tecla "${tecla}" deveria pular`);
        await ctx.esperar(900);
      }
      await nav.tecla('p');
      ctx.verificar((await nav.avaliar(ESTADO)).tela === 'pausa', 'tecla P deveria pausar');
      const foco = await nav.avaliar("document.activeElement && document.activeElement.id");
      ctx.verificar(foco === 'btnRetomar', `foco na pausa: ${foco}`);
      const contorno = await nav.avaliar("getComputedStyle(document.activeElement).outlineStyle");
      ctx.verificar(contorno !== 'none', 'o foco precisa estar visível (contorno)');
      await nav.tecla('Enter');
      await ctx.esperar(200);
      ctx.verificar((await nav.avaliar(ESTADO)).tela === 'jogo', 'Enter em Continuar deveria retomar');
      await nav.tecla('Escape');
      ctx.verificar((await nav.avaliar(ESTADO)).tela === 'pausa', 'Esc deveria pausar');
    } finally { nav.fechar(); }

    const toque = await ctx.abrir({ largura: 390, altura: 844, dpr: 2, celular: true, url: ctx.url });
    try {
      await ctx.esperar(500);
      await toque.avaliar("document.getElementById('btnIniciar').click()");
      await ctx.esperar(300);
      await toque.tocar(195, 400);
      await ctx.esperar(500);
      ctx.verificar((await toque.avaliar(ESTADO)).estagio === 'corrida', 'toque durante a abertura deveria pular a animação');
      await toque.enviar('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 195, y: 400, id: 1 }] });
      await ctx.esperar(60);
      const noAr = (await toque.avaliar(ESTADO)).alt;
      await toque.enviar('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      ctx.verificar(noAr > 0, 'toque real deveria fazer o leiturista pular');
      await toque.avaliar("window.__max = 0; (function f() { window.__max = Math.max(window.__max, window.__leiturista.sim.jogador.alt); requestAnimationFrame(f); })()");
      const alturas = {};
      for (const [nome, ms] of [['curto', 40], ['longo', 700]]) {
        await ctx.esperar(1200);
        await toque.avaliar('window.__max = 0');
        await toque.enviar('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 195, y: 400, id: 1 }] });
        await ctx.esperar(ms);
        await toque.enviar('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await ctx.esperar(900);
        alturas[nome] = await toque.avaliar('window.__max');
      }
      ctx.registrar('alturas', alturas);
      ctx.verificar(alturas.longo > alturas.curto + 20, `pulo alto (${alturas.longo}) deveria passar do baixo (${alturas.curto})`);
      ctx.verificar(toque.erros.length === 0, `erros: ${toque.erros.join(' | ')}`);
    } finally { toque.fechar(); }
  }
};
