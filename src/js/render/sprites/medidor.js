/**
 * @file medidor.js
 * @description Hidrômetro coletável: base pré-renderizada (anel, mostrador, marcas) + partes
 * dinâmicas (consumo em m³ e ponteiro). Ouro tem anel dourado e estrela.
 */
import { arredondado, circulo, poligono } from '../primitivas.js';
import { obterSprite, pintarSprite } from './cache.js';

const CONTORNO = 1.7;

export const RAIO_VISUAL = 22;
const CAIXA = { w: 76, h: 76, ox: 38, oy: 38 };
const CORES = {
  comum: { anel: '#5FDCF2', corpo: ['#1a5fd0', '#0a2a66'], brilho: 'rgba(95,220,242,0.5)' },
  ouro: { anel: '#ffd23f', corpo: ['#b7791f', '#6b3f0c'], brilho: 'rgba(255,210,63,0.6)' }
};

function estrela(ctx, x, y, r, cor) {
  const pontos = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const raio = i % 2 === 0 ? r : r * 0.45;
    pontos.push([x + Math.cos(a) * raio, y + Math.sin(a) * raio]);
  }
  poligono(ctx, pontos, cor);
}

function halo(ctx, tipo) {
  const g = ctx.createRadialGradient(0, 0, RAIO_VISUAL * 0.6, 0, 0, 36);
  g.addColorStop(0, CORES[tipo].brilho);
  g.addColorStop(1, 'rgba(255,255,255,0)');
  circulo(ctx, 0, 0, 36, g);
}

function corpo(ctx, tipo) {
  const c = CORES[tipo];
  const g = ctx.createLinearGradient(0, -RAIO_VISUAL, 0, RAIO_VISUAL);
  g.addColorStop(0, c.corpo[0]);
  g.addColorStop(1, c.corpo[1]);
  circulo(ctx, 0, 0, RAIO_VISUAL + 3, c.anel);
  circulo(ctx, 0, 0, RAIO_VISUAL, g);
  circulo(ctx, 0, 0, RAIO_VISUAL - 4, '#f4fbff');
  ctx.strokeStyle = 'rgba(12,50,111,0.5)';
  ctx.lineWidth = 1.1;
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * (RAIO_VISUAL - 6.5), Math.sin(a) * (RAIO_VISUAL - 6.5));
    ctx.lineTo(Math.cos(a) * (RAIO_VISUAL - 4.6), Math.sin(a) * (RAIO_VISUAL - 4.6));
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.beginPath();
  ctx.ellipse(-6, -9, 8, 4, -0.6, 0, Math.PI * 2);
  ctx.fill();
  arredondado(ctx, -13, 2.5, 26, 9.5, 2.5, '#0b1a2e');
  if (tipo === 'ouro') estrela(ctx, 14, -16, 7, '#fff3a3');
}

/** Halo (sem contorno) e corpo (com contorno) do medidor, guardados em cache. Origem = centro. */
export function pintarBaseMedidor(ctx, tipo, k, escala = 1) {
  pintarSprite(ctx, obterSprite(`medidor-halo-${tipo}`, k, CAIXA, (c) => halo(c, tipo)), 0, 0, escala);
  pintarSprite(ctx, obterSprite(`medidor-${tipo}`, k, CAIXA, (c) => corpo(c, tipo), CONTORNO), 0, 0, escala);
}

const ROTULO = "700 8.6px Consolas, 'SF Mono', 'DejaVu Sans Mono', monospace";

/**
 * @param {object} m medidor da simulação
 * @param {number} y posição vertical do centro em unidades
 */
export function desenharMedidor(ctx, m, y, k, relogio) {
  const tipo = m.tipo === 'ouro' ? 'ouro' : 'comum';
  const pulso = 1 + Math.sin(relogio * 5 + m.girar) * 0.045;
  ctx.save();
  ctx.translate(m.x, y);
  pintarBaseMedidor(ctx, tipo, k, pulso);
  ctx.restore();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = ROTULO;
  ctx.fillText(`${m.dados.media3m} m³`, m.x, y + 10);
  const a = m.girar * 1.6 - Math.PI / 2;
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 1.7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(m.x, y - 4);
  ctx.lineTo(m.x + Math.cos(a) * 9.5, y - 4 + Math.sin(a) * 9.5);
  ctx.stroke();
  circulo(ctx, m.x, y - 4, 2, '#dc2626');
}
