/**
 * @file fluxo-resultado.js
 * @description O que acontece quando uma rota termina: registrar no progresso, avisar o Hub,
 * mostrar o resultado, chamar a cena final na primeira conclusão da campanha e executar os
 * botões do painel de resultado.
 */
import { mostrarResultado, mostrarConquistas } from '../interface/resultado.js';
import { notificarPortal } from '../integracao/portal.js';

/** `estado` é o objeto compartilhado com o controlador ({ tela }). */
export function criarFluxoDeResultado(d) {
  const { el, gestor, audio, hud, menu, telas, mensagens, cena, janela, laco, estado } = d;
  let acoes = { primario: null, secundario: null, faseIdx: 0 };
  let finalVeioDoMenu = false;

  function mostrarFimDeRota(resumo, extras) {
    hud.esconder();
    mensagens.limparFaixa();
    el.dica.hidden = true;
    estado.tela = 'resultado';
    acoes = { ...mostrarResultado(el, resumo, extras), faseIdx: resumo.faseIdx };
    telas.mostrar('resultado');
    // Evita que um toque apressado logo após o fim da partida acione um botão sem querer.
    for (const b of [el.btnResPrimario, el.btnResSecundario, el.btnResMenu]) {
      b.disabled = true;
      setTimeout(() => { b.disabled = false; }, 600);
    }
  }

  function iniciarFinal(doMenu) {
    audio.garantir();
    finalVeioDoMenu = doMenu;
    estado.tela = 'final';
    telas.mostrar(null);
    hud.esconder();
    mensagens.limparFaixa();
    el.dica.hidden = true;
    cena.iniciar(gestor.progresso.ultimasEstatisticas);
    laco.zerarRelogio();
    laco.acordar();
  }

  function executar(qual) {
    if (qual === 'proxima') d.iniciar(Math.min(4, acoes.faseIdx + 1));
    else if (qual === 'repetir') d.iniciar(acoes.faseIdx);
    else if (qual === 'infinito') d.iniciar(4, true);
  }

  return {
    iniciarFinal,
    aoVitoria(resumo) {
      const r = gestor.registrarFimDeRota(resumo);
      notificarPortal(janela, resumo);
      if (!resumo.infinito && resumo.faseIdx < 4) menu.selecionar(resumo.faseIdx + 1);
      d.atualizarMenu();
      if (r.primeiroFinal) { iniciarFinal(false); return; }
      mostrarFimDeRota(resumo, { novoRecorde: r.novoRecorde, proximaFase: resumo.faseIdx < 4 ? resumo.faseIdx + 2 : null });
    },
    aoDerrota(resumo) {
      const r = gestor.registrarFimDeRota(resumo);
      d.atualizarMenu();
      mostrarFimDeRota(resumo, { novoRecorde: r.novoRecorde, proximaFase: null });
    },
    aoTerminarFinal(stats) {
      el.dica.hidden = true;
      if (finalVeioDoMenu) { d.sairParaMenu(); return; }
      estado.tela = 'resultado';
      mostrarConquistas(el, stats.meters);
      acoes = { primario: 'repetir', secundario: 'infinito', faseIdx: 4 };
      telas.mostrar('resultado');
    },
    executarPrimario: () => executar(acoes.primario),
    executarSecundario: () => executar(acoes.secundario)
  };
}
