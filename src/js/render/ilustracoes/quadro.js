/**
 * @file quadro.js
 * @description Cópia de um quadro do atlas para o canvas. Separado de pintura.js (que depende dos
 * arquivos de imagem embutidos) para poder ser testado sem navegador.
 */

/** O quadro está sendo desenhado exatamente no tamanho do bitmap (1 pixel do atlas = 1 pixel do dispositivo)? */
function umParaUm(q, t) {
  return t.b === 0 && t.c === 0 && Math.abs(q.u * t.a - 1) < 0.002 && Math.abs(q.u * t.d - 1) < 0.002;
}

/**
 * Copia o quadro com o pé (pivô) em (x, y) do mundo; `espelhar` vira o personagem para a esquerda
 * (o pivô fica no lugar, então o personagem gira em torno do próprio corpo).
 * No tamanho normal a cópia é 1:1 e cai em pixels inteiros do dispositivo: sem reamostragem, a borda
 * do personagem não borra nem "treme" ao se mover. Com zoom de câmera (cena final) usa o desenho escalado.
 * @param {{tela, sx, sy, cw, ch, u, px, py}} q
 */
export function pintarQuadro(ctx, q, x, y, espelhar = false) {
  const t = ctx.getTransform();
  if (umParaUm(q, t)) {
    const pivoX = t.a * x + t.e;
    const esquerda = Math.round(espelhar ? pivoX - (q.cw - q.px) : pivoX - q.px);
    const topo = Math.round(t.d * y + t.f - q.py);
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (espelhar) {
      ctx.translate(esquerda + q.cw, topo);
      ctx.scale(-1, 1);
      ctx.drawImage(q.tela, q.sx, q.sy, q.cw, q.ch, 0, 0, q.cw, q.ch);
    } else {
      ctx.drawImage(q.tela, q.sx, q.sy, q.cw, q.ch, esquerda, topo, q.cw, q.ch);
    }
    ctx.restore();
    return;
  }
  ctx.save();
  ctx.translate(x, y);
  if (espelhar) ctx.scale(-1, 1);
  ctx.drawImage(q.tela, q.sx, q.sy, q.cw, q.ch, -q.px * q.u, -q.py * q.u, q.cw * q.u, q.ch * q.u);
  ctx.restore();
}
