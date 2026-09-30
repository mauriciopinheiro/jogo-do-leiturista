/**
 * @file entidades.js
 * @description Desenho de tudo que se move sobre o cenário: Kombi, obstáculos, medidores,
 * power-ups, placas, cão e leiturista, com auras de Flow/escudo.
 */
import { JOGADOR, CAO } from '../config/constantes.js';
import { UNIFORME } from '../config/uniformes.js';
import { elipse } from './primitivas.js';
import { desenharLeiturista } from './sprites/leiturista.js';
import { desenharCao } from './sprites/cao.js';
import { desenharMedidor } from './sprites/medidor.js';
import { desenharObstaculo } from './sprites/obstaculos.js';
import { desenharPowerup } from './sprites/powerups.js';
import { desenharPlaca } from './sprites/placa.js';
import { pintarLeituristaIlustrado, pintarCaoIlustrado } from './ilustracoes/pintura.js';
import { desnivelDaRua } from './cenas.js';
import { poseDoEstagio, olhandoParaTras, caoNoEncerramento } from './ilustracoes/quadros.js';

/** @param {[number, number]|null} livre faixa de x (u) sem obstáculos: a cena da derrota ocupa esse espaço */
export function desenharCarga(ctx, sim, chaoY, k, relogio, livre = null) {
  for (const placa of sim.placas) desenharPlaca(ctx, placa, chaoY - 232, k);
  for (const o of sim.obstaculos) {
    if (livre && o.x + o.w > livre[0] && o.x < livre[1]) continue;
    desenharObstaculo(ctx, o, chaoY + o.dy, k, relogio);
  }
  for (const m of sim.medidores) desenharMedidor(ctx, m, chaoY + m.dy, k, relogio);
  for (const p of sim.powerups) desenharPowerup(ctx, p, chaoY + p.dy, k, relogio);
}

/** @param {number|null} osso estágio do cão com o osso (0 fareja, 1 pega, 2 trota) ou null */
export function desenharCaoDaCena(ctx, cao, sim, chaoY, relogio, k, osso = null) {
  const x = cao.x + (cao.investida || 0);
  const latindo = cao.latido > 0;
  elipse(ctx, x + 37, chaoY + 2, 36, 5, 'rgba(0,0,0,0.25)');
  const investindo = (cao.investida || 0) > 6;
  const espera = caoNoEncerramento(sim.estagio, sim.subestagio);
  const ilustrado = pintarCaoIlustrado(ctx, k, { x: x + 30, y: chaoY, latindo, investindo, osso, ...espera, fase: cao.fasePerna, tempo: relogio });
  if (!ilustrado) {
    const y = chaoY - CAO.altura + Math.sin(cao.fasePerna * 2) * 1.6;
    ctx.save();
    ctx.translate(x, y);
    desenharCao(ctx, { fase: cao.fasePerna, boca: sim.ameaca > 70 || latindo, latido: latindo, tempo: relogio, ...espera });
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

/**
 * @param {string|null} reacao gesto passageiro (ver quadros.reacaoDoEvento)
 * @param {object} pose { pose, fase } sobrescreve a pose da corrida (usado no menu e na cena final)
 */
export function desenharJogador(ctx, sim, chaoY, relogio, k, reacao = null, pose = null) {
  const j = sim.jogador;
  if (!j.visivel) return;
  const escala = Math.max(0.25, 1 - j.alt / 200);
  const poseAtual = pose?.pose || poseDoEstagio(sim.estagio, sim.subestagio);
  const saltinho = poseAtual === 'festa' && j.noChao ? 10 + 8 * Math.abs(Math.sin(relogio * 7)) : 0;
  const desnivel = desnivelDaRua(sim) - saltinho;
  elipse(ctx, j.x + 22.5, chaoY + 3 + desnivelDaRua(sim), 26 * escala, 6 * escala, `rgba(0,0,0,${0.26 * escala})`);
  const amassado = j.amassar > 0 ? Math.sin((j.amassar / 0.15) * Math.PI) * 0.09 : 0;
  ctx.save();
  if (j.machucado > 0 && Math.floor(j.machucado / 0.07) % 2 === 0) ctx.globalAlpha = 0.4;
  const dados = {
    fase: pose?.fase ?? j.fasePerna, noAr: !j.noChao, vy: j.vy, alt: j.alt, pose: poseAtual,
    reacao: reacao || (sim.estagio === 'corrida' && olhandoParaTras(sim.ameaca, relogio) ? 'olhaTras' : null),
    machucado: j.machucado > 0, amassando: j.amassar > 0.06, tempo: relogio
  };
  ctx.translate(j.x + 22.5, chaoY - j.alt + desnivel);
  if (!pintarLeituristaIlustrado(ctx, k, { ...dados, x: 0, y: 0 })) {
    ctx.scale(1 + amassado, 1 - amassado);
    ctx.translate(-22.5, -JOGADOR.altura + (j.noChao ? Math.abs(Math.sin(j.fasePerna)) * -1.6 : 0));
    desenharLeiturista(ctx, { ...dados, uniforme: UNIFORME, olhoFechado: j.machucado > 0 });
  }
  ctx.restore();
  auras(ctx, sim, j.x + 24, chaoY - j.alt - 38, relogio);
}
