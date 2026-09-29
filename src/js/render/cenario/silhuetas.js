/**
 * @file silhuetas.js
 * @description Camadas distantes que rolam devagar: morros + prédios + caixa d'água (longe) e
 * quadras de prédios com janelas (médio). `ev` estica na vertical em telas altas (retrato).
 */
import { criarTelaDeUnidades, arredondado, circulo, misturarCor, caminhoArredondado } from '../primitivas.js';
import { criarPrng } from '../../nucleo/prng.js';

export const LARGURA_LONGE = 1400;
export const LARGURA_MEDIO = 1000;

function morros(ctx, cor, base, amplitude, largura) {
  ctx.beginPath();
  ctx.moveTo(0, base);
  for (let x = 0; x <= largura; x += 20) {
    const y = base - amplitude * (0.5 + 0.28 * Math.sin(x * 0.006 + 1) + 0.22 * Math.sin(x * 0.0137 + 2));
    ctx.lineTo(x, y);
  }
  ctx.lineTo(largura, base);
  ctx.closePath();
  ctx.fillStyle = cor;
  ctx.fill();
}

/** Caixa d'água elevada, marca da paisagem do saneamento. */
function caixaDagua(ctx, x, base, cor, faixa) {
  ctx.fillStyle = cor;
  ctx.fillRect(x - 3, base - 130, 6, 130);
  ctx.fillRect(x - 22, base - 130, 4, 130);
  ctx.fillRect(x + 18, base - 130, 4, 130);
  arredondado(ctx, x - 32, base - 178, 64, 52, 14, cor);
  ctx.fillStyle = faixa;
  ctx.fillRect(x - 32, base - 158, 64, 8);
  caminhoArredondado(ctx, x - 12, base - 190, 24, 14, 6);
  ctx.fillStyle = cor;
  ctx.fill();
}

export function criarLonge(tema, k, ev) {
  const altura = 330 * ev;
  const { tela, ctx } = criarTelaDeUnidades(LARGURA_LONGE, altura, k);
  const sorteio = criarPrng(31);
  const base = altura;
  morros(ctx, misturarCor(tema.longe, tema.ceu[2], 0.35), base, 150 * ev, LARGURA_LONGE);
  const cor = misturarCor(tema.longe, tema.ceu[2], 0.15);
  for (let x = 30; x < LARGURA_LONGE - 60; x += 60 + sorteio() * 60) {
    const w = 34 + sorteio() * 40;
    const h = (60 + sorteio() * 130) * ev;
    ctx.fillStyle = cor;
    ctx.fillRect(x, base - h, w, h);
    if (sorteio() > 0.6) ctx.fillRect(x + w * 0.25, base - h - 14, w * 0.5, 14);
  }
  caixaDagua(ctx, LARGURA_LONGE * 0.62, base, misturarCor(tema.longe, tema.ceu[1], 0.25), 'rgba(19,81,180,0.55)');
  return tela;
}

export function criarMedio(tema, k, ev) {
  const altura = 250 * ev;
  const { tela, ctx } = criarTelaDeUnidades(LARGURA_MEDIO, altura, k);
  const sorteio = criarPrng(57);
  const cor = tema.medio;
  const janela = tema.janelasAcesas ? 'rgba(255,214,120,0.85)' : misturarCor(tema.medio, '#ffffff', 0.28);
  let x = -10;
  while (x < LARGURA_MEDIO) {
    const w = 70 + sorteio() * 70;
    const h = (70 + sorteio() * 110) * ev;
    ctx.fillStyle = cor;
    ctx.fillRect(x, altura - h, w, h);
    ctx.fillStyle = misturarCor(cor, '#000000', 0.16);
    ctx.fillRect(x, altura - h, w, 5);
    for (let jy = altura - h + 14; jy < altura - 20; jy += 20) {
      for (let jx = x + 9; jx < x + w - 14; jx += 18) {
        const acesa = tema.janelasAcesas ? sorteio() > 0.45 : sorteio() > 0.2;
        ctx.fillStyle = acesa ? janela : misturarCor(cor, '#000000', 0.22);
        ctx.fillRect(jx, jy, 8, 11);
      }
    }
    x += w + 6 + sorteio() * 14;
  }
  for (let bx = 40; bx < LARGURA_MEDIO; bx += 150) circulo(ctx, bx + sorteio() * 60, altura - 8, 22 + sorteio() * 10, misturarCor(cor, '#1a6b3a', 0.55));
  return tela;
}
