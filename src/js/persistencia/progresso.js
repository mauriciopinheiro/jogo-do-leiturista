/**
 * @file progresso.js
 * @description Modelo do progresso do jogador (em português) e mapeamento de/para o `estado`
 * do save v2, cujos nomes de campos (em inglês) vêm da v3.4.0 e são mantidos por compatibilidade.
 */
import { limitar } from '../nucleo/util.js';
import { ROTAS_SEMAE } from '../config/rotas.js';

const QTD_ROTAS = ROTAS_SEMAE.length;

export function progressoInicial() {
  return {
    leiturasVitalicias: 0,
    melhor: 0,
    melhorInfinito: 0,
    melhorPorFase: Array(QTD_ROTAS).fill(0),
    campanhaConcluida: false,
    finalVisto: false,
    ultimasEstatisticas: null,
    resultadosFases: Array(QTD_ROTAS).fill(null),
    faseMaxLiberada: 1,
    musica: true,
    efeitos: true,
    partidaEmAndamento: null
  };
}

/** Progresso -> `estado` do save. */
export function paraEstado(p) {
  return {
    lifetimeReadings: p.leiturasVitalicias,
    best: Math.floor(p.melhor),
    endlessBest: Math.floor(p.melhorInfinito),
    bestByPhase: p.melhorPorFase,
    campaignCompleted: p.campanhaConcluida,
    grandFinaleSeen: p.finalVisto,
    lastCampaignStats: p.ultimasEstatisticas,
    phaseResults: p.resultadosFases,
    selectedSkin: 0,
    maxUnlockedFase: limitar(p.faseMaxLiberada, 1, QTD_ROTAS),
    musicOn: p.musica,
    sfxOn: p.efeitos,
    partidaEmAndamento: p.partidaEmAndamento
  };
}

/** `estado` já validado -> progresso. */
export function deEstado(e) {
  return {
    leiturasVitalicias: e.lifetimeReadings,
    melhor: e.best,
    melhorInfinito: e.endlessBest,
    melhorPorFase: [...e.bestByPhase],
    campanhaConcluida: e.campaignCompleted,
    finalVisto: e.grandFinaleSeen,
    ultimasEstatisticas: e.lastCampaignStats,
    resultadosFases: e.phaseResults.map((r) => (r ? { ...r } : null)),
    faseMaxLiberada: limitar(e.maxUnlockedFase, 1, QTD_ROTAS),
    musica: e.musicOn,
    efeitos: e.sfxOn,
    partidaEmAndamento: e.partidaEmAndamento || null
  };
}

/**
 * Registra o fim de uma rota (vitória ou derrota) no progresso.
 * @returns {{primeiroFinal:boolean, novoRecorde:boolean}}
 */
export function registrarResultado(p, resumo) {
  const { faseIdx, infinito, pontos, vitoria } = resumo;
  const recordeAnterior = infinito ? p.melhorInfinito : p.melhorPorFase[faseIdx] || 0;
  p.melhor = Math.max(p.melhor, pontos);
  if (infinito) p.melhorInfinito = Math.max(p.melhorInfinito, pontos);
  p.partidaEmAndamento = null;
  let primeiroFinal = false;
  if (vitoria && !infinito) {
    p.melhorPorFase[faseIdx] = Math.max(p.melhorPorFase[faseIdx] || 0, pontos);
    p.resultadosFases[faseIdx] = {
      meters: resumo.leituras, perfects: resumo.perfeitas, maxCombo: resumo.comboMax, score: pontos
    };
    p.faseMaxLiberada = limitar(Math.max(p.faseMaxLiberada, faseIdx + 2), 1, QTD_ROTAS);
    if (faseIdx === QTD_ROTAS - 1 && p.resultadosFases.every((r) => r !== null)) {
      p.campanhaConcluida = true;
      p.faseMaxLiberada = QTD_ROTAS;
      p.ultimasEstatisticas = estatisticasDaCampanha(p.resultadosFases);
      primeiroFinal = !p.finalVisto;
      p.finalVisto = true;
    }
  }
  return { primeiroFinal, novoRecorde: pontos > recordeAnterior && recordeAnterior > 0 };
}

export function estatisticasDaCampanha(resultados) {
  const soma = (campo) => resultados.reduce((s, r) => s + (r ? r[campo] : 0), 0);
  return {
    meters: soma('meters'),
    totalMeters: ROTAS_SEMAE.reduce((s, r) => s + r.totalHidrometros, 0),
    perfects: soma('perfects'),
    maxCombo: Math.max(...resultados.map((r) => (r ? r.maxCombo : 0))),
    score: soma('score')
  };
}
