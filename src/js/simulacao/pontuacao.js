/**
 * @file pontuacao.js
 * @description Combo, multiplicador e modo Flow. Todos os tempos em segundos reais.
 */
import { TEMPOS } from '../config/constantes.js';
import { emitir, emitirAviso } from './eventos.js';

export function subirCombo(sim, pontos = 1) {
  sim.combo += pontos;
  sim.comboMax = Math.max(sim.comboMax, sim.combo);
  sim.mult = Math.min(5, 1 + Math.floor(sim.combo / 4) * 0.25);
  sim.tempoCombo = TEMPOS.combo;
}

export function zerarCombo(sim) {
  if (sim.combo >= 4) emitir(sim, 'combo-perdido', { combo: sim.combo });
  sim.combo = 0;
  sim.mult = 1;
  sim.tempoCombo = 0;
}

/** Energia do Flow sobe a cada leitura; ao chegar a 100 o próximo pulo o ativa. */
export function adicionarEnergia(sim, quantidade) {
  const fator = sim.flow.estado === 'ativo' ? 0.3 : 1;
  sim.flow.energia = Math.min(100, sim.flow.energia + quantidade * fator);
  if (sim.flow.energia >= 100 && sim.flow.estado === 'ocioso') {
    sim.flow.estado = 'pronto';
    emitir(sim, 'flow-pronto');
    emitirAviso(sim, '⚡ FLOW PRONTO!', 'Pule para ativar: proteção e bônus 1,5×', 'flow', 1.7);
  }
}

export function ativarFlowSePronto(sim) {
  if (sim.flow.estado !== 'pronto') return;
  sim.flow.estado = 'ativo';
  sim.flow.tempo = TEMPOS.flow;
  emitir(sim, 'flow-ativo');
  emitirAviso(sim, '⚡ FLOW ATIVADO!', 'Você está protegido contra obstáculos!', 'flow', 2);
}

/** Avança os temporizadores de combo, turbo, Flow e ritmo de golpes. */
export function atualizarTemporizadores(sim, dt) {
  if (sim.tempoCombo > 0) {
    sim.tempoCombo -= dt;
    if (sim.tempoCombo <= 0) zerarCombo(sim);
  }
  if (sim.turbo > 0) sim.turbo = Math.max(0, sim.turbo - dt);
  if (sim.jogador.machucado > 0) sim.jogador.machucado = Math.max(0, sim.jogador.machucado - dt);
  if (sim.jogador.amassar > 0) sim.jogador.amassar = Math.max(0, sim.jogador.amassar - dt);
  if (sim.tremor > 0) sim.tremor = Math.max(0, sim.tremor - dt);
  if (sim.travessia > 0) sim.travessia = Math.max(0, sim.travessia - dt);
  if (sim.buffer > 0) sim.buffer = Math.max(0, sim.buffer - dt);
  sim.calor = Math.max(0, sim.calor - 3 * dt);
  if (sim.golpes > 0) {
    sim.tempoGolpe += dt;
    if (sim.tempoGolpe >= TEMPOS.decaimentoGolpes) {
      sim.golpes -= 1;
      sim.tempoGolpe = 0;
    }
  }
  if (sim.flow.estado === 'ativo') {
    sim.flow.tempo -= dt;
    if (sim.flow.tempo <= 0) {
      sim.flow.estado = 'ocioso';
      sim.flow.energia = 0;
      emitir(sim, 'flow-fim');
    }
  }
}
