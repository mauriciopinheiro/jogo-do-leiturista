/**
 * @file geracao.js
 * @description Diretor de percurso: escolhe padrões (medidores e obstáculos) conforme o
 * desempenho recente e os posiciona por distância percorrida, além de sortear power-ups.
 */
import { PADROES } from '../config/padroes.js';
import { FOLGA_ENTRE_PADROES, MARGEM_SPAWN, RAIO_MEDIDOR, RAIO_POWERUP, TEMPOS } from '../config/constantes.js';
import { filaEsgotada } from './medidores.js';

/** Dificuldade: sobe com a fase e com a habilidade, cai depois de tropeços recentes. */
export function nivelAdaptativo(sim) {
  let nivel = sim.faseIdx >= 3 ? 2 : sim.faseIdx >= 1 ? 1 : 0;
  if (sim.golpes >= 2) nivel = 0;
  else if (sim.golpes === 1) nivel = Math.min(nivel, 1);
  else if (sim.calor > 65) nivel = Math.min(3, nivel + 1);
  return nivel;
}

function ordenarPorMenosRecente(recentes) {
  return (a, b) => recentes.indexOf(a.id) - recentes.indexOf(b.id);
}

/** Escolhe um padrão respeitando nível, faixa de velocidade e evitando repetição. */
export function escolherPadrao(sim) {
  const nivel = nivelAdaptativo(sim);
  const vel = sim.velocidade / 60;
  const recentes = sim.fila.recentes;
  const naFaixa = PADROES.filter((p) => p.nivel <= nivel && vel >= p.velMin && vel <= p.velMax);
  const novos = naFaixa.filter((p) => !recentes.includes(p.id));
  if (novos.length > 0) return novos[Math.floor(sim.rng() * novos.length)];
  const pool = naFaixa.length > 0 ? naFaixa : PADROES;
  return [...pool].sort(ordenarPorMenosRecente(recentes))[0];
}

function criarItem(sim, item, xInicio) {
  const fila = sim.fila;
  const x = xInicio + item.dx;
  if (item.tipo === 'obstaculo') {
    sim.obstaculos.push({ forma: item.forma, x, dy: item.dy, w: item.w, h: item.h, acertado: false });
    return;
  }
  if (fila.proximo >= fila.lista.length) return;
  const dados = fila.lista[fila.proximo++];
  sim.medidores.push({
    dados, x, dy: item.dy, r: RAIO_MEDIDOR, girar: 0, coletado: false,
    tipo: item.ouro || dados.ouro ? 'ouro' : 'comum'
  });
}

/** Coloca um novo padrão logo depois da borda direita da tela. */
export function gerarPadrao(sim) {
  if (filaEsgotada(sim.fila)) return;
  const padrao = escolherPadrao(sim);
  sim.fila.recentes.push(padrao.id);
  if (sim.fila.recentes.length > 5) sim.fila.recentes.shift();
  const xInicio = Math.max(sim.mundo.L + MARGEM_SPAWN, sim.ultimoSpawnX + FOLGA_ENTRE_PADROES);
  for (const item of padrao.itens) criarItem(sim, item, xInicio);
  sim.ultimoSpawnX = xInicio + padrao.fim;
}

/** Um power-up por vez, escolhido entre os que fazem sentido agora. */
export function gerarPowerup(sim) {
  if (sim.powerups.length > 0) return;
  const candidatos = [];
  if (sim.turbo <= 0) candidatos.push('turbo');
  if (!sim.escudo) candidatos.push('escudo');
  if (sim.ameaca > 30) candidatos.push('osso');
  const tipo = candidatos.length ? candidatos[Math.floor(sim.rng() * candidatos.length)] : 'turbo';
  const altura = 120 + sim.rng() * 60;
  sim.powerups.push({ tipo, x: sim.mundo.L + 60, dy: -altura, r: RAIO_POWERUP, coletado: false });
}

export function atualizarRelogioPowerup(sim, dt) {
  sim.relogioPowerup += dt;
  if (sim.relogioPowerup < sim.proximoPowerup) return;
  sim.relogioPowerup = 0;
  const [minimo, maximo] = TEMPOS.intervaloPowerup;
  sim.proximoPowerup = minimo + sim.rng() * (maximo - minimo);
  gerarPowerup(sim);
}
