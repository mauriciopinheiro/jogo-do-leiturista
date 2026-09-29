/**
 * @file kombi.js
 * @description A Kombi Branca do SEMAE (caixa 170x104, rodas em y=104, virada para a direita).
 * A carroceria (com contorno escuro, como os personagens) é guardada em cache; só as rodas e o
 * balanço são desenhados a cada quadro.
 */
import { arredondado, circulo, elipse, poligono } from '../primitivas.js';
import { COR_CONTORNO, obterSprite, pintarSprite } from './cache.js';

const CAIXA = { w: 190, h: 118, ox: 10, oy: 10 };
const CONTORNO = 2.2;

function roda(ctx, x, y, giro) {
  circulo(ctx, x, y, 17.4, COR_CONTORNO);
  circulo(ctx, x, y, 15, '#111827');
  circulo(ctx, x, y, 9.5, '#cbd5e1');
  circulo(ctx, x, y, 5.5, '#64748b');
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 4; i++) {
    const a = giro + (i * Math.PI) / 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * 9, y + Math.sin(a) * 9);
    ctx.stroke();
  }
}

function carroceria(ctx, portaAberta) {
  arredondado(ctx, 2, 22, 164, 72, 20, '#f4f7fb');
  arredondado(ctx, 8, 6, 148, 34, 16, '#ffffff');
  ctx.fillStyle = '#1351B4';
  ctx.fillRect(2, 60, 164, 15);
  ctx.fillStyle = '#168821';
  ctx.fillRect(2, 75, 164, 3.5);
  ctx.fillStyle = '#FFCD07';
  ctx.fillRect(2, 58, 164, 2.5);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 11px Bahnschrift, "Trebuchet MS", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SEMAE', 66, 71.5);
  arredondado(ctx, 116, 14, 44, 34, 8, '#2c4560');
  poligono(ctx, [[120, 17], [146, 17], [138, 45], [120, 45]], 'rgba(160,215,245,0.85)');
  arredondado(ctx, 14, 16, 36, 30, 6, '#2c4560');
  arredondado(ctx, 56, 16, 36, 30, 6, '#2c4560');
  ctx.fillStyle = 'rgba(160,215,245,0.85)';
  ctx.fillRect(17, 19, 30, 24);
  ctx.fillRect(59, 19, 30, 24);
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillRect(21, 19, 6, 24);
  ctx.fillRect(63, 19, 6, 24);
  if (portaAberta) {
    arredondado(ctx, 96, 14, 16, 68, 4, '#1b2a3c');
    ctx.fillStyle = '#f4f7fb';
    ctx.fillRect(100, 18, 4, 62);
  }
  circulo(ctx, 162, 56, 5.5, '#fff3b0');
  arredondado(ctx, 160, 78, 9, 10, 3, '#94a3b8');
  arredondado(ctx, 0, 64, 6, 10, 2, '#94a3b8');
}

/**
 * @param {object} o { portaAberta, giro (rad das rodas), balanco (u de oscilação) }
 * @param {number} k pixels por unidade (para o cache da carroceria)
 */
export function desenharKombi(ctx, o, k) {
  elipse(ctx, 86, 102, 82, 8, 'rgba(0,0,0,0.25)');
  const sprite = obterSprite(`kombi-${o.portaAberta ? 'aberta' : 'fechada'}`, k, CAIXA, (c) => carroceria(c, o.portaAberta), CONTORNO);
  pintarSprite(ctx, sprite, 0, o.balanco || 0);
  roda(ctx, 38, 90, o.giro || 0);
  roda(ctx, 132, 90, o.giro || 0);
}
