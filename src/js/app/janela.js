/**
 * @file janela.js
 * @description Ajuste do canvas ao tamanho da janela (inclusive giro de aparelho e barras do
 * navegador móvel) e reação à aba oculta. Leituras de tamanho só acontecem aqui, fora do laço.
 */
import { redimensionarMundo } from '../simulacao/criar.js';

/**
 * @param {{janela:Window, sim:object, renderizador:object, aoOcultar:()=>void, aoMostrar:()=>void,
 *   redesenhar:()=>void}} d
 */
export function ligarJanela({ janela, sim, renderizador, aoOcultar, aoMostrar, redesenhar }) {
  let agendado = false;

  function ajustar() {
    agendado = false;
    const vv = janela.visualViewport;
    const largura = Math.round(vv ? vv.width : janela.innerWidth);
    const altura = Math.round(vv ? vv.height : janela.innerHeight);
    if (largura < 2 || altura < 2) return;
    const layout = renderizador.redimensionar(largura, altura, janela.devicePixelRatio || 1);
    redimensionarMundo(sim, layout);
    redesenhar();
  }

  function pedir() {
    if (agendado) return;
    agendado = true;
    janela.requestAnimationFrame(ajustar);
  }

  janela.addEventListener('resize', pedir, { passive: true });
  janela.addEventListener('orientationchange', pedir, { passive: true });
  if (janela.visualViewport) janela.visualViewport.addEventListener('resize', pedir, { passive: true });
  janela.document.addEventListener('visibilitychange', () => (janela.document.hidden ? aoOcultar() : aoMostrar()));
  janela.addEventListener('pagehide', aoOcultar);
  ajustar();
  return { ajustar };
}
