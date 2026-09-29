/**
 * @file eventos.js
 * @description Distribui os eventos da simulação para som, efeitos, mensagens e progresso.
 * A simulação só emite; quem reage é decidido aqui.
 */
import { tocarEvento } from '../audio/efeitos-sonoros.js';

/**
 * @param {object} d { sim, audio, renderizador, mensagens, gestor, aoVitoria, aoDerrota, aoPulos }
 * @returns {() => void} função que esvazia a fila de eventos da simulação
 */
export function criarDistribuidor(d) {
  const vibrar = (ms) => { try { if (navigator.vibrate) navigator.vibrate(ms); } catch { /* sem vibração */ } };
  let pulos = 0;

  function tratar(e) {
    tocarEvento(d.audio, e);
    switch (e.tipo) {
      case 'aviso':
        d.mensagens.faixa(e.titulo, e.sub, e.classe, e.vida);
        d.mensagens.anunciar(e.sub ? `${e.titulo}. ${e.sub}` : e.titulo);
        break;
      case 'leitura': {
        d.gestor.registrarLeitura();
        if (e.perfeita) vibrar(20);
        break;
      }
      case 'colisao': vibrar(80); break;
      case 'pulo': if (++pulos === 3) d.aoPulos(); break;
      case 'rota-concluida': d.aoVitoria(e.resumo); break;
      case 'fim-derrota': d.aoDerrota(e.resumo); break;
      case 'rua-concluida': d.mensagens.anunciar(`Rua ${e.nome} concluída.`); break;
      default: break;
    }
  }

  return function esvaziar() {
    const fila = d.sim.eventos;
    if (fila.length === 0) return;
    d.sim.eventos = [];
    d.renderizador.processarEventos(fila);
    for (const e of fila) tratar(e);
  };
}
