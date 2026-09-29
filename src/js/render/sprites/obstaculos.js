/**
 * @file obstaculos.js
 * @description Obstáculos da calçada. Cada desenho usa a origem no canto superior esquerdo da
 * caixa de colisão (w x h) e é guardado em cache; só a lâmpada da barreira pisca por quadro.
 */
import { arredondado, circulo, elipse, poligono, linha } from '../primitivas.js';
import { obterSprite, pintarSprite } from './cache.js';

const MARGEM = 12;

function cone(ctx, w, h) {
  arredondado(ctx, -3, h - 9, w + 6, 9, 3, '#1f2937');
  poligono(ctx, [[w / 2, 0], [w - 3, h - 8], [3, h - 8]], '#f97316');
  poligono(ctx, [[w / 2 - 6, h * 0.28], [w / 2 + 6, h * 0.28], [w * 0.8, h * 0.5], [w * 0.2, h * 0.5]], '#ffffff');
  poligono(ctx, [[w / 2, 0], [w * 0.72, h - 8], [w / 2, h - 8]], 'rgba(255,255,255,0.22)');
  circulo(ctx, w / 2, 3, 2.4, '#fb923c');
}

function mangueira(ctx, w, h) {
  const cor = '#1f9d55';
  for (const [x, raio] of [[w * 0.3, h * 0.5], [w * 0.62, h * 0.5]]) {
    ctx.strokeStyle = '#146c3a';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.ellipse(x, h / 2, raio + 8, raio + 1, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = cor;
    ctx.lineWidth = 4.6;
    ctx.stroke();
  }
  ctx.strokeStyle = cor;
  ctx.lineWidth = 4.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(w * 0.62, h * 0.55);
  ctx.quadraticCurveTo(w * 0.85, h * 1.05, w - 8, h * 0.6);
  ctx.stroke();
  arredondado(ctx, w - 12, h * 0.32, 12, h * 0.5, 2, '#f5c542');
  arredondado(ctx, w - 5, h * 0.4, 6, h * 0.3, 2, '#94a3b8');
}

function lixeira(ctx, w, h) {
  circulo(ctx, 8, h - 3, 5, '#111827');
  circulo(ctx, w - 8, h - 3, 5, '#111827');
  arredondado(ctx, 0, 10, w, h - 14, 7, '#15803d');
  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  ctx.fillRect(6, 14, 7, h - 24);
  arredondado(ctx, -3, 2, w + 6, 12, 5, '#166534');
  arredondado(ctx, w / 2 - 9, -2, 18, 6, 3, '#e2e8f0');
  ctx.strokeStyle = '#dcfce7';
  ctx.lineWidth = 2.6;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(w / 2 - 9, h * 0.62);
  ctx.lineTo(w / 2, h * 0.34);
  ctx.lineTo(w / 2 + 9, h * 0.62);
  ctx.closePath();
  ctx.stroke();
}

function poca(ctx, w, h) {
  elipse(ctx, w / 2, h - 4, w / 2, 8, '#2a6fb0');
  elipse(ctx, w / 2, h - 5, w / 2 - 5, 6, '#4aa3df');
  elipse(ctx, w / 2 - 12, h - 7, 14, 2.6, 'rgba(255,255,255,0.55)');
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(w * 0.68, h - 5, 9, 3, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function barreira(ctx, w, h) {
  ctx.fillStyle = '#6b3410';
  ctx.fillRect(6, 22, 8, h - 22);
  ctx.fillRect(w - 14, 22, 8, h - 22);
  arredondado(ctx, 0, 10, w, 30, 5, '#f97316');
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 10, w, 30);
  ctx.clip();
  for (let x = -20; x < w + 20; x += 24) poligono(ctx, [[x, 40], [x + 12, 40], [x + 24, 10], [x + 12, 10]], '#ffffff');
  ctx.restore();
  arredondado(ctx, w / 2 - 9, 2, 18, 9, 3, '#374151');
}

function caixote(ctx, w, h) {
  arredondado(ctx, 0, 0, w, h, 4, '#b7793a');
  ctx.strokeStyle = '#7c4a17';
  ctx.lineWidth = 3;
  ctx.strokeRect(2, 2, w - 4, h - 4);
  linha(ctx, 4, 4, w - 4, h - 4, '#8a5522', 4, 'butt');
  linha(ctx, w - 4, 4, 4, h - 4, '#8a5522', 4, 'butt');
  for (const [x, y] of [[6, 6], [w - 6, 6], [6, h - 6], [w - 6, h - 6]]) circulo(ctx, x, y, 1.6, '#3f2a10');
  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  ctx.fillRect(3, 3, w - 6, 5);
}

const FORMAS = { cone, mangueira, lixeira, poca, barreira, caixote };

/** Desenho sem cache, usado pela legenda da ajuda. */
export function desenharFormaCrua(ctx, forma, w, h) {
  elipse(ctx, w / 2, h + 1, Math.max(16, w * 0.5), 4.5, 'rgba(0,0,0,0.26)');
  FORMAS[forma](ctx, w, h);
}

/** @param {number} y topo do obstáculo em unidades de tela */
export function desenharObstaculo(ctx, o, y, k, relogio) {
  const caixa = { w: o.w + MARGEM * 2, h: o.h + MARGEM * 2, ox: MARGEM, oy: MARGEM };
  const sprite = obterSprite(`obst-${o.forma}`, k, caixa, (c) => {
    desenharFormaCrua(c, o.forma, o.w, o.h);
  });
  pintarSprite(ctx, sprite, o.x, y);
  if (o.forma === 'barreira') {
    const acesa = Math.floor(relogio * 4) % 2 === 0;
    circulo(ctx, o.x + o.w / 2, y + 6, 5, acesa ? '#fde047' : '#a16207');
    if (acesa) circulo(ctx, o.x + o.w / 2, y + 6, 11, 'rgba(253,224,71,0.3)');
  }
}
