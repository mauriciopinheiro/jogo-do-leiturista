/**
 * @file personagens.js
 * @description Desenho do leiturista e do cão na cena final. Usa as ilustrações quando carregadas
 * (inclusive as poses em que os dois aparecem juntos) e, senão, o desenho vetorial de reserva.
 */
import { UNIFORME } from '../config/uniformes.js';
import { desenharLeiturista } from '../render/sprites/leiturista.js';
import { desenharCao } from '../render/sprites/cao.js';
import { elipse } from '../render/primitivas.js';
import { ilustracoesProntas, obterQuadro } from '../render/ilustracoes/atlas.js';
import { pintarQuadro, pintarLeituristaIlustrado, pintarCaoIlustrado } from '../render/ilustracoes/pintura.js';
import { CENA, FOLHA } from '../render/ilustracoes/quadros.js';

/** Distância do canto esquerdo do cão até a caixa do leiturista ajoelhado (vetor x ilustração). */
export const ENCONTRO = { vetor: 123, ilustrado: 78 };
/** Do canto esquerdo do cão ilustrado até o pivô (centro de massa) do quadro. */
const PIVO_CAO = 46;
/** A ilustração do cão galopa em quadros; na cena a fase corre mais devagar que no jogo. */
const RITMO_GALOPE = 2.8;
const COMPOSTAS = { mao: CENA.mao, tigela: CENA.tigela, afaga: CENA.carinho };

export const modoIlustrado = () => ilustracoesProntas();

/** Leiturista e cão numa só ilustração, ancorada no canto esquerdo do cão. Devolve false se não houver. */
function pintarComposicao(ctx, cena, k, chaoY) {
  const quadro = COMPOSTAS[cena.jogador.pose];
  const q = quadro === undefined ? null : obterQuadro(FOLHA.cena, quadro, k);
  if (!q) return false;
  elipse(ctx, cena.cao.x + 62, chaoY + 3, 66, 6, 'rgba(0,0,0,0.25)');
  pintarQuadro(ctx, q, cena.cao.x + 3, chaoY);
  return true;
}

function pintarVetorial(ctx, cena, tempo) {
  const { jogador: p, cao: c } = cena;
  elipse(ctx, c.x + 37, c.y + 50, 30, 5, 'rgba(0,0,0,0.25)');
  ctx.save();
  ctx.translate(c.x + 37.5, c.y);
  ctx.scale(c.olhando, 1);
  ctx.translate(-37.5, 0);
  desenharCao(ctx, { fase: c.fase, sentado: c.sentado, feliz: c.feliz, tempo, boca: c.feliz });
  ctx.restore();
  ctx.save();
  ctx.translate(p.x + 22.5, p.y);
  ctx.scale(p.olhando, 1);
  ctx.translate(-22.5, 0);
  desenharLeiturista(ctx, { uniforme: UNIFORME, fase: p.fase, noAr: false, vy: 0, pose: p.pose, inclinacao: p.inclinacao || 0 });
  ctx.restore();
}

/** @param {number} k pixels por unidade para o pré-escalonamento das ilustrações */
export function pintarPersonagens(ctx, cena, k, chaoY, tempo) {
  if (modoIlustrado()) {
    if (pintarComposicao(ctx, cena, k, chaoY)) return;
    const { jogador: p, cao: c } = cena;
    elipse(ctx, c.x + PIVO_CAO, chaoY + 3, 36, 5, 'rgba(0,0,0,0.25)');
    pintarCaoIlustrado(ctx, k, {
      x: c.x + PIVO_CAO, y: chaoY, espelhar: c.olhando < 0, sentado: c.sentado, feliz: c.feliz, fase: c.fase * RITMO_GALOPE, tempo
    });
    elipse(ctx, p.x + 22.5, chaoY + 3, 24, 5, 'rgba(0,0,0,0.25)');
    pintarLeituristaIlustrado(ctx, k, { x: p.x + 22.5, y: chaoY, espelhar: p.olhando < 0, pose: p.pose, fase: p.fase, tempo });
    return;
  }
  pintarVetorial(ctx, cena, tempo);
}
