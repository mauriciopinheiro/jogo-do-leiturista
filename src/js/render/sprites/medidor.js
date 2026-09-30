/**
 * @file medidor.js
 * @description Hidrômetro coletável: base pré-renderizada (anel, mostrador, marcas, visor) + partes
 * dinâmicas (consumo em m³ e ponteiro). Ouro tem anel dourado e estrela. Tudo é copiado 1:1 em pixels
 * inteiros e, em telas pequenas, já nasce ampliado (`escalaDeLeitura`) para o número ser legível.
 */
import { arredondado, circulo, poligono } from '../primitivas.js';
import { escalaDeLeitura } from '../leitura.js';
import { obterSprite, pintarSprite } from './cache.js';

export const RAIO_VISUAL = 22;
const CAIXA = { w: 76, h: 76, ox: 38, oy: 38 };
const CAIXA_ROTULO = { w: 34, h: 14, ox: 17, oy: 7 };
const CONTORNO = 1.7;
const CORES = {
  comum: { anel: '#5FDCF2', corpo: ['#1a5fd0', '#0a2a66'], brilho: 'rgba(95,220,242,0.5)' },
  ouro: { anel: '#ffd23f', corpo: ['#b7791f', '#6b3f0c'], brilho: 'rgba(255,210,63,0.6)' }
};
const FONTE_ROTULO = "700 9.6px Consolas, 'SF Mono', 'DejaVu Sans Mono', monospace";

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
  arredondado(ctx, -15, 2, 30, 12, 3, '#0b1a2e');
  if (tipo === 'ouro') estrela(ctx, 14, -16, 7, '#fff3a3');
}

/**
 * Halo (sem contorno, com transparência própria) e corpo (com contorno), com a origem no centro.
 * @param {number} zoom ampliação visual (ver leitura.js)
 * @param {number} alfaHalo 0..1: o halo "pulsa" pela transparência, sem reamostrar o bitmap
 */
export function pintarBaseMedidor(ctx, tipo, k, zoom = 1, alfaHalo = 1) {
  const anterior = ctx.globalAlpha;
  ctx.globalAlpha = anterior * alfaHalo;
  pintarSprite(ctx, obterSprite(`medidor-halo-${tipo}`, k, CAIXA, (c) => halo(c, tipo), 0, zoom), 0, 0);
  ctx.globalAlpha = anterior;
  pintarSprite(ctx, obterSprite(`medidor-${tipo}`, k, CAIXA, (c) => corpo(c, tipo), CONTORNO, zoom), 0, 0);
}

function rotulo(texto, k, zoom) {
  return obterSprite(`rotulo-${texto}`, k, CAIXA_ROTULO, (c) => {
    c.font = FONTE_ROTULO;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillStyle = '#ffffff';
    c.fillText(texto, 0, 0.6);
  }, 0, zoom);
}

/**
 * @param {object} m medidor da simulação
 * @param {number} y posição vertical do centro em unidades
 */
export function desenharMedidor(ctx, m, y, k, relogio) {
  const tipo = m.tipo === 'ouro' ? 'ouro' : 'comum';
  const z = escalaDeLeitura(k);
  ctx.save();
  ctx.translate(m.x, y);
  pintarBaseMedidor(ctx, tipo, k, z, 0.72 + Math.sin(relogio * 5 + m.girar) * 0.28);
  const a = m.girar * 1.6 - Math.PI / 2;
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 1.7 * z;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, -4 * z);
  ctx.lineTo(Math.cos(a) * 9.5 * z, -4 * z + Math.sin(a) * 9.5 * z);
  ctx.stroke();
  circulo(ctx, 0, -4 * z, 2 * z, '#dc2626');
  pintarSprite(ctx, rotulo(`${m.dados.media3m} m³`, k, z), 0, 8 * z);
  ctx.restore();
}
