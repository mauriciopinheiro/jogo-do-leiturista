/**
 * Piloto para rodar DENTRO da página real (acelerado): usa o mesmo controlador que o toque
 * usa, mas avança o tempo em passos de 1/60 s sem esperar o relógio. Empacotado pelo runner.
 */
import { criarPiloto } from '../../unidade/auxiliar/piloto.js';

function jogar({ perfil = 'perfeito', semente = 1, limite = 420, ate = null } = {}) {
  const { controlador, sim } = window.__leiturista;
  const piloto = criarPiloto({ perfil, semente });
  const acoes = { pressionar: () => controlador.pressionar(), soltar: () => controlador.soltar() };
  let t = 0;
  for (; t < limite; t += 1 / 60) {
    if (controlador.tela !== 'jogo' || (ate && ate(sim))) break;
    if (sim.estagio === 'abertura') controlador.pressionar();
    piloto.quadro(sim, acoes);
    controlador.atualizar(1 / 60);
  }
  return { tela: controlador.tela, estagio: sim.estagio, segundos: Math.round(t) };
}

/** Avança a cena final (ou qualquer animação do controlador) por `segundos`. */
function avancar(segundos) {
  const { controlador } = window.__leiturista;
  for (let t = 0; t < segundos; t += 1 / 60) controlador.atualizar(1 / 60);
  controlador.desenhar();
}

window.__robo = { jogar, avancar };
