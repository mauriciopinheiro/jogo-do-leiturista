/**
 * @file cache.js
 * @description Cache de sprites pré-renderizados em telas pequenas. Cada sprite é desenhado uma
 * vez (com a resolução atual da tela) e depois só copiado com drawImage a cada quadro.
 */
import { criarTela } from '../primitivas.js';

const guardados = new Map();

/**
 * @param {string} chave identificador do sprite
 * @param {number} k pixels por unidade lógica
 * @param {{w:number, h:number, ox:number, oy:number}} caixa tamanho e origem (em unidades)
 * @param {(ctx:CanvasRenderingContext2D)=>void} desenhar desenha com a origem em (0, 0)
 */
export function obterSprite(chave, k, caixa, desenhar) {
  const kk = Math.round(k * 4) / 4;
  const id = `${chave}@${kk}`;
  let sprite = guardados.get(id);
  if (!sprite) {
    const tela = criarTela(caixa.w * kk, caixa.h * kk);
    const ctx = tela.getContext('2d');
    ctx.scale(kk, kk);
    ctx.translate(caixa.ox, caixa.oy);
    desenhar(ctx);
    sprite = { tela, x: -caixa.ox, y: -caixa.oy, w: caixa.w, h: caixa.h };
    guardados.set(id, sprite);
  }
  return sprite;
}

/** Copia o sprite para que a sua origem fique em (x, y). */
export function pintarSprite(ctx, sprite, x, y, escala = 1) {
  ctx.drawImage(sprite.tela, x + sprite.x * escala, y + sprite.y * escala, sprite.w * escala, sprite.h * escala);
}

export function limparSprites() {
  guardados.clear();
}
