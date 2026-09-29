/**
 * @file eventos.js
 * @description Fila de eventos da simulação. Renderizador, interface e áudio consomem a fila a
 * cada quadro; a simulação nunca chama essas camadas diretamente.
 */

export function emitir(sim, tipo, dados = {}) {
  sim.eventos.push({ tipo, ...dados });
}

/**
 * Mensagem grande na tela.
 * @param {string} classe normal | checkpoint | flow | vitoria | ouro | aviso
 */
export function emitirAviso(sim, titulo, sub = '', classe = 'normal', vida = 2.3) {
  emitir(sim, 'aviso', { titulo, sub, classe, vida });
}
