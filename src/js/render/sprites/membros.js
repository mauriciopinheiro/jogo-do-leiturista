/**
 * @file membros.js
 * @description Cinemática simples de pernas e braços em duas partes (coxa/canela, braço/antebraço).
 * Ângulos em radianos, 0 = para baixo, positivo = para a frente (direita do desenho).
 */

/** Posição da ponta de um segmento partindo de (x, y) com ângulo `a` e comprimento `c`. */
export function ponta(x, y, a, c) {
  return { x: x + Math.sin(a) * c, y: y + Math.cos(a) * c };
}

/**
 * Perna de corrida: a coxa balança e o joelho dobra na fase de recuperação.
 * @param {number} fase fase do ciclo em radianos (metade do ciclo = uma passada)
 */
export function pernaDeCorrida(quadril, fase, amplitude = 0.72, segmento = 10) {
  const coxa = Math.sin(fase) * amplitude;
  const dobra = Math.max(0, -Math.cos(fase)) * 0.95;
  const joelho = ponta(quadril.x, quadril.y, coxa, segmento);
  const canela = coxa - dobra;
  return { joelho, pe: ponta(joelho.x, joelho.y, canela, segmento) };
}

/** Perna no ar: encolhida na subida, esticada na descida. */
export function pernaNoAr(quadril, vy, frente) {
  const subindo = vy > 240;
  const coxa = frente ? (subindo ? 0.9 : 0.35) : (subindo ? -0.55 : -0.25);
  const dobra = frente ? (subindo ? 1.0 : 0.25) : (subindo ? 1.3 : 0.5);
  const joelho = ponta(quadril.x, quadril.y, coxa, 10);
  return { joelho, pe: ponta(joelho.x, joelho.y, coxa - dobra, 10) };
}

/** Perna dobrada (ajoelhado). */
export function pernaAjoelhada(quadril, frente) {
  const joelho = { x: quadril.x + (frente ? 11 : 4), y: quadril.y + 9 };
  return { joelho, pe: { x: quadril.x + (frente ? 4 : -6), y: quadril.y + 20 } };
}

/** Braço com cotovelo dobrado. `dobra` positivo dobra para a frente. */
export function braco(ombro, angulo, dobra, comprimento = 10) {
  const cotovelo = ponta(ombro.x, ombro.y, angulo, comprimento);
  return { cotovelo, mao: ponta(cotovelo.x, cotovelo.y, angulo + dobra, comprimento - 1) };
}
