/**
 * @file cache.js
 * @description Cache de sprites pré-renderizados em telas pequenas. Cada sprite é desenhado uma
 * vez (com a resolução atual da tela) e depois só copiado com drawImage a cada quadro.
 */
import { criarTela } from '../primitivas.js';

const guardados = new Map();
/** Mesma cor do contorno dos personagens ilustrados (azul-marinho quase preto). */
export const COR_CONTORNO = '#0b1730';
const DIRECOES_CONTORNO = 16;

/** Cópia da tela com um contorno escuro ao redor da silhueta (dilatação por cópias deslocadas). */
function comContorno(tela, espessura) {
  const saida = criarTela(tela.width, tela.height);
  const c = saida.getContext('2d');
  for (let i = 0; i < DIRECOES_CONTORNO; i++) {
    const a = (i * Math.PI * 2) / DIRECOES_CONTORNO;
    c.drawImage(tela, Math.cos(a) * espessura, Math.sin(a) * espessura);
  }
  c.globalCompositeOperation = 'source-in';
  c.fillStyle = COR_CONTORNO;
  c.fillRect(0, 0, saida.width, saida.height);
  c.globalCompositeOperation = 'source-over';
  c.drawImage(tela, 0, 0);
  return saida;
}

/**
 * @param {string} chave identificador do sprite
 * @param {number} k pixels por unidade lógica
 * @param {{w:number, h:number, ox:number, oy:number}} caixa tamanho e origem (em unidades)
 * @param {(ctx:CanvasRenderingContext2D)=>void} desenhar desenha com a origem em (0, 0)
 * @param {number} contorno espessura do contorno escuro, em unidades (0 = sem contorno)
 */
export function obterSprite(chave, k, caixa, desenhar, contorno = 0) {
  const kk = Math.round(k * 4) / 4;
  const id = `${chave}@${kk}`;
  let sprite = guardados.get(id);
  if (!sprite) {
    const tela = criarTela(caixa.w * kk, caixa.h * kk);
    const ctx = tela.getContext('2d');
    ctx.scale(kk, kk);
    ctx.translate(caixa.ox, caixa.oy);
    desenhar(ctx);
    const final = contorno > 0 ? comContorno(tela, Math.max(1.2, contorno * kk)) : tela;
    sprite = { tela: final, x: -caixa.ox, y: -caixa.oy, w: caixa.w, h: caixa.h };
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
