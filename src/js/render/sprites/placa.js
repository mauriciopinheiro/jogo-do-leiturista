/**
 * @file placa.js
 * @description Placa azul com o nome da rua. O nome usa o maior tamanho de letra que cabe (em uma ou duas
 * linhas) em vez de espremer o texto, e a placa nasce ampliada em telas pequenas (`escalaDeLeitura`), então
 * o nome é legível em movimento. É guardada em cache por nome e copiada 1:1 em pixels inteiros.
 */
import { PLACA } from '../../config/constantes.js';
import { arredondado, circulo, poligono } from '../primitivas.js';
import { escalaDeLeitura } from '../leitura.js';
import { obterSprite, pintarSprite } from './cache.js';

const ALTURA_PLACA = 52;
const ALTURA_POSTE = 12;
/** Origem = pé do poste, no centro; a placa ocupa de -largura/2 a +largura/2. */
const CAIXA = { w: PLACA.largura + 8, h: ALTURA_PLACA + ALTURA_POSTE + 8, ox: PLACA.largura / 2 + 4, oy: ALTURA_PLACA + ALTURA_POSTE + 4 };
const FONTE = (px) => `900 ${px}px Bahnschrift, 'Trebuchet MS', system-ui, sans-serif`;
const TAMANHOS = [18, 17, 16, 15, 14];
const LARGURA_TEXTO = PLACA.largura - 58;

/** Divide o nome em duas linhas no espaço mais próximo do meio (ou devolve uma linha só). */
export function dividirNome(nome) {
  const palavras = nome.split(' ');
  if (palavras.length < 2) return [nome];
  let melhor = 1;
  let menorDiferenca = Infinity;
  for (let i = 1; i < palavras.length; i++) {
    const diferenca = Math.abs(palavras.slice(0, i).join(' ').length - palavras.slice(i).join(' ').length);
    if (diferenca < menorDiferenca) { menorDiferenca = diferenca; melhor = i; }
  }
  return [palavras.slice(0, melhor).join(' '), palavras.slice(melhor).join(' ')];
}

/** Maior tamanho de letra em que todas as linhas cabem na largura do texto. */
function escolherLetra(ctx, linhas) {
  for (const px of TAMANHOS) {
    ctx.font = FONTE(px);
    if (linhas.every((l) => ctx.measureText(l).width <= LARGURA_TEXTO)) return px;
  }
  return TAMANHOS.at(-1);
}

function desenharPlacaBase(c, nome) {
  const topo = -(ALTURA_PLACA + ALTURA_POSTE);
  const esquerda = -PLACA.largura / 2;
  c.fillStyle = '#4b5563';
  c.fillRect(-3, topo + ALTURA_PLACA - 1, 6, ALTURA_POSTE + 1);
  arredondado(c, esquerda, topo, PLACA.largura, ALTURA_PLACA, 9, '#f8fafc');
  arredondado(c, esquerda + 3, topo + 3, PLACA.largura - 6, ALTURA_PLACA - 6, 7, '#0C326F');
  c.fillStyle = '#FFCD07';
  c.fillRect(esquerda + 3, topo + ALTURA_PLACA - 11, PLACA.largura - 6, 4);
  circulo(c, esquerda + 20, topo + 22, 7.5, '#5FDCF2');
  poligono(c, [[esquerda + 20, topo + 10], [esquerda + 26, topo + 19], [esquerda + 14, topo + 19]], '#5FDCF2');
  const texto = nome.toUpperCase();
  let linhas = [texto];
  c.font = FONTE(TAMANHOS[2]);
  if (c.measureText(texto).width > LARGURA_TEXTO) linhas = dividirNome(texto);
  const px = escolherLetra(c, linhas);
  c.font = FONTE(px);
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillStyle = '#ffffff';
  const centroX = esquerda + 40 + LARGURA_TEXTO / 2;
  const centroY = topo + (ALTURA_PLACA - 11) / 2 + 1;
  const passo = px + 1;
  linhas.forEach((linha, i) => c.fillText(linha, centroX, centroY + (i - (linhas.length - 1) / 2) * passo));
}

/** @param {number} y topo da placa em unidades (o pé do poste fica ALTURA_PLACA + ALTURA_POSTE abaixo) */
export function desenharPlaca(ctx, placa, y, k) {
  const z = escalaDeLeitura(k, 1.35);
  const sprite = obterSprite(`placa-${placa.nome}`, k, CAIXA, (c) => desenharPlacaBase(c, placa.nome), 0, z);
  pintarSprite(ctx, sprite, placa.x + PLACA.largura / 2, y + ALTURA_PLACA + ALTURA_POSTE);
}
