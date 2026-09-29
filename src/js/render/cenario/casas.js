/**
 * @file casas.js
 * @description Faixa de casas, comércio, árvores e postes atrás da calçada (tile de 1200 u).
 * Cada casa tem uma caixa de hidrômetro na frente, como nas ruas reais das rotas.
 */
import { criarTelaDeUnidades, arredondado, circulo, poligono, misturarCor } from '../primitivas.js';
import { criarPrng } from '../../nucleo/prng.js';

export const LARGURA_CASAS = 1200;
export const ALTURA_CASAS = 240;
const LARGURA_CASA = 200;
const BASE = ALTURA_CASAS;

function janela(ctx, x, y, w, h, tema, sorteio) {
  const acesa = tema.janelasAcesas && sorteio() > 0.4;
  ctx.fillStyle = '#2b3a4a';
  ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, acesa ? '#ffe9a8' : '#a5dcf5');
  g.addColorStop(1, acesa ? '#ffc65c' : '#5aa9d6');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(x + 2, y + 2, w * 0.35, h - 4);
  ctx.fillStyle = '#2b3a4a';
  ctx.fillRect(x + w / 2 - 0.8, y, 1.6, h);
}

function porta(ctx, x, cor) {
  arredondado(ctx, x, BASE - 78, 30, 64, 3, cor);
  circulo(ctx, x + 24, BASE - 46, 2, '#f5c542');
}

function cavalete(ctx, x) {
  arredondado(ctx, x, BASE - 34, 16, 20, 3, '#1351B4');
  circulo(ctx, x + 8, BASE - 26, 5, '#f2fbff');
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x + 8, BASE - 26);
  ctx.lineTo(x + 11, BASE - 29);
  ctx.stroke();
}

function muroEPortao(ctx, x, w, tema) {
  ctx.fillStyle = misturarCor(tema.calcada.corpo, '#000000', 0.12);
  ctx.fillRect(x - 4, BASE - 30, w + 8, 30);
  ctx.fillStyle = misturarCor(tema.calcada.corpo, '#000000', 0.28);
  ctx.fillRect(x - 4, BASE - 30, w + 8, 4);
  ctx.fillStyle = '#334155';
  ctx.fillRect(x + w * 0.62, BASE - 44, 34, 44);
  for (let g = 0; g < 6; g++) ctx.fillRect(x + w * 0.62 + 3 + g * 6, BASE - 50, 1.6, 50);
}

function casaTerrea(ctx, x, w, paleta, tema, sorteio) {
  const y = BASE - 130;
  ctx.fillStyle = paleta.parede;
  ctx.fillRect(x, y, w, 130);
  poligono(ctx, [[x - 12, y + 2], [x + w / 2, y - 48], [x + w + 12, y + 2]], paleta.telhado);
  ctx.fillStyle = misturarCor(paleta.telhado, '#000000', 0.22);
  ctx.fillRect(x - 12, y, w + 24, 6);
  janela(ctx, x + 18, y + 34, 34, 34, tema, sorteio);
  janela(ctx, x + 64, y + 34, 34, 34, tema, sorteio);
  porta(ctx, x + w - 62, paleta.porta);
}

function sobrado(ctx, x, w, paleta, tema, sorteio) {
  const y = BASE - 170;
  ctx.fillStyle = paleta.parede;
  ctx.fillRect(x, y, w, 170);
  ctx.fillStyle = paleta.telhado;
  ctx.fillRect(x - 8, y - 12, w + 16, 14);
  ctx.fillStyle = paleta.detalhe;
  ctx.fillRect(x, y + 78, w, 8);
  janela(ctx, x + 16, y + 22, 34, 40, tema, sorteio);
  janela(ctx, x + 64, y + 22, 34, 40, tema, sorteio);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(x + w - 90, y + 88, 74, 4);
  janela(ctx, x + 14, y + 104, 32, 30, tema, sorteio);
  porta(ctx, x + w - 62, paleta.porta);
}

