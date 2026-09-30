/**
 * @file kombi.js
 * @description Máquinas de estado da abertura (a Kombi deixa o leiturista e o cão entra) e do
 * encerramento (a Kombi volta e leva o leiturista). Velocidades em u/s.
 */
import { emitir, emitirAviso } from './eventos.js';
import { KOMBI_CENA, TEMPOS } from '../config/constantes.js';
import { posicaoAlvoDoCao } from './cao.js';
import { resumoDaRota } from './fases.js';
import { atualizarRuas } from './ruas.js';

/** Cadência das pernas proporcional à distância (como na corrida): 0,22 rad por unidade percorrida. */
const RAD_POR_UNIDADE = 0.22;
const VELOCIDADE_DESEMBARQUE = 150;
const VELOCIDADE_EMBARQUE = 228;
const RAD_POR_UNIDADE_CAO = 0.24;
const VELOCIDADE_CAO_ABERTURA = 270;

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

/** Onde a Kombi para: o menino termina de descer 25 u antes do ponto onde começa a correr. */
function xDaKombiParada(mundo) {
  return Math.max(-10, mundo.jogadorX + 22.5 - KOMBI_CENA.saidaX - 25);
}

function abertura(sim, dt) {
  const { kombi, jogador, cao, mundo } = sim;
  if (sim.subestagio === 'chegada') {
    const alvo = xDaKombiParada(mundo);
    kombi.x = Math.min(alvo, kombi.x + 240 * dt);
    if (kombi.x >= alvo) {
      sim.subestagio = 'saindo';
      sim.tempoSub = 0;
    }
  } else if (sim.subestagio === 'saindo') {
    sim.tempoSub += dt;
    if (sim.tempoSub >= TEMPOS.saidaDaKombi) {
      jogador.visivel = true;
      jogador.x = kombi.x + KOMBI_CENA.saidaX - 22.5;
      sim.subestagio = 'desembarque';
    }
  } else if (sim.subestagio === 'desembarque') {
    jogador.x = Math.min(mundo.jogadorX, jogador.x + VELOCIDADE_DESEMBARQUE * dt);
    jogador.fasePerna += RAD_POR_UNIDADE * VELOCIDADE_DESEMBARQUE * dt;
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
    cao.x += VELOCIDADE_CAO_ABERTURA * dt;
    cao.fasePerna += RAD_POR_UNIDADE_CAO * VELOCIDADE_CAO_ABERTURA * dt;
    if (cao.x >= 35) comecarCorrida(sim);
  }
}

function encerramento(sim, dt) {
  const { kombi, jogador, mundo } = sim;
  sim.velocidadeEfetiva = Math.max(0, sim.velocidadeEfetiva - 500 * dt);
  sim.rolagem += sim.velocidadeEfetiva * dt;
  const correndoAteAPorta = sim.subestagio === 'embarque' && jogador.noChao;
  jogador.fasePerna += RAD_POR_UNIDADE * (correndoAteAPorta ? VELOCIDADE_EMBARQUE : Math.max(sim.velocidadeEfetiva, 120)) * dt;
  if (sim.subestagio === 'chegada') {
    kombi.x -= 270 * dt;
    if (kombi.x <= mundo.L - 160) {
      kombi.x = mundo.L - 160;
      sim.subestagio = 'embarque';
    }
  } else if (sim.subestagio === 'embarque') {
    if (jogador.noChao) jogador.x += VELOCIDADE_EMBARQUE * dt;
    if (jogador.x >= kombi.x + KOMBI_CENA.portaX - 22.5 && jogador.noChao) {
      jogador.visivel = false;
      sim.subestagio = 'entrando';
      sim.tempoSub = 0;
    }
  } else if (sim.subestagio === 'entrando') {
    sim.tempoSub += dt;
    if (sim.tempoSub >= TEMPOS.embarqueNaKombi) {
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
