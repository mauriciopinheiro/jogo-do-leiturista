/**
 * @file leitura.js
 * @description Ampliação visual dos elementos que o jogador precisa LER em movimento (números dos
 * hidrômetros e placas de rua). Em telas pequenas (celular em pé: ~0,7 pixel CSS por unidade) o texto de 9
 * unidades ficava com 6 pixels; aqui ele cresce até o tamanho mínimo legível, sem mudar a jogabilidade
 * (as áreas de colisão continuam as mesmas).
 * O tamanho que importa é o físico (pixels CSS): num celular 3x o canvas tem mais pixels, mas o texto
 * continua pequeno para os olhos, então a medida é `k / razão de pixels`.
 */

/** Alvo: 1,15 pixel CSS por unidade; abaixo disso amplia, até `maximo`. */
const PIXELS_POR_UNIDADE_ALVO = 1.15;

let razaoDePixels = 1;

/** @param {number} razao pixels do canvas por pixel CSS (layout.pxRatio) */
export function definirRazaoDePixels(razao) {
  razaoDePixels = razao > 0 ? razao : 1;
}

/** @param {number} k pixels do canvas por unidade @returns {number} fator >= 1 */
export function escalaDeLeitura(k, maximo = 1.6) {
  if (!(k > 0)) return 1;
  return Math.min(maximo, Math.max(1, PIXELS_POR_UNIDADE_ALVO / (k / razaoDePixels)));
}
