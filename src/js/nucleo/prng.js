/**
 * @file prng.js
 * @description Gerador pseudoaleatório determinístico (mulberry32). Cada partida usa uma
 * semente, o que torna a simulação reproduzível em testes e na retomada de partida.
 */

/**
 * @param {number} semente inteiro qualquer; 0 vira uma semente padrão
 * @returns {() => number} função que devolve números em [0, 1)
 */
export function criarPrng(semente) {
  let s = (semente >>> 0) || 12345;
  return function proximo() {
    let t = (s += 0x6d2b79f5) | 0;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Gerador LCG usado somente para montar a lista de medidores de uma fase (estável por fase). */
export function criarLcg(semente) {
  let s = semente;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}
