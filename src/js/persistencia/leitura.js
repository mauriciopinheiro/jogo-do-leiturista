/**
 * @file leitura.js
 * @description Interpreta texto de save (armazenamento ou arquivo importado): limite de tamanho
 * antes do parse, JSON.parse protegido, validação, migração do esquema v1 e mensagens claras.
 */
import { CHAVE_SAVE, CHAVE_SAVE_V1, ESQUEMA_SAVE, ID_APP, LIMITE_SAVE_BYTES, VERSAO_APP } from '../config/constantes.js';
import { limitar, ehNumeroFinito } from '../nucleo/util.js';
import { ROTAS_SEMAE } from '../config/rotas.js';
import { deEstado, progressoInicial } from './progresso.js';
import { assinar, salvamentoValido } from './salvamento.js';

const MOTIVOS = {
  grande: 'O arquivo é maior que o limite de 256 KB.',
  json: 'O arquivo não é um progresso válido (JSON ilegível).',
  assinatura: 'O progresso foi alterado ou está corrompido e foi recusado.',
  incompativel: 'Este progresso é de outro jogo ou de uma versão incompatível.'
};

const tamanhoEmBytes = (texto) => new TextEncoder().encode(texto).length;
const quantidade = ROTAS_SEMAE.length;
const listaDe = (v, padrao) => (Array.isArray(v) && v.length === quantidade ? v : padrao);

/** Converte um save do esquema v1 em um envelope v2 assinado; null se não for reconhecido. */
export function migrarV1(d1) {
  if (!d1 || typeof d1 !== 'object' || !d1.estado) return null;
  if (d1.app !== ID_APP && d1.app !== 'jogo-do-leiturista') return null;
  if (d1.versaoEsquema !== 1 && d1.versaoEsquema !== undefined) return null;
  const e = d1.estado;
  const finito = (v) => (ehNumeroFinito(v) && v >= 0 ? v : 0);
  const migrado = {
    app: ID_APP, versaoJogo: VERSAO_APP, versaoEsquema: ESQUEMA_SAVE,
    criadoEm: typeof d1.criadoEm === 'string' ? d1.criadoEm : new Date().toISOString(),
    estado: {
      lifetimeReadings: finito(e.lifetimeReadings ?? e.totalReadings), best: finito(e.best), endlessBest: finito(e.endlessBest),
      bestByPhase: listaDe(e.bestByPhase, Array(quantidade).fill(0)).map(finito),
      campaignCompleted: Boolean(e.campaignCompleted), grandFinaleSeen: Boolean(e.grandFinaleSeen),
      lastCampaignStats: e.lastCampaignStats ?? null,
      phaseResults: listaDe(e.phaseResults, Array(quantidade).fill(null)),
      selectedSkin: Number.isInteger(e.selectedSkin) ? limitar(e.selectedSkin, 0, 4) : 0,
      maxUnlockedFase: Number.isInteger(e.maxUnlockedFase) ? limitar(e.maxUnlockedFase, 1, quantidade) : 1,
      musicOn: e.musicOn !== undefined ? Boolean(e.musicOn) : true,
      sfxOn: e.sfxOn !== undefined ? Boolean(e.sfxOn) : true,
      partidaEmAndamento: null
    },
    checksum: '', assinatura: ''
  };
  migrado.assinatura = assinar(migrado);
  migrado.checksum = migrado.assinatura;
  return salvamentoValido(migrado) ? migrado : null;
}

/** @returns {{ok:true, salvamento:object, migrado:boolean}|{ok:false, motivo:string, mensagem:string}} */
export function interpretarSalvamento(texto) {
  const falha = (motivo) => ({ ok: false, motivo, mensagem: MOTIVOS[motivo] });
  if (typeof texto !== 'string' || tamanhoEmBytes(texto) > LIMITE_SAVE_BYTES) return falha('grande');
  let d;
  try { d = JSON.parse(texto); } catch { return falha('json'); }
  if (!d || typeof d !== 'object') return falha('json');
  if (d.versaoEsquema === ESQUEMA_SAVE) {
    if (d.app !== ID_APP) return falha('incompativel');
    return salvamentoValido(d) ? { ok: true, salvamento: d, migrado: false } : falha('assinatura');
  }
  if (d.versaoEsquema === 1 || d.versaoEsquema === undefined) {
    const migrado = migrarV1(d);
    return migrado ? { ok: true, salvamento: migrado, migrado: true } : falha('incompativel');
  }
  return falha('incompativel');
}

/**
 * Carrega o progresso do armazenamento. Um save ilegível NÃO é apagado: a cópia bruta fica em
 * `<chave>.invalido` para eventual recuperação manual.
 * @returns {{progresso:object, origem:'v2'|'v1'|'novo', recusado:string|null}}
 */
export function carregarProgresso(armazenamento) {
  const bruto = armazenamento.ler(CHAVE_SAVE);
  let recusado = null;
  if (bruto) {
    const r = interpretarSalvamento(bruto);
    if (r.ok) return { progresso: deEstado(r.salvamento.estado), origem: 'v2', recusado: null };
    recusado = r.motivo;
    if (armazenamento.ler(`${CHAVE_SAVE}.invalido`) === null) armazenamento.gravar(`${CHAVE_SAVE}.invalido`, bruto.slice(0, LIMITE_SAVE_BYTES));
  }
  const antigo = armazenamento.ler(CHAVE_SAVE_V1);
  if (antigo) {
    const r = interpretarSalvamento(antigo);
    if (r.ok) return { progresso: deEstado(r.salvamento.estado), origem: 'v1', recusado };
  }
  return { progresso: progressoInicial(), origem: 'novo', recusado };
}
