/**
 * @file powerups.js
 * @description Emblemas de power-up (turbo, escudo, osso). Os ícones são
 * desenhados como caminhos, sem emoji, para ficarem nítidos e baratos.
 */
import { arredondado, circulo, poligono, linha } from '../primitivas.js';
import { obterSprite, pintarSprite } from './cache.js';

const CAIXA = { w: 64, h: 64, ox: 32, oy: 32 };
const CONTORNO = 1.6;

const CORES = {
  turbo: { fundo: '#FFCD07', borda: '#b58a00', halo: 'rgba(255,205,7,0.5)' },
  escudo: { fundo: '#2f6fe0', borda: '#0c326f', halo: 'rgba(95,160,255,0.55)' },
  osso: { fundo: '#f6e7c8', borda: '#a57a3a', halo: 'rgba(255,230,180,0.55)' }
};

function icone(ctx, tipo) {
  if (tipo === 'turbo') {
    poligono(ctx, [[-9, 4], [-9, -6], [-3, -6], [-1, -1], [7, 1], [9, 5], [9, 7], [-9, 7]], '#3b2b00');
    ctx.fillStyle = '#fff3b0';
    ctx.fillRect(-9, 6, 18, 2);
    linha(ctx, -12, -2, -16, -2, '#3b2b00', 1.6);
    linha(ctx, -12, 2, -17, 2, '#3b2b00', 1.6);
  } else if (tipo === 'escudo') {
    poligono(ctx, [[0, -10], [9, -6], [8, 3], [0, 11], [-8, 3], [-9, -6]], '#ffffff');
    ctx.strokeStyle = '#2f6fe0';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(-4, 0);
    ctx.lineTo(-1, 4);
    ctx.lineTo(5, -4);
    ctx.stroke();
  } else {
    ctx.save();
    ctx.rotate(-0.6);
    arredondado(ctx, -9, -2.6, 18, 5.2, 2, '#8a5a1f');
    for (const [x, y] of [[-9, -3.5], [-9, 3.5], [9, -3.5], [9, 3.5]]) circulo(ctx, x, y, 3.4, '#8a5a1f');
    ctx.restore();
  }
}

function halo(ctx, tipo) {
  const g = ctx.createRadialGradient(0, 0, 10, 0, 0, 30);
  g.addColorStop(0, CORES[tipo].halo);
  g.addColorStop(1, 'rgba(255,255,255,0)');
  circulo(ctx, 0, 0, 30, g);
}

function emblema(ctx, tipo) {
  const c = CORES[tipo];
  circulo(ctx, 0, 0, 19, c.borda);
  circulo(ctx, 0, 0, 16.5, c.fundo);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.ellipse(-5, -8, 8, 3.6, -0.5, 0, Math.PI * 2);
  ctx.fill();
  icone(ctx, tipo);
}

/** Halo (sem contorno, transparência própria) e emblema (com contorno) do power-up. Origem = centro. */
export function pintarBasePowerup(ctx, tipo, k, alfaHalo = 1) {
  const anterior = ctx.globalAlpha;
  ctx.globalAlpha = anterior * alfaHalo;
  pintarSprite(ctx, obterSprite(`power-halo-${tipo}`, k, CAIXA, (c) => halo(c, tipo)), 0, 0);
  ctx.globalAlpha = anterior;
  pintarSprite(ctx, obterSprite(`power-${tipo}`, k, CAIXA, (c) => emblema(c, tipo), CONTORNO), 0, 0);
}

export function desenharPowerup(ctx, p, y, k, relogio) {
  const balanco = Math.sin(relogio * 4 + p.x * 0.01) * 3;
  ctx.save();
  ctx.translate(p.x, y + balanco);
  pintarBasePowerup(ctx, p.tipo, k, 0.75 + Math.sin(relogio * 6) * 0.25);
  ctx.restore();
}
