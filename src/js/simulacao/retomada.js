/**
 * @file retomada.js
 * @description Foto da partida em andamento (gravada no save) e sua restauração. Os nomes dos
 * campos seguem o save v2 da v3.4.0; os campos novos (perdidos, perdidosPorRua) são opcionais para
 * que partidas gravadas pela v3 ainda possam ser retomadas.
 *
 * A fila de hidrômetros retoma a partir do total PROCESSADO (lidos + perdidos). Os que já estavam na
 * tela, ainda sem leitura, são gerados de novo: guardar o índice da fila os perderia para sempre e a
 * rota nunca fecharia.
 */
import { criarPrng } from '../nucleo/prng.js';
import { limitar } from '../nucleo/util.js';
import { iniciarPartida } from './criar.js';
import { pularAbertura } from './kombi.js';
import { atualizarRuas } from './ruas.js';

/** @returns {object|null} foto da corrida em curso; null se não há o que retomar */
export function fotografarPartida(sim) {
  if (sim.estagio !== 'corrida') return null;
  const f = sim.fila;
  return {
    faseIdx: sim.faseIdx,
    isEndless: sim.infinito,
    score: Math.floor(sim.pontos),
    readings: sim.leituras,
    perfects: sim.perfeitas,
    maxCombo: sim.comboMax,
    dogThreat: Math.round(sim.ameaca * 10) / 10,
    ruaIdx: sim.ruaAtual,
    readingsByRua: f.porRua.map((r) => r.lidos),
    perdidosPorRua: f.porRua.map((r) => r.perdidos),
    completedRuas: [...f.concluidas],
    totalFaseReadings: f.lidos,
    perdidos: f.perdidos,
    partidaId: sim.partidaId,
    seed: sim.semente
  };
}

const inteiro = (v, minimo, maximo, padrao = 0) =>
  Number.isFinite(v) ? Math.round(limitar(v, minimo, maximo)) : padrao;

/** Retoma uma partida a partir da foto, sem repetir a abertura da Kombi. */
export function restaurarPartida(sim, p, melhorAnterior = 0) {
  iniciarPartida(sim, {
    faseIdx: inteiro(p.faseIdx, 0, sim.rotas.length - 1),
    infinito: Boolean(p.isEndless),
    semente: Number.isFinite(p.seed) ? p.seed : Date.now(),
    melhorAnterior
  });
  if (p.partidaId) sim.partidaId = String(p.partidaId).slice(0, 60);
  pularAbertura(sim);
  const f = sim.fila;
  const total = sim.rotas[sim.faseIdx].totalHidrometros;
  f.porRua.forEach((rua, i) => {
    rua.lidos = inteiro(p.readingsByRua?.[i], 0, rua.total);
    rua.perdidos = inteiro(p.perdidosPorRua?.[i], 0, rua.total - rua.lidos);
  });
  f.lidos = f.porRua.reduce((soma, r) => soma + r.lidos, 0);
  f.perdidos = f.porRua.reduce((soma, r) => soma + r.perdidos, 0);
  f.proximo = Math.min(total, f.lidos + f.perdidos);
  sim.pontos = inteiro(p.score, 0, 1e9);
  sim.leituras = inteiro(p.readings, 0, 1e6);
  sim.perfeitas = inteiro(p.perfects, 0, 1e6);
  sim.comboMax = inteiro(p.maxCombo, 0, 1e6);
  sim.ameaca = limitar(Number.isFinite(p.dogThreat) ? p.dogThreat : 0, 0, 90);
  sim.rng = criarPrng(sim.semente + f.proximo);
  sim.ruaAnunciada = -1;
  sim.placas.length = 0;
  for (let i = 0; i < f.porRua.length; i++) {
    const r = f.porRua[i];
    if (r.lidos + r.perdidos >= r.total) f.concluidas.add(i);
  }
  atualizarRuas(sim);
  sim.cao.x = sim.jogador.x - 230 + (sim.ameaca / 100) * 170;
  return sim;
}
