/**
 * Piloto de teste: decide quando pressionar e soltar. É independente de onde roda (Node ou a
 * página real): recebe as ações por parâmetro. "perfeito" executa o plano do planejador; "humano"
 * erra o tempo do toque e do soltar e às vezes deixa de pular; "parado" nunca age.
 */
import { planejar, SEGURAR } from './planejador.js';

const DT = 1 / 60;

export const PERFIS = {
  perfeito: { ruidoInicio: 0, ruidoSoltar: 0, esquece: 0 },
  humano: { ruidoInicio: 4, ruidoSoltar: 2, esquece: 0.03 },
  parado: null
};

function criarSorteio(semente) {
  let s = (semente || 1) % 2147483647;
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

/** Agenda os pulos do plano como comandos de pressionar/soltar por amostra (1/60 s). */
function agendar(plano, perfil, sorteio) {
  const comandos = [];
  for (const salto of plano) {
    if (sorteio() < perfil.esquece) continue;
    const ruido = (limite) => Math.round((sorteio() * 2 - 1) * limite);
    const inicio = Math.max(0, salto.inicio + ruido(perfil.ruidoInicio));
    const soltarEm = inicio + Math.max(1, Math.round(SEGURAR[salto.h] / DT) + ruido(perfil.ruidoSoltar));
    comandos.push({ quando: inicio, acao: 'p' }, { quando: soltarEm, acao: 's' });
  }
  return comandos;
}

/**
 * @param {{perfil:string, semente:number}} opcoes
 * @returns {{quadro:(sim:object, acoes:{pressionar:()=>void, soltar:()=>void})=>void}}
 */
export function criarPiloto({ perfil, semente }) {
  const config = PERFIS[perfil];
  const sorteio = criarSorteio(semente);
  let comandos = [];
  let relogio = 0;
  return {
    /** Chamar uma vez por quadro de 1/60 s, ANTES de avançar a simulação. */
    quadro(sim, acoes) {
      if (!config || sim.estagio !== 'corrida') return;
      if (comandos.length === 0 && sim.jogador.noChao && sim.obstaculos.length + sim.medidores.length > 0) {
        comandos = agendar(planejar(sim), config, sorteio);
        relogio = 0;
      }
      for (const c of comandos) {
        if (c.quando !== relogio) continue;
        if (c.acao === 'p') acoes.pressionar(); else acoes.soltar();
      }
      relogio++;
      if (comandos.length && relogio > Math.max(...comandos.map((cmd) => cmd.quando)) + 2) comandos = [];
    }
  };
}
