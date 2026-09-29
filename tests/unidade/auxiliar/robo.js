/**
 * Robô de teste: joga a simulação sem DOM usando o piloto.
 */
import { criarSimulacao, iniciarPartida } from '../../../src/js/simulacao/criar.js';
import { passo } from '../../../src/js/simulacao/passo.js';
import { pressionar, soltar } from '../../../src/js/simulacao/fisica-jogador.js';
import { pularAbertura } from '../../../src/js/simulacao/kombi.js';
import { criarPiloto } from './piloto.js';

export const MUNDO_PADRAO = { L: 720, chaoY: 420, jogadorX: 200 };
const DT = 1 / 60;

/**
 * @param {{faseIdx:number, semente:number, perfil?:string, infinito?:boolean,
 *   limiteSegundos?:number, sim?:object, aoQuadro?:(sim:object)=>void}} opcoes
 */
export function jogar({ faseIdx, semente, perfil = 'humano', infinito = false, limiteSegundos = 420, sim: existente, aoQuadro }) {
  const sim = existente || criarSimulacao({ mundo: MUNDO_PADRAO });
  if (!existente) iniciarPartida(sim, { faseIdx, semente, infinito });
  pularAbertura(sim);
  const piloto = criarPiloto({ perfil, semente });
  const acoes = { pressionar: () => pressionar(sim), soltar: () => soltar(sim) };
  const eventos = [];
  for (let t = 0; t < limiteSegundos && sim.estagio !== 'concluida' && sim.estagio !== 'fim'; t += DT) {
    piloto.quadro(sim, acoes);
    passo(sim, DT);
    if (aoQuadro) aoQuadro(sim);
    if (sim.eventos.length) { eventos.push(...sim.eventos); sim.eventos.length = 0; }
  }
  return { sim, eventos };
}
