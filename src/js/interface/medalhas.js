/**
 * @file medalhas.js
 * @description Medalhas de Leitura, Precisão e Agilidade e a dica final. Mesmos limiares da
 * v3.4.0. Funções puras (sem DOM) para testar e para calcular a nota enviada ao Hub.
 */
import { formatarInteiro } from '../nucleo/util.js';

const nivelPor = (valor, ouro, prata, bronze) =>
  (valor >= ouro ? 'ouro' : valor >= prata ? 'prata' : valor >= bronze ? 'bronze' : 'nenhuma');

export const ROTULO_NIVEL = { ouro: 'Ouro', prata: 'Prata', bronze: 'Bronze', nenhuma: 'Ainda não' };

/** Combo necessário para o ouro de Agilidade em cada rota. */
export function metaDeCombo(faseIdx) {
  return faseIdx === 0 ? 6 : faseIdx === 1 ? 10 : 15;
}

export function medalhasDoResumo(resumo) {
  const leitura = resumo.totalRota ? resumo.leituras / resumo.totalRota : 0;
  const precisao = resumo.leituras > 0 ? resumo.perfeitas / resumo.leituras : 0;
  const meta = metaDeCombo(resumo.faseIdx);
  return {
    leitura: { nivel: nivelPor(leitura, 1, 0.85, 0.7), fracao: leitura, nome: 'Leitura' },
    precisao: { nivel: nivelPor(precisao, 0.3, 0.2, 0.1), fracao: Math.min(1, precisao / 0.3), nome: 'Precisão' },
    agilidade: {
      nivel: nivelPor(resumo.comboMax, meta, Math.round(meta * 0.6), Math.round(meta * 0.3)),
      fracao: Math.min(1, resumo.comboMax / meta), nome: 'Agilidade'
    }
  };
}

/** Frase de incentivo/dica mostrada no resultado. */
export function dicaDoResumo(resumo, novoRecorde) {
  const partes = [];
  if (novoRecorde) partes.push(`Novo recorde pessoal! Você passou o anterior em ${formatarInteiro(resumo.pontos - resumo.melhorAnterior)} pontos.`);
  const precisao = resumo.leituras > 0 ? resumo.perfeitas / resumo.leituras : 0;
  if (!resumo.vitoria && resumo.ameacaFinal >= 95) partes.push('Dica de segurança: coletas aéreas perfeitas e ruas concluídas afastam o cão.');
  else if (!resumo.vitoria && resumo.golpes >= 2) partes.push('Dica de ritmo: solte o toque mais cedo para pousar rápido e pular de novo.');
  else if (precisao < 0.3 && resumo.leituras > 0) {
    partes.push(`Dica de precisão: faltaram ${Math.max(1, Math.ceil((0.3 - precisao) * resumo.leituras))} coletas aéreas para o ouro.`);
  }
  return partes.join(' ');
}
