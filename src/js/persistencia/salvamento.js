/**
 * @file salvamento.js
 * @description Envelope do save v2 (mesmo da v3.4.0): montagem, assinatura e validação campo a
 * campo. Um save adulterado, de outro jogo ou de versão desconhecida é recusado, nunca aplicado.
 */
import { ID_APP, VERSAO_APP, ESQUEMA_SAVE } from '../config/constantes.js';
import { ROTAS_SEMAE } from '../config/rotas.js';
import { UNIFORMES_DA_V3 } from '../config/uniformes.js';
import { ehNumeroFinito } from '../nucleo/util.js';
import { sha256, fnv1a } from './assinatura.js';
import { sha256LegadoV3 } from './assinatura-legado.js';
import { paraEstado } from './progresso.js';

const QTD_ROTAS = ROTAS_SEMAE.length;
const naoNegativo = (v) => ehNumeroFinito(v) && v >= 0;

/** A parte do envelope coberta pela assinatura (a ordem das chaves faz parte do resumo). */
function nucleo(d) {
  return { app: d.app, versaoJogo: d.versaoJogo, versaoEsquema: d.versaoEsquema, criadoEm: d.criadoEm, estado: d.estado };
}

export const assinar = (d) => `sha256-${sha256(JSON.stringify(nucleo(d)))}`;

export function montarSalvamento(progresso, agora = new Date()) {
  const d = {
    app: ID_APP, versaoJogo: VERSAO_APP, versaoEsquema: ESQUEMA_SAVE,
    criadoEm: agora.toISOString(), estado: paraEstado(progresso), checksum: '', assinatura: ''
  };
  d.assinatura = assinar(d);
  d.checksum = d.assinatura;
  return d;
}

function resultadoDeFaseValido(r) {
  return r === null || (typeof r === 'object' && ['meters', 'perfects', 'maxCombo', 'score'].every((k) => naoNegativo(r[k])));
}

function estatisticasValidas(s) {
  return s === null || (typeof s === 'object' && ['meters', 'totalMeters', 'perfects', 'maxCombo', 'score'].every((k) => naoNegativo(s[k])));
}

function partidaValida(p) {
  if (p === null || p === undefined) return true;
  if (typeof p !== 'object') return false;
  const inteiroEm = (v, max) => Number.isInteger(v) && v >= 0 && v <= max;
  return inteiroEm(p.faseIdx, QTD_ROTAS - 1) && naoNegativo(p.score ?? 0) && naoNegativo(p.dogThreat ?? 0) &&
    (p.readingsByRua === undefined || (Array.isArray(p.readingsByRua) && p.readingsByRua.length <= 20 && p.readingsByRua.every(naoNegativo)));
}

function estadoValido(e) {
  return naoNegativo(e.lifetimeReadings) && naoNegativo(e.best) && naoNegativo(e.endlessBest) &&
    Number.isInteger(e.selectedSkin) && e.selectedSkin >= 0 && e.selectedSkin < UNIFORMES_DA_V3 &&
    Number.isInteger(e.maxUnlockedFase) && e.maxUnlockedFase >= 1 && e.maxUnlockedFase <= QTD_ROTAS &&
    Array.isArray(e.bestByPhase) && e.bestByPhase.length === QTD_ROTAS && e.bestByPhase.every(naoNegativo) &&
    Array.isArray(e.phaseResults) && e.phaseResults.length === QTD_ROTAS && e.phaseResults.every(resultadoDeFaseValido) &&
    estatisticasValidas(e.lastCampaignStats) &&
    typeof e.campaignCompleted === 'boolean' && typeof e.grandFinaleSeen === 'boolean' &&
    typeof e.musicOn === 'boolean' && typeof e.sfxOn === 'boolean' && partidaValida(e.partidaEmAndamento);
}

/** A assinatura confere? Aceita o SHA-256 correto, a variante da v3.4.0 e o FNV-1a das primeiras versões. */
function assinaturaConfere(d) {
  const texto = JSON.stringify(nucleo(d));
  const declarada = typeof d.assinatura === 'string' ? d.assinatura : d.checksum;
  if (typeof declarada !== 'string') return false;
  if (declarada.startsWith('sha256-')) {
    const hash = declarada.slice(7);
    return hash === sha256(texto) || hash === sha256LegadoV3(texto);
  }
  return declarada.startsWith('fnv1a-') && declarada === `fnv1a-${fnv1a(texto)}`;
}

/** Valida um save v2 completo (estrutura, faixas e assinatura). */
export function salvamentoValido(d) {
  if (!d || typeof d !== 'object' || d.app !== ID_APP || d.versaoEsquema !== ESQUEMA_SAVE) return false;
  if (typeof d.criadoEm !== 'string' || !d.estado || typeof d.estado !== 'object') return false;
  return estadoValido(d.estado) && assinaturaConfere(d);
}
