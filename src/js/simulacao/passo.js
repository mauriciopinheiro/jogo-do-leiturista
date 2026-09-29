/**
 * @file passo.js
 * @description Avanço da simulação por tempo. Um quadro grande é dividido em subpassos de no
 * máximo 1/60 s, de modo que a física é a mesma em telas de 60, 90, 120 ou 144 Hz.
 */
import { MARGEM_SPAWN, PASSO_MAXIMO, TEMPOS } from '../config/constantes.js';
import { limitar, filtrarNoLugar } from '../nucleo/util.js';
import { velocidadeBaseUps } from '../config/rotas.js';
import { emitir } from './eventos.js';
import { integrarJogador } from './fisica-jogador.js';
import { atualizarTemporizadores } from './pontuacao.js';
import { atualizarCao, caoAlcancou, posicaoAlvoDoCao } from './cao.js';
import { gerarPadrao, atualizarRelogioPowerup } from './geracao.js';
import {
  centroDoJogador, tocouMedidor, tocouObstaculo, tocouPowerup,
  coletarMedidor, perderMedidor, baterNoObstaculo, coletarPowerup
} from './colisoes.js';
import { verificarConclusao, resumoDaRota } from './fases.js';
import { avancarKombi } from './kombi.js';

function calcularVelocidade(sim) {
  const rota = sim.rotas[sim.faseIdx];
  const progresso = limitar(sim.fila.lidos / (rota.totalHidrometros || 1), 0, 1);
  sim.velocidade = velocidadeBaseUps(rota) + progresso * 1.3 * 60;
  const turbo = sim.turbo > 0 ? 1.08 : 1;
  const flow = sim.flow.estado === 'ativo' ? 1.06 : 1;
  sim.velocidadeEfetiva = sim.velocidade * turbo * flow;
}

function moverEntidades(sim, dt, v) {
  const recuo = v * dt;
  const centro = centroDoJogador(sim);
  for (const m of sim.medidores) {
    m.x -= recuo;
    m.girar += 3 * dt;
    if (m.coletado) continue;
    if (tocouMedidor(sim, m, centro)) coletarMedidor(sim, m);
    else if (m.x < -40) perderMedidor(sim, m);
  }
  filtrarNoLugar(sim.medidores, (m) => !m.coletado && m.x + m.r > -40);
  for (const o of sim.obstaculos) {
    o.x -= recuo;
    if (!o.acertado && tocouObstaculo(sim, o)) baterNoObstaculo(sim, o);
  }
  filtrarNoLugar(sim.obstaculos, (o) => o.x + o.w > -40);
  for (const p of sim.powerups) {
    p.x -= recuo;
    if (!p.coletado && tocouPowerup(sim, p, centro)) coletarPowerup(sim, p);
  }
  filtrarNoLugar(sim.powerups, (p) => !p.coletado && p.x + p.r > -40);
  for (const placa of sim.placas) placa.x -= recuo;
  filtrarNoLugar(sim.placas, (placa) => placa.x > -350);
}

function iniciarDerrota(sim) {
  sim.estagio = 'derrota';
  sim.subestagio = '';
  sim.tempoDerrota = 0;
  sim.jogador.machucado = 5;
  emitir(sim, 'derrota');
}

function avancarCorrida(sim, dt) {
  calcularVelocidade(sim);
  const v = sim.velocidadeEfetiva;
  sim.tempoCorrida += dt;
  sim.jogador.fasePerna += 0.22 * v * dt;
  sim.pontos += 0.16 * v * dt * (sim.turbo > 0 ? 1.25 : 1);
  sim.rolagem += v * dt;
  sim.ultimoSpawnX -= v * dt;
  if (sim.ultimoSpawnX <= sim.mundo.L + MARGEM_SPAWN) gerarPadrao(sim);
  atualizarRelogioPowerup(sim, dt);
  moverEntidades(sim, dt, v);
  atualizarCao(sim, dt);
  if (caoAlcancou(sim)) iniciarDerrota(sim);
  else verificarConclusao(sim);
}

function avancarDerrota(sim, dt) {
  sim.velocidadeEfetiva = Math.max(0, sim.velocidadeEfetiva - 600 * dt);
  sim.rolagem += sim.velocidadeEfetiva * dt;
  sim.cao.x += (posicaoAlvoDoCao(sim, 100) - sim.cao.x) * (1 - Math.pow(0.85, 60 * dt));
  sim.cao.fasePerna += 0.24 * 300 * dt;
  sim.tempoDerrota += dt;
  if (sim.tempoDerrota < TEMPOS.respiroDerrota) return;
  sim.estagio = 'fim';
  sim.resultado = resumoDaRota(sim, false);
  emitir(sim, 'fim-derrota', { resumo: sim.resultado });
}

function subpasso(sim, dt) {
  sim.tempo += dt;
  atualizarTemporizadores(sim, dt);
  integrarJogador(sim, dt);
  if (sim.estagio === 'corrida') avancarCorrida(sim, dt);
  else if (sim.estagio === 'derrota') avancarDerrota(sim, dt);
  else avancarKombi(sim, dt);
}

const ESTAGIOS_ATIVOS = new Set(['abertura', 'corrida', 'encerramento', 'derrota']);

/** Avança a simulação `dtTotal` segundos (já limitado pelo laço). */
export function passo(sim, dtTotal) {
  if (sim.pausado || !ESTAGIOS_ATIVOS.has(sim.estagio) || !(dtTotal > 0)) return;
  const n = Math.max(1, Math.ceil(dtTotal / PASSO_MAXIMO));
  const dt = dtTotal / n;
  for (let i = 0; i < n && ESTAGIOS_ATIVOS.has(sim.estagio); i++) subpasso(sim, dt);
}

