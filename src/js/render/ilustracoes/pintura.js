/**
 * @file pintura.js
 * @description Desenho dos personagens ilustrados. Devolvem `false` quando as imagens ainda não
 * estão prontas, para o chamador usar o desenho vetorial (reserva).
 */
import { obterQuadro } from './atlas.js';
import { escolherQuadroLeiturista, escolherQuadroCao } from './quadros.js';
import { pintarQuadro } from './quadro.js';

export { pintarQuadro };

/**
 * @param {number} k pixels por unidade para o pré-escalonamento
 * @param {object} o { x, y (pé), espelhar, pose, fase, noAr, vy, machucado, amassando, tempo }
 */
export function pintarLeituristaIlustrado(ctx, k, o) {
  const { folha, quadro } = escolherQuadroLeiturista(o);
  const q = obterQuadro(folha, quadro, k);
  if (!q) return false;
  pintarQuadro(ctx, q, o.x, o.y, o.espelhar);
  return true;
}

/** @param {object} o { x (centro do corpo), y (pé), espelhar, sentado, feliz, latindo, fase, tempo } */
export function pintarCaoIlustrado(ctx, k, o) {
  const { folha, quadro } = escolherQuadroCao(o);
  const q = obterQuadro(folha, quadro, k);
  if (!q) return false;
  pintarQuadro(ctx, q, o.x, o.y, o.espelhar);
  return true;
}
