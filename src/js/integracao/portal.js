/**
 * @file portal.js
 * @description Avisa o Hub (página que hospeda o jogo num iframe) quando o jogador VENCE uma
 * rota. O hub soma `pontuacao` ao XP da equipe a cada mensagem e marca o jogo como concluído.
 * As mensagens só vão para a origem da própria página, nunca para "*", e nada é enviado quando o
 * jogo roda sozinho ou a partir de um arquivo local.
 */
import { ID_JOGO_NO_HUB } from '../config/constantes.js';
import { limitar } from '../nucleo/util.js';
import { medalhasDoResumo } from '../interface/medalhas.js';

/**
 * Nota de 0 a 100: 60% pela leitura, 25% pela coleta aérea e 15% pelo combo (mesma régua das
 * medalhas). É só para o XP do Hub; a pontuação do jogo continua a mesma.
 */
export function calcularNota(resumo) {
  const m = medalhasDoResumo(resumo);
  return Math.round(limitar(m.leitura.fracao, 0, 1) * 60 + limitar(m.precisao.fracao, 0, 1) * 25 + limitar(m.agilidade.fracao, 0, 1) * 15);
}

function estrelas(resumo) {
  const m = medalhasDoResumo(resumo);
  const nivel = (x) => ({ ouro: 3, prata: 2, bronze: 1, nenhuma: 0 })[x.nivel];
  return limitar(Math.round((nivel(m.leitura) + nivel(m.precisao) + nivel(m.agilidade)) / 3), 1, 3);
}

/** @returns {object|null} a mensagem para o Hub, ou null se a partida não deve ser enviada */
export function montarMensagem(resumo, agora = Date.now()) {
  if (!resumo.vitoria || resumo.infinito) return null;
  return {
    tipo: 'SEMAE_FIM_PARTIDA',
    jogoId: ID_JOGO_NO_HUB,
    carimbo: agora,
    pontuacao: calcularNota(resumo),
    vitoria: true,
    pontosDoJogo: resumo.pontos,
    duracao: resumo.duracao,
    duracaoSegundos: resumo.duracao,
    estrelas: estrelas(resumo)
  };
}

/** @param {Window} janela */
export function notificarPortal(janela, resumo, agora = Date.now()) {
  const mensagem = montarMensagem(resumo, agora);
  if (!mensagem || janela.parent === janela) return false;
  const origem = janela.location.origin;
  if (!origem || origem === 'null') return false;
  try {
    janela.parent.postMessage(mensagem, origem);
    return true;
  } catch (erro) {
    console.error('[portal] falha ao enviar o resultado ao Hub', erro);
    return false;
  }
}
