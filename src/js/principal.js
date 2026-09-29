/**
 * @file principal.js
 * @description Composição da aplicação: cria as peças, liga os eventos da página e inicia.
 * É o único arquivo que conhece todas as camadas; a lógica fica nos módulos.
 */
import { VERSAO_APP, LIMITE_SAVE_BYTES } from './config/constantes.js';
import { criarLaco } from './nucleo/laco.js';
import { criarSimulacao } from './simulacao/criar.js';
import { fotografarPartida } from './simulacao/retomada.js';
import { criarArmazenamento, armazemDoNavegador } from './persistencia/armazenamento.js';
import { criarGestor } from './persistencia/gestor.js';
import { criarAudio } from './audio/motor.js';
import { criarMusica } from './audio/musica.js';
import { criarRenderizador } from './render/renderizador.js';
import { perfilLeve } from './render/camera.js';
import { obterElementos } from './interface/dom.js';
import { criarHud } from './interface/hud.js';
import { criarMensagens } from './interface/mensagens.js';
import { criarTelas } from './interface/telas.js';
import { criarMenu } from './interface/menu.js';
import { montarAjuda } from './interface/ajuda.js';
import { criarCenaFinal } from './cena-final/cena.js';
import { ligarEntrada } from './entrada/entrada.js';
import { criarControlador } from './app/controlador.js';
import { ligarJanela } from './app/janela.js';
import { ligarBotoes } from './app/botoes.js';

function iniciarAplicacao(janela) {
  const documento = janela.document;
  const el = obterElementos(documento);
  const leve = perfilLeve(janela);
  const reduzirMovimento = janela.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mensagens = criarMensagens(el);
  const armazenamento = criarArmazenamento(armazemDoNavegador(janela), () =>
    mensagens.aviso('Não foi possível salvar neste aparelho. Use "Baixar progresso" para não perder o seu avanço.', 'erro', 3500));
  const gestor = criarGestor(armazenamento);
  const sim = criarSimulacao();
  gestor.fotografarPartida = () => fotografarPartida(sim);

  const preferencias = {
    get musica() { return gestor.progresso.musica; },
    get efeitos() { return gestor.progresso.efeitos; }
  };
  const audio = criarAudio(preferencias, { leve });
  const renderizador = criarRenderizador({
    canvas: el.palco, sim, leve, reduzirMovimento, obterUniforme: () => gestor.progresso.uniforme
  });
  const telas = criarTelas(el);
  let controlador = null;
  const menu = criarMenu(el, {
    aoEscolherRota: (idx) => { menu.selecionar(idx); controlador.atualizarMenu(); }
  });
  const cena = criarCenaFinal({
    obterLayout: () => renderizador.layout,
    obterCtx: () => el.palco.getContext('2d'),
    obterUniforme: () => gestor.progresso.uniforme,
    mensagens, audio, movimento: !reduzirMovimento,
    aoTerminar: (stats) => controlador.aoTerminarFinal(stats)
  });

  const laco = criarLaco({
    atualizar: (dt) => controlador.atualizar(dt),
    desenhar: () => controlador.desenhar(),
    animando: () => controlador.animando()
  });
  const textoDica = janela.matchMedia('(pointer: coarse)').matches
    ? 'Toque curto: pulo baixo · Segure: pulo alto'
    : 'Clique ou Espaço: pulo baixo · Segure: pulo alto';
  controlador = criarControlador({
    el, sim, gestor, audio, musica: criarMusica(audio), hud: criarHud(el), menu, telas, mensagens,
    renderizador, cena, janela, laco, textoDica
  });

  ligarEntrada({
    palco: el.palco, documento,
    acoes: {
      pressionar: () => controlador.pressionar(), soltar: () => controlador.soltar(),
      pausar: () => controlador.pausar(), musica: () => controlador.alternar('musica'),
      efeitos: () => controlador.alternar('efeitos'), jogando: () => controlador.tela === 'jogo',
      emCena: () => cena.ativa, avancarCena: () => cena.avancar(true)
    }
  });
  ligarBotoes({ el, controlador, gestor, mensagens, menu, telas, janela, limiteBytes: LIMITE_SAVE_BYTES });
  ligarJanela({
    janela, sim, renderizador, redesenhar: () => controlador.desenhar(),
    aoOcultar: () => controlador.aoOcultar(), aoMostrar: () => controlador.aoMostrar()
  });

  montarAjuda(el);
  el.versao.textContent = `v${VERSAO_APP} · SEMAE Piracicaba`;
  controlador.atualizarMenu();
  if (gestor.recusado) mensagens.aviso('O progresso salvo estava inválido e foi ignorado; uma cópia foi guardada.', 'erro', 3500);
  laco.acordar();
  el.btnIniciar.focus({ preventScroll: true });
  janela.__leiturista = { sim, gestor, controlador, renderizador, audio };
}

iniciarAplicacao(window);
