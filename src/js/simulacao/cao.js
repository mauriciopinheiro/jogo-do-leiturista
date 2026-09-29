/**
 * @file cao.js
 * @description O cão da rota. A ameaça (0..100) sobe devagar com o tempo e com cada tropeço; aos
 * 100 o cão alcança o leiturista. A posição do cão é sempre função da ameaça.
 */
import { AMEACA, CAO } from '../config/constantes.js';
import { limitar } from '../nucleo/util.js';
import { emitir } from './eventos.js';

/** Posição alvo do cão (borda esquerda) para uma ameaça: encosta no jogador em 100. */
export function posicaoAlvoDoCao(sim, ameaca = sim.ameaca) {
  return sim.jogador.x - CAO.distanciaMaxima + (ameaca / 100) * (CAO.distanciaMaxima - CAO.distanciaMinima);
}

export function aumentarAmeaca(sim, delta) {
  sim.ameaca = limitar(sim.ameaca + delta, 0, AMEACA.limite);
}

/** Texto do estágio da ameaça (a interface nunca depende só da cor). */
export function rotuloDaAmeaca(ameaca) {
  if (ameaca < 25) return 'Seguro';
  if (ameaca < 50) return 'Alerta';
  if (ameaca < 75) return 'Perigo';
  return 'Investida!';
}

/** Atualiza a ameaça passiva, a corrida do cão e o latido. */
export function atualizarCao(sim, dt) {
  aumentarAmeaca(sim, AMEACA.passiva * dt);
  const cao = sim.cao;
  cao.fasePerna += 0.24 * sim.velocidadeEfetiva * dt;
  const alvo = posicaoAlvoDoCao(sim);
  cao.x += (alvo - cao.x) * (1 - Math.pow(0.92, 60 * dt));
  if (cao.latido > 0) cao.latido -= dt;
  if (sim.ameaca > 80) {
    const folga = Math.max(0, sim.jogador.x - (cao.x + CAO.largura) - 8);
    cao.investida = Math.min(folga, Math.abs(Math.sin(sim.tempo * 18)) * 12);
    if (cao.latido <= 0 && sim.rng() < 1.2 * dt) {
      cao.latido = 1.2;
      emitir(sim, 'latido');
    }
  } else {
    cao.investida = 0;
  }
}

/** O cão alcançou o leiturista? */
export function caoAlcancou(sim) {
  return sim.ameaca >= AMEACA.limite;
}
