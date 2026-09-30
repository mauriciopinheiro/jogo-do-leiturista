/**
 * @file colisoes.js
 * @description Leitura de hidrômetros, colisão com obstáculos e coleta de power-ups.
 * Altitudes: medidores/obstáculos guardam `dy` (relativo ao chão, negativo = acima); o jogador
 * guarda `alt`. A caixa de colisão do jogador é a mesma da v3.
 */
import { AMEACA, FISICA, JOGADOR, TEMPOS } from '../config/constantes.js';
import { emitir, emitirAviso } from './eventos.js';
import { adicionarEnergia, subirCombo, zerarCombo } from './pontuacao.js';
import { aumentarAmeaca } from './cao.js';
import { ehAnomalia } from './medidores.js';
import { atualizarRuas, registrarNaRua } from './ruas.js';

/** Centro da caixa do jogador: x em coordenadas de tela, altitude acima do chão. */
export function centroDoJogador(sim) {
  const c = JOGADOR.caixa;
  return { x: sim.jogador.x + c.recuoX + c.largura / 2, alt: sim.jogador.alt + (c.base + c.topo) / 2 };
}

export function tocouMedidor(sim, m, centro = centroDoJogador(sim)) {
  return Math.hypot(m.x - centro.x, -m.dy - centro.alt) < m.r + 20;
}

export function tocouObstaculo(sim, o) {
  const c = JOGADOR.caixa;
  const x0 = sim.jogador.x + c.recuoX;
  const baixo = sim.jogador.alt + c.base;
  const cima = sim.jogador.alt + c.topo;
  return o.x < x0 + c.largura && o.x + o.w > x0 && -o.dy - o.h < cima && -o.dy > baixo;
}

export function tocouPowerup(sim, p, centro = centroDoJogador(sim)) {
  return Math.hypot(p.x - centro.x, -p.dy - centro.alt) < p.r + 22;
}

export function coletarMedidor(sim, m) {
  m.coletado = true;
  const fila = sim.fila;
  fila.lidos += 1;
  registrarNaRua(sim, m.dados.ruaIdx, 'lidos');
  sim.leituras += 1;
  subirCombo(sim, m.tipo === 'ouro' ? 2 : 1);
  let base = m.tipo === 'ouro' ? 150 : 100;
  const anomalia = ehAnomalia(m.dados);
  if (anomalia) base += 75;
  const perfeita = !sim.jogador.noChao && Math.abs(sim.jogador.vy) < FISICA.limitePerfeita;
  adicionarEnergia(sim, perfeita ? 22 : m.tipo === 'ouro' ? 18 : 10);
  if (perfeita) {
    sim.perfeitas += 1;
    base += 50;
    sim.calor = Math.min(100, sim.calor + 8);
  } else if (m.tipo === 'ouro') {
    sim.calor = Math.min(100, sim.calor + 6);
  }
  const ganho = Math.round(base * sim.mult * (sim.flow.estado === 'ativo' ? 1.5 : 1));
  sim.pontos += ganho;
  emitir(sim, 'leitura', { x: m.x, dy: m.dy, ouro: m.tipo === 'ouro', perfeita, anomalia, ganho, media: m.dados.media3m });
  atualizarRuas(sim);
}

export function perderMedidor(sim, m) {
  m.coletado = true;
  sim.fila.perdidos += 1;
  registrarNaRua(sim, m.dados.ruaIdx, 'perdidos');
  zerarCombo(sim);
  emitir(sim, 'perdido', { x: Math.max(40, m.x) });
  atualizarRuas(sim);
}

export function baterNoObstaculo(sim, o) {
  const j = sim.jogador;
  if (o.acertado || j.machucado > 0) return;
  o.acertado = true;
  if (sim.flow.estado === 'ativo') {
    sim.pontos += 250;
    emitir(sim, 'impacto-flow', { x: o.x + o.w / 2, dy: o.dy });
    return;
  }
  if (sim.escudo) {
    sim.escudo = false;
    emitir(sim, 'escudo-bloqueou', { x: j.x, alt: j.alt });
    return;
  }
  j.machucado = TEMPOS.machucado;
  sim.tremor = TEMPOS.tremor;
  sim.golpes += 1;
  sim.tempoGolpe = 0;
  aumentarAmeaca(sim, AMEACA.porColisao);
  zerarCombo(sim);
  emitir(sim, 'colisao', { numero: Math.min(5, Math.ceil(sim.ameaca / 20)), x: o.x, forma: o.forma });
}

export function coletarPowerup(sim, p) {
  p.coletado = true;
  if (p.tipo === 'turbo') sim.turbo = TEMPOS.turbo;
  else if (p.tipo === 'escudo') sim.escudo = true;
  else aumentarAmeaca(sim, AMEACA.osso);
  const textos = { turbo: '🥾 TURBO OPERACIONAL!', escudo: '🛡️ ESCUDO SEMAE!', osso: '🦴 CÃO DISTRAÍDO!' };
  emitir(sim, 'powerup', { qual: p.tipo, x: p.x, dy: p.dy });
  emitirAviso(sim, textos[p.tipo], '', 'aviso', 1.4);
}
