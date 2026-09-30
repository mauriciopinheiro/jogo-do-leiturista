/**
 * @file ruas.js
 * @description Progresso por rua. Uma rua conta como concluída quando todos os seus hidrômetros
 * foram processados (lidos OU perdidos) — na v3 um hidrômetro perdido travava a rua para sempre.
 */
import { AMEACA, TEMPOS } from '../config/constantes.js';
import { emitir, emitirAviso } from './eventos.js';
import { aumentarAmeaca } from './cao.js';
import { adicionarPlaca } from './placas.js';

export function registrarNaRua(sim, ruaIdx, campo) {
  const rua = sim.fila.porRua[ruaIdx];
  if (rua) rua[campo] += 1;
}

const ruaCompleta = (rua) => rua.lidos + rua.perdidos >= rua.total;

/** Índice da primeira rua ainda em andamento (ou a última, se todas terminaram). */
export function ruaEmAndamento(fila) {
  const idx = fila.porRua.findIndex((rua) => !ruaCompleta(rua));
  return idx === -1 ? fila.porRua.length - 1 : idx;
}

/** @returns {boolean} false se a placa foi descartada por cobrir outra de uma rua com mais hidrômetros */
function anunciarPlaca(sim, rota, idx) {
  const rua = rota.ruas[idx];
  return adicionarPlaca(sim.placas, { nome: rua.nome, x: sim.mundo.L + 40, total: rua.hidrometros }, sim.mundo.L);
}

/**
 * Detecta ruas concluídas e mudança de rua. Deve ser chamada depois de cada leitura ou perda
 * e no início da corrida.
 */
export function atualizarRuas(sim) {
  const rota = sim.rotas[sim.faseIdx];
  const fila = sim.fila;
  fila.porRua.forEach((rua, i) => {
    if (!ruaCompleta(rua) || fila.concluidas.has(i)) return;
    fila.concluidas.add(i);
    if (sim.estagio !== 'corrida') return;
    sim.pontos += 1000;
    aumentarAmeaca(sim, AMEACA.ruaConcluida);
    emitir(sim, 'rua-concluida', { nome: rota.ruas[i].nome, indice: i });
    emitirAviso(sim, '📍 RUA CONCLUÍDA!', rota.ruas[i].nome, 'checkpoint', 2.3);
  });
  sim.ruaAtual = ruaEmAndamento(fila);
  if (sim.ruaAnunciada === sim.ruaAtual || sim.estagio !== 'corrida') return;
  const primeira = sim.ruaAnunciada === -1;
  sim.ruaAnunciada = sim.ruaAtual;
  const comPlaca = anunciarPlaca(sim, rota, sim.ruaAtual);
  emitir(sim, 'rua-nova', { nome: rota.ruas[sim.ruaAtual].nome, primeira, placa: comPlaca });
  if (!primeira && comPlaca) {
    sim.travessia = TEMPOS.travessiaRua;
    emitirAviso(sim, '🚸 ATRAVESSANDO A RUA…', `Entrando na ${rota.ruas[sim.ruaAtual].nome}`, 'checkpoint', 2.3);
  }
}
