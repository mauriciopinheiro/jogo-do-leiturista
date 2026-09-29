/**
 * @file fases.js
 * @description Conclusão de rota: no modo campanha encerra com a Kombi; no infinito emenda a
 * próxima rota sem parar.
 */
import { emitir, emitirAviso } from './eventos.js';
import { prepararFase } from './criar.js';
import { processados } from './medidores.js';
import { atualizarRuas } from './ruas.js';

/** Resumo numérico da rota em curso (usado pela interface, pelo save e pelo hub). */
export function resumoDaRota(sim, vitoria) {
  const rota = sim.rotas[sim.faseIdx];
  return {
    vitoria,
    faseIdx: sim.faseIdx,
    infinito: sim.infinito,
    pontos: Math.floor(sim.pontos),
    leituras: sim.fila.lidos,
    perdidos: sim.fila.perdidos,
    totalRota: rota.totalHidrometros,
    perfeitas: sim.perfeitas,
    comboMax: sim.comboMax,
    duracao: Math.round(sim.tempoCorrida),
    ameacaFinal: Math.round(sim.ameaca),
    golpes: sim.golpes,
    melhorAnterior: sim.melhorAnterior
  };
}

function emendarProximaRota(sim) {
  const resumoAnterior = resumoDaRota(sim, true);
  sim.faseIdx = (sim.faseIdx + 1) % sim.rotas.length;
  prepararFase(sim);
  sim.ultimoSpawnX = sim.mundo.L + 40;
  emitir(sim, 'rota-emendada', { faseIdx: sim.faseIdx, resumoAnterior });
  emitirAviso(sim, `♾️ ROTA CONTINUA: ${sim.rotas[sim.faseIdx].bairro}`, 'Modo Infinito em andamento!', 'vitoria', 3);
  atualizarRuas(sim);
}

function iniciarEncerramento(sim) {
  const perdidos = sim.fila.perdidos;
  if (perdidos > 0) {
    const desconto = perdidos * 100;
    sim.pontos = Math.max(0, sim.pontos - desconto);
    emitir(sim, 'desconto', { pontos: desconto, perdidos });
  }
  sim.medidores.length = 0;
  sim.obstaculos.length = 0;
  sim.powerups.length = 0;
  sim.estagio = 'encerramento';
  sim.subestagio = 'chegada';
  sim.ameaca = 0;
  sim.kombi = { x: sim.mundo.L + 220, portaAberta: true, visivel: true };
  emitirAviso(sim, '🏁 ROTA FINALIZADA!', 'A Kombi Branca SEMAE está aguardando!', 'vitoria', 3);
  emitir(sim, 'rota-finalizada');
}

/** Chamada no fim de cada passo de corrida. */
export function verificarConclusao(sim) {
  const total = sim.rotas[sim.faseIdx].totalHidrometros;
  if (processados(sim.fila) < total) return;
  if (sim.infinito) emendarProximaRota(sim);
  else iniciarEncerramento(sim);
}
