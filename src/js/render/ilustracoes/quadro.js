/**
 * @file quadro.js
 * @description Cópia de um quadro do atlas para o canvas. Separado de pintura.js (que depende dos
 * arquivos de imagem embutidos) para poder ser testado sem navegador.
 */

/**
 * Copia o quadro com o pé (pivô) em (x, y) do mundo; `espelhar` vira o personagem para a esquerda
 * (o pivô fica no lugar, então o personagem gira em torno do próprio corpo).
 * @param {{tela, sx, sy, cw, ch, u, px, py}} q
 */
export function pintarQuadro(ctx, q, x, y, espelhar = false) {
  ctx.save();
  ctx.translate(x, y);
  if (espelhar) ctx.scale(-1, 1);
  ctx.drawImage(q.tela, q.sx, q.sy, q.cw, q.ch, -q.px * q.u, -q.py * q.u, q.cw * q.u, q.ch * q.u);
  ctx.restore();
}
