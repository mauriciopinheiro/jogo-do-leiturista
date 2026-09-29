/**
 * @file entidades.js
 * @description Desenho de tudo que se move sobre o cenário: Kombi, obstáculos, medidores,
 * power-ups, placas, cão e leiturista, com auras de Flow/escudo.
 */
import { JOGADOR, CAO } from '../config/constantes.js';
import { UNIFORMES } from '../config/uniformes.js';
import { elipse } from './primitivas.js';
import { desenharLeiturista } from './sprites/leiturista.js';
import { desenharCao } from './sprites/cao.js';
import { desenharKombi } from './sprites/kombi.js';
import { desenharMedidor } from './sprites/medidor.js';
import { desenharObstaculo } from './sprites/obstaculos.js';
import { desenharPowerup, desenharPlaca } from './sprites/powerups.js';
import { pintarLeituristaIlustrado, pintarCaoIlustrado } from './ilustracoes/pintura.js';

export function desenharCarga(ctx, sim, chaoY, k, relogio) {
  for (const placa of sim.placas) desenharPlaca(ctx, placa, chaoY - 232, k);
  for (const o of sim.obstaculos) desenharObstaculo(ctx, o, chaoY + o.dy, k, relogio);
  for (const m of sim.medidores) desenharMedidor(ctx, m, chaoY + m.dy, k, relogio);
  for (const p of sim.powerups) desenharPowerup(ctx, p, chaoY + p.dy, k, relogio);
}

export function desenharKombiDaCena(ctx, kombi, chaoY, relogio, emMovimento, k) {
  ctx.save();
  ctx.translate(kombi.x, chaoY - 82);
  desenharKombi(ctx, { portaAberta: kombi.portaAberta, giro: kombi.x * 0.07, balanco: emMovimento ? Math.sin(relogio * 26) * 0.7 : 0 }, k);
  ctx.restore();
}

export function desenharCaoDaCena(ctx, cao, sim, chaoY, relogio, k) {
  const x = cao.x + (cao.investida || 0);
  const latindo = cao.latido > 0;
  elipse(ctx, x + 37, chaoY + 2, 36, 5, 'rgba(0,0,0,0.25)');
  const ilustrado = pintarCaoIlustrado(ctx, k, { x: x + 30, y: chaoY, latindo, fase: cao.fasePerna, tempo: relogio });
  if (!ilustrado) {
    const y = chaoY - CAO.altura + Math.sin(cao.fasePerna * 2) * 1.6;
    ctx.save();
    ctx.translate(x, y);
    desenharCao(ctx, { fase: cao.fasePerna, boca: sim.ameaca > 70 || latindo, latido: latindo, tempo: relogio });
    ctx.restore();
  }
  if (cao.latido > 0.6) {
    const y = chaoY - (ilustrado ? 84 : 62);
    ctx.font = "900 15px Bahnschrift, 'Trebuchet MS', system-ui, sans-serif";
    ctx.textAlign = 'center';
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(8,32,47,0.85)';
    ctx.strokeText('AU! AU!', x + 62, y);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('AU! AU!', x + 62, y);
  }
}

function auras(ctx, sim, cx, cy, relogio) {
  if (sim.flow.estado === 'pronto') {
    ctx.strokeStyle = `rgba(255,205,7,${0.6 + Math.sin(relogio * 9) * 0.3})`;
    ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.arc(cx, cy, 44 + Math.sin(relogio * 9) * 3, 0, Math.PI * 2); ctx.stroke();
  } else if (sim.flow.estado === 'ativo') {
    ctx.fillStyle = 'rgba(95,220,242,0.2)';
    ctx.beginPath(); ctx.arc(cx, cy, 50, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(95,220,242,0.95)';
    ctx.lineWidth = 3.5;
    ctx.stroke();
  }
  if (sim.escudo) {
    ctx.strokeStyle = 'rgba(120,170,255,0.95)';
    ctx.fillStyle = 'rgba(120,170,255,0.14)';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(cx, cy, 38, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
}

/** @param {object} pose { pose, fase } sobrescreve a pose da corrida (usado no menu e na cena final) */
export function desenharJogador(ctx, sim, chaoY, uniformeIdx, relogio, k, pose = null) {
  const j = sim.jogador;
  if (!j.visivel) return;
  const escala = Math.max(0.25, 1 - j.alt / 200);
  elipse(ctx, j.x + 22.5, chaoY + 3, 26 * escala, 6 * escala, `rgba(0,0,0,${0.26 * escala})`);
  const amassado = j.amassar > 0 ? Math.sin((j.amassar / 0.15) * Math.PI) * 0.09 : 0;
  ctx.save();
  if (j.machucado > 0 && Math.floor(j.machucado / 0.07) % 2 === 0) ctx.globalAlpha = 0.4;
  const dados = {
    uniforme: uniformeIdx, fase: pose?.fase ?? j.fasePerna, noAr: !j.noChao, vy: j.vy, pose: pose?.pose || 'corre',
    machucado: j.machucado > 0, amassando: j.amassar > 0.06, tempo: relogio
  };
  ctx.translate(j.x + 22.5, chaoY - j.alt);
  if (!pintarLeituristaIlustrado(ctx, k, { ...dados, x: 0, y: 0 })) {
    ctx.scale(1 + amassado, 1 - amassado);
    ctx.translate(-22.5, -JOGADOR.altura + (j.noChao ? Math.abs(Math.sin(j.fasePerna)) * -1.6 : 0));
    desenharLeiturista(ctx, { ...dados, uniforme: UNIFORMES[uniformeIdx] || UNIFORMES[0], olhoFechado: j.machucado > 0 });
  }
  ctx.restore();
  auras(ctx, sim, j.x + 24, chaoY - j.alt - 38, relogio);
}
