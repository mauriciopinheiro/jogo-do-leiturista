/**
 * @file ceu.js
 * @description Céu de uma fase: degradê, brilho do horizonte, astro e estrelas. Pré-renderizado
 * uma vez por fase e por tamanho de tela.
 */
import { criarTelaDeUnidades, circulo, degradeVertical } from '../primitivas.js';
import { criarPrng } from '../../nucleo/prng.js';

/**
 * @param {object} tema
 * @param {number} L largura do mundo
 * @param {number} altura altura do céu (do topo até um pouco abaixo do horizonte)
 * @param {number} k pixels por unidade
 */
export function criarCeu(tema, L, altura, k) {
  const topoDasCasas = altura - 60 - 250;
  const { tela, ctx } = criarTelaDeUnidades(L, altura, k);
  const [topo, meio, horizonte, brilho] = tema.ceu;
  ctx.fillStyle = degradeVertical(ctx, 0, altura, [[0, topo], [0.5, meio], [0.86, horizonte], [1, brilho]]);
  ctx.fillRect(0, 0, L, altura);

  if (tema.estrelas > 0) {
    const sorteio = criarPrng(97);
    for (let i = 0; i < tema.estrelas; i++) {
      const brilhoEstrela = 0.25 + sorteio() * 0.6;
      circulo(ctx, sorteio() * L, sorteio() * altura * 0.55, 0.6 + sorteio() * 1.3, `rgba(255,255,255,${brilhoEstrela.toFixed(2)})`);
    }
  }

  const { astro } = tema;
  const ax = L * astro.x;
  const ay = Math.max(78, Math.min(altura * astro.y * 0.8, topoDasCasas + 40));
  const halo = ctx.createRadialGradient(ax, ay, astro.raio * 0.4, ax, ay, astro.raio * 4.2);
  halo.addColorStop(0, astro.halo);
  halo.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(ax - astro.raio * 4.2, ay - astro.raio * 4.2, astro.raio * 8.4, astro.raio * 8.4);
  circulo(ctx, ax, ay, astro.raio, astro.cor);
  return tela;
}

/** Separa 'rgba(r,g,b,a)' em cor opaca e alfa, para desenhar a nuvem inteira de uma vez. */
function separarAlfa(cor) {
  const m = /rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/.exec(cor);
  return m ? { solida: `rgb(${m[1]},${m[2]},${m[3]})`, alfa: parseFloat(m[4]) } : { solida: cor, alfa: 1 };
}

/** Nuvem macia: círculos opacos sobrepostos; a transparência vem do `alfa` guardado na tela. */
export function criarNuvem(tema, largura, k) {
  const altura = largura * 0.42;
  const { solida, alfa } = separarAlfa(tema.nuvem);
  const { tela, ctx } = criarTelaDeUnidades(largura, altura, k);
  const partes = [[0.22, 0.62, 0.2], [0.42, 0.44, 0.26], [0.64, 0.5, 0.22], [0.8, 0.66, 0.16], [0.5, 0.7, 0.24]];
  for (const [px, py, r] of partes) circulo(ctx, largura * px, altura * py, largura * r * 0.55, solida);
  tela.alfa = alfa;
  return tela;
}