function comercio(ctx, x, w, paleta, tema, sorteio) {
  const y = BASE - 140;
  ctx.fillStyle = paleta.parede;
  ctx.fillRect(x, y, w, 140);
  ctx.fillStyle = paleta.telhado;
  ctx.fillRect(x - 6, y - 10, w + 12, 12);
  const listra = (w + 10) / 8;
  for (let s = 0; s < 8; s++) {
    ctx.fillStyle = s % 2 === 0 ? paleta.detalhe : '#ffffff';
    ctx.fillRect(x - 5 + s * listra, y + 36, listra, 22);
  }
  arredondado(ctx, x + 14, y + 66, w - 76, 52, 4, 'rgba(120,200,235,0.85)');
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillRect(x + 22, y + 70, 12, 44);
  porta(ctx, x + w - 52, paleta.porta);
  arredondado(ctx, x + 30, y + 8, w - 100, 20, 4, '#ffffff');
  ctx.fillStyle = paleta.detalhe;
  ctx.fillRect(x + 40, y + 16, w - 120, 4);
  janela(ctx, x + w - 48, y + 14, 26, 14, tema, sorteio);
}

function garagem(ctx, x, w, paleta, tema, sorteio) {
  const y = BASE - 120;
  ctx.fillStyle = paleta.parede;
  ctx.fillRect(x, y, w, 120);
  poligono(ctx, [[x - 10, y + 2], [x + w + 10, y - 26], [x + w + 10, y + 2]], paleta.telhado);
  arredondado(ctx, x + 12, y + 38, 86, 78, 3, misturarCor(paleta.detalhe, '#000000', 0.15));
  for (let g = 0; g < 7; g++) { ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(x + 12, y + 46 + g * 10, 86, 1.6); }
  janela(ctx, x + 112, y + 30, 32, 32, tema, sorteio);
  porta(ctx, x + w - 44, paleta.porta);
}

const ESTILOS = [casaTerrea, sobrado, comercio, garagem];

function arvore(ctx, x, tema) {
  const { copa, copa2, tronco } = tema.arvore;
  ctx.fillStyle = tronco;
  ctx.fillRect(x - 4, BASE - 74, 8, 70);
  circulo(ctx, x - 18, BASE - 92, 22, copa2);
  circulo(ctx, x + 16, BASE - 88, 24, copa2);
  circulo(ctx, x, BASE - 108, 30, copa);
  circulo(ctx, x - 8, BASE - 116, 16, misturarCor(copa, '#ffffff', 0.18));
}

function poste(ctx, x, tema) {
  ctx.fillStyle = '#3a4656';
  ctx.fillRect(x - 2.5, BASE - 150, 5, 150);
  ctx.fillRect(x - 2.5, BASE - 152, 26, 4);
  arredondado(ctx, x + 14, BASE - 152, 18, 7, 3, '#4b5768');
  if (tema.luzPoste) {
    const g = ctx.createRadialGradient(x + 23, BASE - 146, 2, x + 23, BASE - 146, 46);
    g.addColorStop(0, 'rgba(255,225,140,0.75)');
    g.addColorStop(1, 'rgba(255,225,140,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - 30, BASE - 196, 106, 96);
  }
}

export function criarCasas(tema, k) {
  const { tela, ctx } = criarTelaDeUnidades(LARGURA_CASAS, ALTURA_CASAS, k);
  const sorteio = criarPrng(211);
  const quantidade = LARGURA_CASAS / LARGURA_CASA;
  for (let i = 0; i < quantidade; i++) {
    const x = i * LARGURA_CASA + 14;
    const largura = LARGURA_CASA - 28;
    const paleta = tema.casas[i % tema.casas.length];
    ESTILOS[(i + Math.floor(sorteio() * 3)) % ESTILOS.length](ctx, x, largura, paleta, tema, sorteio);
    muroEPortao(ctx, x, largura, tema);
    cavalete(ctx, x + 14 + sorteio() * 18);
  }
  for (let i = 0; i < quantidade; i += 2) arvore(ctx, i * LARGURA_CASA + LARGURA_CASA + 2, tema);
  for (let i = 1; i < quantidade; i += 3) poste(ctx, i * LARGURA_CASA - 6, tema);
  return tela;
}
