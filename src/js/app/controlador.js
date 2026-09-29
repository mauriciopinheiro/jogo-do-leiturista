/**
 * @file controlador.js
 * @description Fluxo do jogo: menu -> corrida -> pausa/resultado -> cena final. É o único
 * módulo (com fluxo-resultado.js) que conhece ao mesmo tempo simulação, interface, áudio,
 * progresso e Hub.
 */
import { iniciarPartida } from '../simulacao/criar.js';
import { passo } from '../simulacao/passo.js';
import { pressionar, soltar } from '../simulacao/fisica-jogador.js';
import { pularAbertura } from '../simulacao/kombi.js';
import { fotografarPartida, restaurarPartida } from '../simulacao/retomada.js';
import { criarDistribuidor } from './eventos.js';
import { criarFluxoDeResultado } from './fluxo-resultado.js';

const ESTAGIOS_PAUSAVEIS = new Set(['abertura', 'corrida', 'encerramento']);
const novaSemente = () => (Date.now() ^ Math.floor(Math.random() * 0x7fffffff)) >>> 0;

export function criarControlador(d) {
  const { el, sim, gestor, audio, musica, hud, menu, telas, mensagens, renderizador, cena, laco } = d;
  const estado = { tela: 'menu' };
  const progresso = () => gestor.progresso;
  const melhorDaRota = (faseIdx, infinito) => (infinito ? progresso().melhorInfinito : progresso().melhorPorFase[faseIdx] || 0);

  function atualizarMenu() {
    menu.atualizar(progresso(), Boolean(progresso().partidaEmAndamento));
    audio.sincronizar();
  }

  function entrarNoJogo() {
    estado.tela = 'jogo';
    telas.mostrar(null);
    hud.mostrar(sim);
    el.dica.textContent = d.textoDica;
    el.dica.hidden = false;
    el.dica.classList.remove('escondida');
    musica.reiniciar();
    laco.zerarRelogio();
    laco.acordar();
  }

  function iniciar(faseIdx, infinito = false) {
    audio.garantir();
    gestor.limparPartidaSalva();
    iniciarPartida(sim, { faseIdx, infinito, semente: novaSemente(), melhorAnterior: melhorDaRota(faseIdx, infinito) });
    entrarNoJogo();
  }

  function continuar() {
    const p = progresso().partidaEmAndamento;
    if (!p) return;
    audio.garantir();
    restaurarPartida(sim, p, melhorDaRota(p.faseIdx, Boolean(p.isEndless)));
    gestor.limparPartidaSalva();
    entrarNoJogo();
    mensagens.faixa('PARTIDA RETOMADA', `Rota ${sim.faseIdx + 1}: ${sim.rotas[sim.faseIdx].bairro}`, 'normal', 2.2);
  }

  function pausar() {
    if (estado.tela !== 'jogo' || !ESTAGIOS_PAUSAVEIS.has(sim.estagio)) return;
    sim.pausado = true;
    estado.tela = 'pausa';
    telas.mostrar('pausa');
    audio.suspender();
    gestor.salvarAgora();
  }

  function retomar() {
    if (estado.tela !== 'pausa') return;
    sim.pausado = false;
    estado.tela = 'jogo';
    telas.mostrar(null);
    audio.retomar();
    laco.zerarRelogio();
    laco.acordar();
  }

  function sairParaMenu() {
    if (sim.estagio === 'corrida') gestor.progresso.partidaEmAndamento = fotografarPartida(sim);
    sim.estagio = 'inativo';
    sim.pausado = false;
    hud.esconder();
    mensagens.limparFaixa();
    el.dica.hidden = true;
    gestor.salvarAgora();
    estado.tela = 'menu';
    atualizarMenu();
    telas.mostrar('menu');
    audio.retomar();
    laco.acordar();
  }

  const fluxo = criarFluxoDeResultado({ ...d, estado, iniciar, atualizarMenu, sairParaMenu });
  const esvaziarEventos = criarDistribuidor({
    sim, audio, renderizador, mensagens, gestor, aoVitoria: fluxo.aoVitoria, aoDerrota: fluxo.aoDerrota,
    aoPulos: () => el.dica.classList.add('escondida')
  });

  return {
    iniciar, continuar, pausar, retomar, sairParaMenu, atualizarMenu,
    iniciarFinal: fluxo.iniciarFinal,
    aoTerminarFinal: fluxo.aoTerminarFinal,
    executarPrimario: fluxo.executarPrimario,
    executarSecundario: fluxo.executarSecundario,
    get tela() { return estado.tela; },
    reiniciar: () => iniciar(sim.infinito ? 4 : sim.faseIdx, sim.infinito),
    alternar(campo) {
      gestor.alternarOpcao(campo);
      audio.garantir();
      audio.sincronizar();
      atualizarMenu();
    },
    animando: () => cena.ativa || estado.tela === 'menu' || (estado.tela === 'jogo' && !sim.pausado),
    pressionar() {
      if (cena.ativa) { cena.avancar(true); return; }
      if (estado.tela !== 'jogo') return;
      audio.garantir();
      if (sim.estagio === 'abertura') pularAbertura(sim);
      else pressionar(sim);
    },
    soltar() { if (estado.tela === 'jogo') soltar(sim); },
    atualizar(dt) {
      if (cena.ativa) {
        cena.atualizar(dt);
        el.dica.hidden = !cena.dicaVisivel();
        if (!el.dica.hidden) el.dica.textContent = 'Toque para avançar';
      } else if (estado.tela === 'jogo') {
        passo(sim, dt);
        if (sim.estagio === 'corrida') musica.atualizar(dt, sim);
        esvaziarEventos();
        if (estado.tela === 'jogo') hud.atualizar(sim);
      }
      renderizador.atualizar(dt);
    },
    desenhar() { if (cena.ativa) cena.desenhar(); else renderizador.desenhar(); },
    aoOcultar() {
      if (estado.tela === 'jogo') pausar();
      audio.suspender();
      gestor.salvarAgora();
    },
    aoMostrar() {
      if (estado.tela !== 'pausa') audio.retomar();
      laco.zerarRelogio();
      laco.acordar();
    }
  };
}
