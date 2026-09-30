/**
 * @file cache.js
 * @description Cache de sprites pré-renderizados. Cada sprite é desenhado uma vez na resolução EXATA da
 * tela (pixels do dispositivo por unidade, sem arredondar) e depois só copiado, 1:1 e em pixels inteiros,
 * a cada quadro. Copiar com escala fracionária ou em posição fracionária reamostra o bitmap e borra as
 * bordas (e a borda "treme" de um quadro para o outro); a cópia 1:1 mantém o traço nítido em movimento.
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
 * @param {number} k pixels do dispositivo por unidade lógica (escala atual do desenho)
 * @param {{w:number, h:number, ox:number, oy:number}} caixa tamanho e origem (em unidades)
 * @param {(ctx:CanvasRenderingContext2D)=>void} desenhar desenha com a origem em (0, 0)
 * @param {number} contorno espessura do contorno escuro, em unidades (0 = sem contorno)
 * @param {number} zoom ampliação visual (1 = tamanho normal); o bitmap já nasce ampliado, sem reamostrar
 */
export function obterSprite(chave, k, caixa, desenhar, contorno = 0, zoom = 1) {
  const ke = k * zoom;
  const id = `${chave}@${ke.toFixed(3)}`;
  let sprite = guardados.get(id);
  if (!sprite) {
    const largura = Math.max(1, Math.ceil(caixa.w * ke));
    const altura = Math.max(1, Math.ceil(caixa.h * ke));
    const tela = criarTela(largura, altura);
    const ctx = tela.getContext('2d');
    const sx = largura / caixa.w;
    const sy = altura / caixa.h;
    ctx.scale(sx, sy);
    ctx.translate(caixa.ox, caixa.oy);
    desenhar(ctx);
    const final = contorno > 0 ? comContorno(tela, Math.max(1.2, contorno * ke)) : tela;
    sprite = { tela: final, oxPx: caixa.ox * sx, oyPx: caixa.oy * sy };
    guardados.set(id, sprite);
  }
  return sprite;
}

/**
 * Copia o sprite (sempre no tamanho do bitmap) com a origem em (x, y) unidades, arredondando a posição
 * para o pixel inteiro do dispositivo. Funciona com qualquer translação/escala uniforme do contexto.
 */
export function pintarSprite(ctx, sprite, x, y) {
  const t = ctx.getTransform();
  const dx = Math.round(t.a * x + t.c * y + t.e - sprite.oxPx);
  const dy = Math.round(t.b * x + t.d * y + t.f - sprite.oyPx);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(sprite.tela, dx, dy);
  ctx.restore();
}

export function limparSprites() {
  guardados.clear();
}
