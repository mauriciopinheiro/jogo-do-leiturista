/**
 * @file desenho.js
 * @description Desenho das cenas finais reutilizando cenário e personagens do jogo.
 */
import { ROTAS_SEMAE } from '../config/rotas.js';
import { arredondado, circulo } from '../render/primitivas.js';
import { TEXTOS } from './roteiro.js';

function coracao(ctx, x, y, tamanho, alfa) {
  ctx.save();
  ctx.globalAlpha = alfa;
  ctx.translate(x, y);
  ctx.scale(tamanho / 20, tamanho / 20);
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.bezierCurveTo(-14, -4, -8, -14, 0, -6);
  ctx.bezierCurveTo(8, -14, 14, -4, 0, 6);
  ctx.fillStyle = '#ff4d6d';
  ctx.fill();
  ctx.restore();
}

function tigela(ctx, x, y) {
  arredondado(ctx, x, y, 26, 14, 5, '#dc2626');
  ctx.fillStyle = '#78350f';
  ctx.fillRect(x + 3, y, 20, 4);
  for (const dx of [8, 13, 18]) circulo(ctx, x + dx, y + 1.6, 2.4, '#ca8a04');
}

/** Retrospectiva: lista das 5 rotas com marca de concluída, uma a uma. */
export function desenharRetrospectiva(ctx, layout, tempo) {
  const { L, A } = layout;
  ctx.fillStyle = '#08202f';
  ctx.fillRect(0, 0, L, A);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#5FDCF2';
  ctx.font = "900 20px Bahnschrift, 'Trebuchet MS', system-ui, sans-serif";
  const topo = A * 0.5 - 150;
  ctx.fillText(TEXTOS.retrospectiva, L / 2, topo);
  const larguraLista = Math.min(L - 60, 420);
  ROTAS_SEMAE.forEach((rota, i) => {
    if (tempo < i * 0.45) return;
    const y = topo + 46 + i * 44;
    arredondado(ctx, L / 2 - larguraLista / 2, y - 24, larguraLista, 36, 10, 'rgba(255,255,255,0.07)');
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = "800 16px 'Segoe UI', Verdana, system-ui, sans-serif";
    ctx.fillText(`${i + 1} · ${rota.bairro}`, L / 2 - larguraLista / 2 + 14, y);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#45cf8a';
    ctx.font = '900 20px system-ui, sans-serif';
    ctx.fillText('✓', L / 2 + larguraLista / 2 - 14, y + 1);
  });
  if (tempo > 2.4) {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#45cf8a';
    ctx.font = "900 24px Bahnschrift, 'Trebuchet MS', system-ui, sans-serif";
    ctx.fillText(TEXTOS.totalConcluidas, L / 2, topo + 46 + 5 * 44 + 24);
  }
}

/** Tigela (só no desenho vetorial: nas ilustrações ela já faz parte da pose) e corações sobre o cão. */
export function pintarTigelaECoracoes(ctx, cena, chaoY) {
  if (cena.tigela) tigela(ctx, cena.tigela.x, cena.tigela.y);
  if (cena.coracoes <= 0) return;
  const y = cena.ilustrado ? chaoY - 104 : cena.cao.y - 10;
  coracao(ctx, cena.cao.x + (cena.ilustrado ? 40 : 44), y - (1 - cena.coracoes) * 14, 26, cena.coracoes);
}
