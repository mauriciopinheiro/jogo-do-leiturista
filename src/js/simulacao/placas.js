/**
 * @file placas.js
 * @description Placas com o nome da rua. Ruas curtas terminam quase juntas e suas placas se
 * sobrepunham e ficavam ilegíveis; aqui nenhuma placa cobre outra: numa disputa vale a rua com mais
 * hidrômetros (a mais importante da rota).
 */
import { PLACA } from '../config/constantes.js';

/** Distância mínima entre duas placas (largura + folga: cobre também a ampliação em telas pequenas). */
const AFASTAMENTO = PLACA.largura + PLACA.folga;
/** Uma placa só "já foi vista" depois de entrar este tanto na tela; antes disso trocá-la ninguém percebe. */
const ENTRADA_MINIMA = 80;

/**
 * Coloca `nova` ({ nome, x, total }) na lista sem cobrir outra placa (nem ser coberta).
 * - Sem conflito: entra.
 * - Com conflito: entra só se a rua tiver MAIS hidrômetros que todas as que conflitam (empate fica com a mais
 *   antiga). As menos importantes que ainda não foram vistas saem; as já visíveis ficam e a nova vai para
 *   depois delas.
 * @returns {boolean} true se a placa foi colocada
 */
export function adicionarPlaca(placas, nova, larguraMundo) {
  const jaVista = (p) => p.x < larguraMundo - ENTRADA_MINIMA;
  for (let volta = 0; volta < 12; volta++) {
    const conflitos = placas.filter((p) => Math.abs(p.x - nova.x) < AFASTAMENTO);
    if (conflitos.length === 0) {
      placas.push(nova);
      return true;
    }
    if (nova.total <= Math.max(...conflitos.map((p) => p.total))) return false;
    for (const p of conflitos) {
      if (!jaVista(p)) placas.splice(placas.indexOf(p), 1);
    }
    const vistas = conflitos.filter(jaVista);
    if (vistas.length > 0) nova.x = Math.max(nova.x, ...vistas.map((p) => p.x + AFASTAMENTO));
  }
  return false;
}
