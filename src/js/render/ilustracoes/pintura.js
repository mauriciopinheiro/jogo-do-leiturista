/**
 * @file pintura.js
 * @description Desenho dos personagens ilustrados. Devolvem `false` quando as imagens ainda não
 * estão prontas, para o chamador usar o desenho vetorial (reserva).
 */
import { obterQuadro } from './atlas.js';
import { escolherQuadroLeiturista, escolherQuadroCao, escolherQuadroKombi, quadroPorTempo, SEQUENCIAS } from './quadros.js';
import { pintarQuadro } from './quadro.js';

export { pintarQuadro };

/**
 * @param {number} k pixels por unidade para o pré-escalonamento
 * @param {object} o { x, y (pé), espelhar, pose, fase, noAr, vy, alt, machucado, amassando, tempo }
 */
export function pintarLeituristaIlustrado(ctx, k, o) {
  const { folha, quadro } = escolherQuadroLeiturista(o);
  const q = obterQuadro(folha, quadro, k);
  if (!q) return false;
  pintarQuadro(ctx, q, o.x, o.y, o.espelhar);
  return true;
}

/** @param {object} o { x (centro do corpo), y (pé), espelhar, sentado, feliz, latindo, investindo, osso, fator, fase, tempo } */
export function pintarCaoIlustrado(ctx, k, o) {
  const { folha, quadro } = escolherQuadroCao(o);
  const q = obterQuadro(folha, quadro, k, o.fator || 1);
  if (!q) return false;
  pintarQuadro(ctx, q, o.x, o.y, o.espelhar);
  return true;
}

/** A Kombi sozinha, com o pivô na ponta da frente (x) e nas rodas (y). */
export function pintarKombiIlustrada(ctx, k, { x, y, aberta, andando, tempo }) {
  const { folha, quadro } = escolherQuadroKombi({ aberta, andando, tempo });
  const q = obterQuadro(folha, quadro, k);
  if (!q) return false;
  pintarQuadro(ctx, q, x, y);
  return true;
}

/**
 * Sequência com mais de um personagem (`descer`, `entrar`, `derrota`): o quadro sai do tempo `t` (s) dentro
 * de uma duração `duracao` (s). O pivô é o da folha (frente da Kombi, ou a ponta traseira do cão na derrota).
 */
export function pintarSequencia(ctx, k, nome, { t, duracao, x, y }) {
  const seq = SEQUENCIAS[nome];
  const q = obterQuadro(seq.folha, quadroPorTempo(t, duracao, seq.quadros), k);
  if (!q) return false;
  pintarQuadro(ctx, q, x, y);
  return true;
}
