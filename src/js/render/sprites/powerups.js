/**
 * @file powerups.js
 * @description Emblemas de power-up (turbo, escudo, osso) e placa de rua. Os ícones são
 * desenhados como caminhos, sem emoji, para ficarem nítidos e baratos.
 */
import { arredondado, circulo, poligono, linha } from '../primitivas.js';
import { obterSprite, pintarSprite } from './cache.js';

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

export function desenharBasePowerup(ctx, tipo) {
  const c = CORES[tipo];
  const halo = ctx.createRadialGradient(0, 0, 10, 0, 0, 30);
  halo.addColorStop(0, c.halo);
  halo.addColorStop(1, 'rgba(255,255,255,0)');
  circulo(ctx, 0, 0, 30, halo);
  circulo(ctx, 0, 0, 19, c.borda);
  circulo(ctx, 0, 0, 16.5, c.fundo);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.ellipse(-5, -8, 8, 3.6, -0.5, 0, Math.PI * 2);
  ctx.fill();
  icone(ctx, tipo);
}

export function desenharPowerup(ctx, p, y, k, relogio) {
  const sprite = obterSprite(`power-${p.tipo}`, k, { w: 64, h: 64, ox: 32, oy: 32 }, (c) => desenharBasePowerup(c, p.tipo));
  const balanco = Math.sin(relogio * 4 + p.x * 0.01) * 3;
  pintarSprite(ctx, sprite, p.x, y + balanco, 1 + Math.sin(relogio * 6) * 0.05);
}

/** Placa de rua azul com o nome; guardada em cache por nome. */
export function desenharPlaca(ctx, placa, y, k) {
  const largura = 250;
  const sprite = obterSprite(`placa-${placa.nome}`, k, { w: largura + 8, h: 64, ox: 4, oy: 4 }, (c) => {
    c.fillStyle = '#4b5563';
    c.fillRect(largura / 2 - 3, 44, 6, 16);
    arredondado(c, 0, 0, largura, 44, 8, '#f8fafc');
    arredondado(c, 3, 3, largura - 6, 38, 6, '#0C326F');
    c.fillStyle = '#FFCD07';
    c.fillRect(3, 34, largura - 6, 4);
    circulo(c, 16, 18, 6.5, '#5FDCF2');
    poligono(c, [[16, 8], [21, 16], [11, 16]], '#5FDCF2');
    c.fillStyle = '#ffffff';
    c.font = "900 13.5px Bahnschrift, 'Trebuchet MS', system-ui, sans-serif";
    c.textAlign = 'center';
    c.fillText(placa.nome.toUpperCase(), largura / 2 + 8, 25, largura - 44);
  });
  pintarSprite(ctx, sprite, placa.x, y);
}
