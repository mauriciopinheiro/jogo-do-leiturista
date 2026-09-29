/**
 * @file cao.js
 * @description O cão da rota (caixa 75x48, pé em y=48, virado para a direita). Corre, late,
 * senta e abana o rabo feliz na cena final.
 */
import { circulo, elipse, linha, poligono } from '../primitivas.js';

const PELO = '#d9822b';
const PELO_ESCURO = '#a95d17';
const CLARO = '#f7e5c8';

function pata(ctx, x, y, angulo, cor) {
  const joelho = { x: x + Math.sin(angulo) * 7, y: y + 6 + Math.cos(angulo) * 2 };
  const pe = { x: joelho.x + Math.sin(angulo * 0.6) * 5 - 1, y: 46 };
  linha(ctx, x, y, joelho.x, joelho.y, cor, 6);
  linha(ctx, joelho.x, joelho.y, pe.x, pe.y, cor, 5.2);
  elipse(ctx, pe.x + 1.5, 46.6, 4.2, 2.3, CLARO);
}

function cabeca(ctx, o, x, y) {
  const aberta = o.boca || o.latido;
  elipse(ctx, x + 12, y + 5, 10, 6.6, CLARO);
  circulo(ctx, x, y, 14, PELO);
  elipse(ctx, x + 11, y + 4, 10.5, 7.6, CLARO);
  if (aberta) {
    elipse(ctx, x + 12, y + 10, 7, 4.4, '#7a1f2b');
    elipse(ctx, x + 13, y + 13.5, 3.4, 4, '#ff7f9a');
  } else {
    ctx.beginPath();
    ctx.arc(x + 11, y + 6, 4, 0.2, Math.PI - 0.3);
    ctx.strokeStyle = '#7a4a22';
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }
  circulo(ctx, x + 20, y + 0.5, 3.4, '#1e1b18');
  circulo(ctx, x + 19.2, y - 0.6, 1, '#ffffff');
  circulo(ctx, x + 3, y - 3, 3.6, '#fffaf0');
  circulo(ctx, x + 4, y - 3, 2.3, '#1e1b18');
  circulo(ctx, x + 3.4, y - 3.8, 0.8, '#ffffff');
  const balanco = o.orelha || 0;
  ctx.save();
  ctx.translate(x - 5, y - 8);
  ctx.rotate(-0.5 + balanco);
  elipse(ctx, 0, 6, 5.5, 10, PELO_ESCURO);
  ctx.restore();
}

/**
 * @param {object} o { fase, sentado, feliz, boca, latido, tempo, orelha }
 * A caixa do cão em pé é 75x48; sentado usa a mesma caixa.
 */
export function desenharCao(ctx, o) {
  const tempo = o.tempo || 0;
  const balancoRabo = o.feliz ? Math.sin(tempo * 14) * 9 : Math.sin(o.fase * 1.5) * 4;
  linha(ctx, 12, o.sentado ? 30 : 20, -6, (o.sentado ? 30 : 20) - 8 + balancoRabo, PELO, 6);
  if (o.sentado) {
    elipse(ctx, 26, 32, 18, 15, PELO, -0.1);
    elipse(ctx, 33, 34, 9, 11, CLARO);
    linha(ctx, 37, 34, 38, 46, PELO_ESCURO, 5.4);
    linha(ctx, 44, 34, 45, 46, PELO_ESCURO, 5.4);
    elipse(ctx, 39, 46.5, 4.5, 2.3, CLARO);
    elipse(ctx, 46, 46.5, 4.5, 2.3, CLARO);
    elipse(ctx, 22, 44, 9, 4, PELO_ESCURO);
    cabeca(ctx, o, 43, 16);
    poligono(ctx, [[36, 26], [43, 31], [50, 26], [44, 33]], '#e11d48');
    return;
  }
  const oscila = Math.sin(o.fase);
  pata(ctx, 16, 32, -oscila * 0.8, PELO_ESCURO);
  pata(ctx, 46, 32, oscila * 0.8, PELO_ESCURO);
  elipse(ctx, 32, 25, 27, 15, PELO, -0.04);
  elipse(ctx, 42, 30, 15, 9, CLARO, 0.15);
  pata(ctx, 22, 33, oscila * 0.8, PELO);
  pata(ctx, 52, 33, -oscila * 0.8, PELO);
  ctx.beginPath();
  ctx.moveTo(52, 16);
  ctx.quadraticCurveTo(56, 26, 52, 33);
  ctx.strokeStyle = '#e11d48';
  ctx.lineWidth = 3.4;
  ctx.stroke();
  circulo(ctx, 54, 31.5, 2.2, '#fbbf24');
  cabeca(ctx, { ...o, orelha: Math.sin(o.fase * 2) * 0.35 }, 61, 15);
}
