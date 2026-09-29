/**
 * AC-105/AC-109: campanha completa (5 rotas + cena final + conquistas) pelos controles reais do
 * jogo, com o console limpo e sem nenhum alert. Também derrota sem entrada e retomada do menu.
 */
import { join } from 'node:path';

const clicar = (nav, id) => nav.avaliar(`document.getElementById('${id}').click()`);
const visivel = (nav, id) => nav.avaliar(`!document.getElementById('${id}').closest('[hidden]')`);

export default {
  nome: 'Campanha completa, derrota e console limpo',
  criterios: ['AC-105', 'AC-109', 'REQ-105'],
  async executar(ctx) {
    const nav = await ctx.abrir({ largura: 844, altura: 390, dpr: 2, celular: true, url: ctx.url });
    try {
      await ctx.instalarPiloto(nav);
      await clicar(nav, 'btnIniciar');
      for (let fase = 1; fase <= 5; fase++) {
        const r = await nav.avaliar(`window.__robo.jogar({ perfil: 'perfeito', semente: ${fase * 17} })`);
        ctx.verificar(r.estagio === 'concluida', `fase ${fase}: terminou em "${r.estagio}"`);
        await ctx.esperar(800);
        if (fase < 5) {
          ctx.verificar(await visivel(nav, 'telaResultado'), `fase ${fase}: tela de resultado não apareceu`);
          const titulo = await nav.avaliar("document.getElementById('resTitulo').textContent");
          ctx.verificar(titulo.includes(`${fase}`), `fase ${fase}: título "${titulo}"`);
          ctx.verificar(await nav.avaliar("document.querySelectorAll('#resMedalhas .medalha').length") === 3, `fase ${fase}: faltam medalhas`);
          const liberada = await nav.avaliar('window.__leiturista.gestor.progresso.faseMaxLiberada');
          ctx.verificar(liberada === fase + 1, `fase ${fase}: fase liberada ${liberada}`);
          await clicar(nav, 'btnResPrimario');
          await ctx.esperar(300);
        }
      }
      ctx.verificar(await nav.avaliar('window.__leiturista.controlador.tela') === 'final', 'depois da fase 5 deveria abrir a cena final');
      await nav.avaliar('window.__robo.avancar(3)');
      await nav.foto(join(ctx.saida, 'campanha-final-retrospectiva.png'));
      for (let i = 0; i < 5; i++) { await nav.avaliar('window.__robo.avancar(0.7)'); await nav.avaliar('window.__leiturista.controlador.pressionar()'); }
      await ctx.esperar(500);
      ctx.verificar(await nav.avaliar('window.__leiturista.controlador.tela') === 'resultado', 'após a cena final deveria mostrar as conquistas');
      const premios = await nav.avaliar("document.querySelectorAll('#resPremios li').length");
      ctx.verificar(premios === 3, `conquistas exibidas: ${premios}`);
      await nav.foto(join(ctx.saida, 'campanha-conquistas.png'));
      const p = await nav.avaliar('window.__leiturista.gestor.progresso');
      ctx.verificar(p.campanhaConcluida && p.finalVisto, 'campanha deveria constar como concluída');
      ctx.verificar(p.resultadosFases.every(Boolean), 'todas as fases deveriam ter resultado');
      ctx.verificar(p.ultimasEstatisticas.totalMeters === 240, `total da campanha ${p.ultimasEstatisticas.totalMeters} (v3 mostrava 535)`);
      await clicar(nav, 'btnResMenu');
      await ctx.esperar(300);
      ctx.verificar(await visivel(nav, 'btnInfinito') && await visivel(nav, 'btnRever'), 'modo infinito e rever encerramento deveriam estar liberados');

      await clicar(nav, 'btnIniciar');
      await ctx.esperar(200);
      const derrota = await nav.avaliar("window.__robo.jogar({ perfil: 'parado', semente: 3 })");
      ctx.verificar(derrota.estagio === 'fim', `sem entrada deveria perder, terminou em ${derrota.estagio}`);
      await ctx.esperar(800);
      const titulo = await nav.avaliar("document.getElementById('resTitulo').textContent");
      ctx.verificar(/cão alcançou/i.test(titulo), `título da derrota: "${titulo}"`);
      await nav.foto(join(ctx.saida, 'campanha-derrota.png'));
      ctx.verificar(nav.erros.length === 0, `erros de console: ${nav.erros.join(' | ')}`);
      ctx.verificar(nav.dialogos.length === 0, `alert/confirm chamados: ${nav.dialogos.join(' | ')}`);
    } finally { nav.fechar(); }
  }
};
