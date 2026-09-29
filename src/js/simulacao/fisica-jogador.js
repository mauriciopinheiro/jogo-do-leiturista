/**
 * @file fisica-jogador.js
 * @description Pulo do leiturista: toque curto = pulo baixo, segurar = pulo alto (soltar corta a
 * subida). A altitude `alt` é medida a partir do chão (0 = pé no chão).
 */
import { FISICA } from '../config/constantes.js';
import { emitir } from './eventos.js';
import { ativarFlowSePronto } from './pontuacao.js';

function pular(sim) {
  const j = sim.jogador;
  j.vy = FISICA.impulsoPulo;
  j.noChao = false;
  sim.buffer = 0;
  emitir(sim, 'pulo');
}

/** Entrada: dedo/tecla pressionado. Só age durante a corrida. */
export function pressionar(sim) {
  sim.segurando = true;
  if (sim.estagio !== 'corrida' || sim.pausado) return;
  ativarFlowSePronto(sim);
  if (sim.jogador.noChao) pular(sim);
  else sim.buffer = FISICA.bufferPulo;
}

/** Entrada: dedo/tecla solto. Corta a subida para virar um pulo baixo. */
export function soltar(sim) {
  sim.segurando = false;
  if (sim.jogador.vy > FISICA.corteSoltar) sim.jogador.vy = FISICA.corteSoltar;
}

/** Integra a queda e o pouso. Roda em todos os estágios (o pulo termina mesmo após a vitória). */
export function integrarJogador(sim, dt) {
  const j = sim.jogador;
  if (j.noChao) return;
  const vyAntes = j.vy;
  j.vy -= FISICA.gravidade * dt;
  j.alt += j.vy * dt;
  if (j.vy < 0 && j.alt <= 0) {
    j.alt = 0;
    j.vy = 0;
    j.noChao = true;
    j.amassar = 0.15;
    emitir(sim, 'aterrissagem', { forca: Math.abs(vyAntes) });
    if (sim.buffer > 0 && sim.estagio === 'corrida') pular(sim);
  }
}
