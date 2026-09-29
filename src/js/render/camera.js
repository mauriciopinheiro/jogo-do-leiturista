/**
 * @file camera.js
 * @description Converte o tamanho da janela (px CSS) no mundo lógico do jogo e no tamanho do
 * canvas interno. O mundo tem largura entre 560 e 900 unidades e altura mínima de 380, o que
 * mantém o leiturista com tamanho útil em retrato, paisagem, tablet e tela ultralarga, e limita
 * o número de pixels pintados por quadro (a v3 pintava até 8 Mpx em celular deitado).
 */
import { limitar, interpolar } from '../nucleo/util.js';

const LARGURA_MIN = 560;
const LARGURA_MAX = 900;
const ALTURA_MIN = 380;
const ORCAMENTO_PIXELS = { leve: 2.2e6, normal: 4.2e6 };
const DPR_MAXIMO = { leve: 2, normal: 2 };

/**
 * @param {{largura:number, altura:number, dpr:number, leve:boolean}} entrada
 * @returns {{L:number, A:number, escala:number, chaoY:number, jogadorX:number,
 *   pxRatio:number, pixelsW:number, pixelsH:number}}
 */
export function calcularLayout({ largura, altura, dpr, leve }) {
  const w = Math.max(1, largura);
  const h = Math.max(1, altura);
  const proporcao = w / h;
  const t = limitar((proporcao - 0.75) / (1.6 - 0.75), 0, 1);
  let L = interpolar(LARGURA_MIN, LARGURA_MAX, t);
  let A = L / proporcao;
  if (A < ALTURA_MIN) {
    A = ALTURA_MIN;
    L = A * proporcao;
  }
  const escala = w / L;
  const faixaInferior = limitar(A * 0.22, 84, 300);
  const chaoY = A - faixaInferior;
  const jogadorX = limitar(L * 0.25 + 20, 150, 280);

  const perfil = leve ? 'leve' : 'normal';
  let pxRatio = Math.min(dpr || 1, DPR_MAXIMO[perfil]);
  const pixels = w * h * pxRatio * pxRatio;
  if (pixels > ORCAMENTO_PIXELS[perfil]) {
    pxRatio = Math.max(0.75, Math.sqrt(ORCAMENTO_PIXELS[perfil] / (w * h)));
  }
  return {
    L, A, escala, chaoY, jogadorX, pxRatio,
    pixelsW: Math.max(1, Math.floor(w * pxRatio)),
    pixelsH: Math.max(1, Math.floor(h * pxRatio))
  };
}

/** Perfil leve: telas de toque ou estreitas (CTI §9.1 "modo leve automático"). */
export function perfilLeve(janela) {
  const toque = janela.matchMedia ? janela.matchMedia('(pointer: coarse)').matches : false;
  return toque || janela.innerWidth <= 768;
}
