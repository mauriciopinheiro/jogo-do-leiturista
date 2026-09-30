/**
 * @file cenas.js
 * @description Momentos do jogo cujo desenho envolve mais de um elemento: a Kombi (parada, andando, o
 * menino descendo e entrando) e a derrota (o cão alcança o menino). Usa as ilustrações e, se elas não
 * estiverem prontas, o desenho vetorial de reserva da Kombi.
 */
import { KOMBI_CENA, DERROTA_CENA, TEMPOS } from '../config/constantes.js';
import { limitar } from '../nucleo/util.js';
import { elipse } from './primitivas.js';
import { desenharKombi } from './sprites/kombi.js';
import { ilustracoesProntas } from './ilustracoes/atlas.js';
import { pintarKombiIlustrada, pintarSequencia } from './ilustracoes/pintura.js';

const ANDANDO = new Set(['chegada', 'partida', 'saida']);

/**
 * @param {object} sim simulação (estagio, subestagio, tempoSub)
 * @param {{x:number, portaAberta:boolean}} kombi `x` = canto traseiro da van
 */
export function desenharKombiDaCena(ctx, sim, kombi, chaoY, relogio, k) {
  const sub = sim.estagio === 'inativo' ? '' : sim.subestagio;
  const andando = ANDANDO.has(sub);
  const balanco = andando ? Math.sin(relogio * 26) * 0.7 : 0;
  if (!ilustracoesProntas()) {
    ctx.save();
    ctx.translate(kombi.x, chaoY - 82);
    desenharKombi(ctx, { portaAberta: kombi.portaAberta, giro: kombi.x * 0.07, balanco }, k);
    ctx.restore();
    return;
  }
  const x = kombi.x + KOMBI_CENA.largura;
  const y = chaoY + KOMBI_CENA.chaoDaVan;
  elipse(ctx, kombi.x + KOMBI_CENA.largura / 2, y + 2, 86, 7, 'rgba(0,0,0,0.25)');
  ctx.save();
  ctx.translate(0, balanco);
  if (sub === 'saindo') pintarSequencia(ctx, k, 'descer', { t: sim.tempoSub, duracao: TEMPOS.saidaDaKombi, x, y });
  else if (sub === 'entrando') pintarSequencia(ctx, k, 'entrar', { t: sim.tempoSub, duracao: TEMPOS.embarqueNaKombi, x, y });
  else pintarKombiIlustrada(ctx, k, { x, y, aberta: kombi.portaAberta, andando, tempo: relogio });
  ctx.restore();
}

/**
 * Degrau entre a rua (onde a Kombi para) e a calçada: o menino sobe ao embarcar e desce ao sair, em vez de
 * "pular" quando a ilustração da Kombi entra ou sai. Só vale com as ilustrações.
 */
export function desnivelDaRua(sim) {
  if (!ilustracoesProntas()) return 0;
  const j = sim.jogador;
  const kx = sim.kombi.x;
  if (sim.estagio === 'abertura' && sim.subestagio === 'desembarque') {
    const inicio = kx + KOMBI_CENA.saidaX - 22.5;
    return KOMBI_CENA.desnivel * (1 - limitar((j.x - inicio) / Math.max(1, sim.mundo.jogadorX - inicio), 0, 1));
  }
  if (sim.estagio === 'encerramento' && sim.subestagio === 'embarque') {
    const porta = kx + KOMBI_CENA.portaX - 22.5;
    return KOMBI_CENA.desnivel * limitar((j.x - (porta - 140)) / 140, 0, 1);
  }
  return 0;
}

/** Derrota: o cão salta no menino e o lambe. Devolve false (e nada é desenhado) sem as ilustrações. */
export function desenharDerrota(ctx, sim, chaoY, k) {
  if (!ilustracoesProntas()) return false;
  const x = sim.jogador.x + 22.5 - DERROTA_CENA.meninoX;
  elipse(ctx, x + 70, chaoY + 3, 66, 6, 'rgba(0,0,0,0.25)');
  return pintarSequencia(ctx, k, 'derrota', { t: sim.tempoDerrota, duracao: DERROTA_CENA.duracao, x, y: chaoY });
}

/** A derrota ilustrada vale enquanto o cão alcança o menino e depois, com a tela de resultado por cima. */
export const emDerrota = (sim) => sim.estagio === 'derrota' || sim.estagio === 'fim';
