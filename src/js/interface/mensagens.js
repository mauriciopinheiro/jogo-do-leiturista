/**
 * @file mensagens.js
 * @description Faixa grande de aviso no jogo, avisos curtos não bloqueantes (máx. 3,5 s) e
 * anúncios para leitores de tela. Substitui os `alert()` da v3.
 */

const PRIORIDADE = { vitoria: 6, flow: 5, checkpoint: 4, ouro: 3, aviso: 1, normal: 0 };
const DURACAO_MAXIMA_AVISO = 3500;

/** @param {Record<string, HTMLElement>} el @param {()=>number} agora relógio em ms */
export function criarMensagens(el, agora = () => performance.now()) {
  let faixaAte = 0;
  let faixaPrioridade = -1;
  let tempoFaixa = 0;

  function esconderFaixa() {
    el.faixa.classList.remove('visivel');
    faixaPrioridade = -1;
  }

  return {
    /** Faixa central do jogo. Um aviso de prioridade menor não atropela um maior ainda visível. */
    faixa(titulo, sub = '', classe = 'normal', vida = 2.3) {
      const prioridade = PRIORIDADE[classe] ?? 0;
      const agoraMs = agora();
      if (agoraMs < faixaAte && prioridade < faixaPrioridade) return;
      el.faixaTitulo.textContent = titulo;
      el.faixaSub.textContent = sub;
      el.faixa.className = `faixa visivel ${classe}`;
      faixaPrioridade = prioridade;
      faixaAte = agoraMs + vida * 1000;
      clearTimeout(tempoFaixa);
      tempoFaixa = setTimeout(esconderFaixa, vida * 1000);
    },
    limparFaixa() {
      clearTimeout(tempoFaixa);
      faixaAte = 0;
      esconderFaixa();
    },
    /** Aviso curto embaixo da tela; some sozinho. @param {'ok'|'erro'|''} tipo */
    aviso(texto, tipo = '', ms = 3000) {
      const item = el.avisos.ownerDocument.createElement('div');
      item.className = `aviso ${tipo}`;
      item.textContent = texto;
      el.avisos.appendChild(item);
      while (el.avisos.children.length > 3) el.avisos.firstChild.remove();
      setTimeout(() => item.remove(), Math.min(ms, DURACAO_MAXIMA_AVISO));
    },
    anunciar(texto) {
      el.anuncio.textContent = '';
      setTimeout(() => { el.anuncio.textContent = texto; }, 30);
    }
  };
}
