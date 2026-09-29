/**
 * @file roteiro.js
 * @description Roteiro da cena final (retrospectiva + encerramento narrativo): cenas, durações
 * e textos. As frases são as aprovadas pelo demandante na v3.4.0; não alterar sem pedido.
 */

/** Duração em segundos e zoom de câmera de cada cena. */
export const CENAS = [
  { nome: 'retrospectiva', duracao: 4.0, zoom: 1.0 },
  { nome: 'conclusao', duracao: 4.0, zoom: 1.0 },
  { nome: 'reencontro', duracao: 4.5, zoom: 1.25 },
  { nome: 'amizade', duracao: 5.5, zoom: 1.45 },
  { nome: 'epilogo', duracao: 6.0, zoom: 1.08 }
];

export const TEMPO_MINIMO_PARA_AVANCAR = 0.6;

export const TEXTOS = {
  retrospectiva: 'RETROSPECTIVA DE LEITURA',
  totalConcluidas: '5/5 ROTAS CONCLUÍDAS!',
  conclusao: (leituras) => ({ titulo: `${leituras} LEITURAS CONCLUÍDAS`, sub: 'Missão cumprida nas 5 rotas SEMAE' }),
  reencontro: { titulo: 'O CACHORRO DA ROTA VOLTOU.', sub: 'Desta vez... ele parou.' },
  epilogo: { titulo: 'JORNADA CONCLUÍDA', sub: 'Missão cumprida no SEMAE Piracicaba' }
};

/** Normaliza as estatísticas vindas do save (ou de um save antigo) para números seguros. */
export function estatisticasSeguras(bruto, totalPadrao) {
  const total = Number.isFinite(bruto?.totalMeters) ? Math.max(1, Math.round(bruto.totalMeters)) : totalPadrao;
  const inteiro = (v, max) => (Number.isFinite(v) ? Math.min(max, Math.max(0, Math.round(v))) : 0);
  return {
    meters: inteiro(bruto?.meters, total),
    totalMeters: total,
    perfects: inteiro(bruto?.perfects, 1e6),
    maxCombo: inteiro(bruto?.maxCombo, 1e6),
    score: inteiro(bruto?.score, 1e9)
  };
}
