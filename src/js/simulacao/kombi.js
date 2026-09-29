/**
 * @file kombi.js
 * @description Máquinas de estado da abertura (a Kombi deixa o leiturista e o cão entra) e do
 * encerramento (a Kombi volta e leva o leiturista). Velocidades em u/s.
 */
import { emitir, emitirAviso } from './eventos.js';
import { posicaoAlvoDoCao } from './cao.js';
import { resumoDaRota } from './fases.js';
import { atualizarRuas } from './ruas.js';

const PASSO_PERNA = 13.2;

function comecarCorrida(sim) {
  const { jogador, cao, mundo } = sim;
  sim.estagio = 'corrida';
  sim.subestagio = '';
  sim.kombi.visivel = false;
  jogador.visivel = true;
  jogador.x = mundo.jogadorX;
  cao.visivel = true;
  cao.x = Math.max(cao.x, 35);
  sim.ameaca = 0;
  sim.ultimoSpawnX = mundo.L;
  atualizarRuas(sim);
  emitir(sim, 'corrida-iniciada');
  emitirAviso(sim, '🏃 CORRIDA INICIADA!', 'Boa sorte na leitura da rota SEMAE!', 'normal', 2);
}

/** Toque durante a abertura: pula a animação da Kombi. */
export function pularAbertura(sim) {
  if (sim.estagio !== 'abertura') return;
  sim.cao.x = posicaoAlvoDoCao(sim, 0);
  comecarCorrida(sim);
}

function abertura(sim, dt) {
  const { kombi, jogador, cao, mundo } = sim;
  if (sim.subestagio === 'chegada') {
    kombi.x = Math.min(80, kombi.x + 240 * dt);
    if (kombi.x >= 80) {
      jogador.visivel = true;
      jogador.x = 90;
      sim.subestagio = 'desembarque';
    }
  } else if (sim.subestagio === 'desembarque') {
    jogador.x = Math.min(mundo.jogadorX, jogador.x + 150 * dt);
    jogador.fasePerna += PASSO_PERNA * dt;
    if (jogador.x >= mundo.jogadorX) {
      kombi.portaAberta = false;
      sim.subestagio = 'partida';
    }
  } else if (sim.subestagio === 'partida') {
    kombi.x -= 360 * dt;
    if (kombi.x <= -250) {
      cao.visivel = true;
      cao.x = -160;
      sim.subestagio = 'cao';
    }
  } else if (sim.subestagio === 'cao') {
    cao.x += 270 * dt;
    cao.fasePerna += 14 * dt;
    if (cao.x >= 35) comecarCorrida(sim);
  }
}

function encerramento(sim, dt) {
  const { kombi, jogador, mundo } = sim;
  sim.velocidadeEfetiva = Math.max(0, sim.velocidadeEfetiva - 500 * dt);
  sim.rolagem += sim.velocidadeEfetiva * dt;
  jogador.fasePerna += 0.22 * Math.max(sim.velocidadeEfetiva, 120) * dt;
  if (sim.subestagio === 'chegada') {
    kombi.x -= 270 * dt;
    if (kombi.x <= mundo.L - 160) {
      kombi.x = mundo.L - 160;
      sim.subestagio = 'embarque';
    }
  } else if (sim.subestagio === 'embarque') {
    if (jogador.noChao) jogador.x += 228 * dt;
    if (jogador.x >= kombi.x + 25 && jogador.noChao) {
      jogador.visivel = false;
      kombi.portaAberta = false;
      sim.subestagio = 'saida';
    }
  } else if (sim.subestagio === 'saida') {
    kombi.x += 450 * dt;
    if (kombi.x >= mundo.L + 220) {
      sim.estagio = 'concluida';
      sim.resultado = resumoDaRota(sim, true);
      emitir(sim, 'rota-concluida', { resumo: sim.resultado });
    }
  }
}

export function avancarKombi(sim, dt) {
  if (sim.estagio === 'abertura') abertura(sim, dt);
  else if (sim.estagio === 'encerramento') encerramento(sim, dt);
}
