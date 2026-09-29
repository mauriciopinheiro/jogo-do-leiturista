/**
 * @file chao.js
 * @description Calçada (onde o leiturista corre), meio-fio e pista. Tiles que rolam na mesma
 * velocidade do mundo. Origem vertical da calçada = topo (chaoY - ALTURA_CALCADA_ACIMA).
 */
import { criarTelaDeUnidades, degradeVertical, misturarCor } from '../primitivas.js';
import { criarPrng } from '../../nucleo/prng.js';

export const LARGURA_CALCADA = 120;
export const ALTURA_CALCADA = 28;
export const ALTURA_CALCADA_ACIMA = 14;
export const LARGURA_PISTA = 160;
export const ALTURA_MEIOFIO = 10;

export function criarCalcada(tema, k) {
  const { tela, ctx } = criarTelaDeUnidades(LARGURA_CALCADA, ALTURA_CALCADA, k);
  const { topo, corpo, junta } = tema.calcada;
  ctx.fillStyle = degradeVertical(ctx, 0, ALTURA_CALCADA, [[0, topo], [1, corpo]]);
  ctx.fillRect(0, 0, LARGURA_CALCADA, ALTURA_CALCADA);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(0, 0, LARGURA_CALCADA, 2);
  ctx.fillStyle = junta;
  ctx.fillRect(0, ALTURA_CALCADA / 2 - 0.7, LARGURA_CALCADA, 1.4);
  ctx.fillRect(0, 0, 1.6, ALTURA_CALCADA / 2);
  ctx.fillRect(LARGURA_CALCADA / 2, ALTURA_CALCADA / 2, 1.6, ALTURA_CALCADA / 2);
  const sorteio = criarPrng(5);
  ctx.fillStyle = 'rgba(0,0,0,0.05)';
  for (let i = 0; i < 14; i++) ctx.fillRect(sorteio() * LARGURA_CALCADA, sorteio() * ALTURA_CALCADA, 3, 2);
  return tela;
}

/** Meio-fio + asfalto com faixa central tracejada, do meio-fio até o pé da tela. */
export function criarPista(tema, k, altura) {
  const { tela, ctx } = criarTelaDeUnidades(LARGURA_PISTA, altura, k);
  ctx.fillStyle = tema.meioFio;
  ctx.fillRect(0, 0, LARGURA_PISTA, ALTURA_MEIOFIO);
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.fillRect(0, 0, LARGURA_PISTA, 2);
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.fillRect(0, ALTURA_MEIOFIO - 3, LARGURA_PISTA, 3);
  const resto = altura - ALTURA_MEIOFIO;
  ctx.fillStyle = degradeVertical(ctx, ALTURA_MEIOFIO, altura, [[0, tema.asfalto[0]], [1, tema.asfalto[1]]]);
  ctx.fillRect(0, ALTURA_MEIOFIO, LARGURA_PISTA, resto);
  const sorteio = criarPrng(9);
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = `rgba(255,255,255,${(0.02 + sorteio() * 0.04).toFixed(3)})`;
    ctx.fillRect(sorteio() * LARGURA_PISTA, ALTURA_MEIOFIO + sorteio() * resto, 2 + sorteio() * 4, 1.5);
  }
  const yFaixa = Math.min(ALTURA_MEIOFIO + 34, altura - 8);
  ctx.fillStyle = tema.faixa;
  ctx.fillRect(10, yFaixa, 70, 4);
  ctx.fillRect(10, yFaixa + 8, 70, 4);
  ctx.fillStyle = misturarCor(tema.faixa, '#000000', 0.5);
  ctx.fillRect(10, yFaixa + 4, 70, 1);
  return tela;
}
