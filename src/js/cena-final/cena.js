/**
 * @file cena.js
 * @description Máquina de estados da cena final: 5 cenas cronometradas, avanço por toque,
 * coreografia do reencontro com o cão (tigela, carinho, corações) e caminhada final.
 */
import { CENAS, TEMPO_MINIMO_PARA_AVANCAR, TEXTOS, estatisticasSeguras } from './roteiro.js';
import { TOTAL_CAMPANHA } from '../config/rotas.js';
import { criarCenario, chaveDoCenario, desenharCenario } from '../render/cenario/index.js';
import { desenharRetrospectiva, pintarTigelaECoracoes } from './desenho.js';
import { pintarPersonagens, modoIlustrado, ENCONTRO } from './personagens.js';
import { coreografiaAmizade, APROXIMACAO } from './coreografia.js';

const ALTURA_PERSONAGEM = 78;
const VELOCIDADE_CAO = 130;
/** As ilustrações são pré-escaladas para a câmera média da cena (o zoom vai de 1,0 a 1,45). */
const ZOOM_MEDIO = 1.25;

/**
 * @param {{obterLayout:()=>object, obterCtx:()=>CanvasRenderingContext2D,
 *   mensagens:object, audio:object, aoTerminar:(stats:object)=>void, movimento:boolean}} deps
 */
export function criarCenaFinal({ obterLayout, obterCtx, mensagens, audio, aoTerminar, movimento }) {
  const cena = {
    ativa: false, indice: 0, tempoCena: 0, tempo: 0, zoom: 1, stats: null, cenario: null, rolagem: 0,
    jogador: { x: 0, y: 0, fase: 0, pose: 'parado', olhando: 1 },
    cao: { x: -120, y: 0, fase: 0, sentado: false, feliz: false, olhando: 1 },
    tigela: null, coracoes: 0, ilustrado: false
  };

  /** Onde o cão para: o par cão + leiturista fica centrado na tela. */
  const xDoCao = (L) => L / 2 - 95;

  function iniciarCena() {
    const { L, chaoY } = obterLayout();
    const { jogador, cao } = cena;
    cena.tempoCena = 0;
    cena.tigela = null;
    cena.coracoes = 0;
    jogador.y = chaoY - ALTURA_PERSONAGEM;
    cao.y = chaoY - 48;
    const nome = CENAS[cena.indice].nome;
    if (nome === 'conclusao') {
      Object.assign(jogador, { x: -80, pose: 'anda', olhando: 1, fase: 0 });
      mensagens.faixa(...Object.values(TEXTOS.conclusao(cena.stats.meters)), 'vitoria', 3.6);
    } else if (nome === 'reencontro') {
      const xPartida = xDoCao(L) + (cena.ilustrado ? ENCONTRO.ilustrado : ENCONTRO.vetor) + APROXIMACAO;
      Object.assign(jogador, { x: xPartida, pose: 'parado', olhando: -1, inclinacao: -0.15 });
      Object.assign(cao, { x: -80, sentado: false, feliz: false, olhando: 1 });
      mensagens.faixa(TEXTOS.reencontro.titulo, TEXTOS.reencontro.sub, 'vitoria', 3.8);
    } else if (nome === 'amizade') {
      const xCao = xDoCao(L);
      const xPartida = xCao + (cena.ilustrado ? ENCONTRO.ilustrado : ENCONTRO.vetor) + APROXIMACAO;
      Object.assign(jogador, { x: xPartida, pose: 'anda', olhando: -1, inclinacao: 0 });
      Object.assign(cao, { x: xCao, sentado: true, feliz: false, olhando: 1 });
      mensagens.limparFaixa();
    } else if (nome === 'epilogo') {
      Object.assign(jogador, { x: L * 0.35, pose: 'anda', olhando: 1, fase: 0 });
      Object.assign(cao, { x: L * 0.35 + 68, sentado: false, feliz: true, olhando: 1 });
      mensagens.faixa(TEXTOS.epilogo.titulo, TEXTOS.epilogo.sub, 'vitoria', 4.6);
      [523.25, 659.25, 783.99].forEach((f, i) => audio.nota(f, 0.14, 0.045, 'triangle', 0, 'efeito', i * 0.1));
    }
  }

  function atualizarCena(dt) {
    const { L } = obterLayout();
    const { jogador, cao } = cena;
    const nome = CENAS[cena.indice].nome;
    if (nome === 'conclusao') {
      if (jogador.x < L * 0.32) { jogador.x += 120 * dt; jogador.fase += 11 * dt; } else jogador.pose = cena.ilustrado ? 'vitoria' : 'parado';
    } else if (nome === 'reencontro') {
      if (cao.x < xDoCao(L)) { cao.x += VELOCIDADE_CAO * dt; cao.fase += 10 * dt; } else { cao.x = xDoCao(L); cao.sentado = true; }
    } else if (nome === 'amizade') {
      coreografiaAmizade(cena, dt, { chaoY: obterLayout().chaoY, audio });
    } else if (nome === 'epilogo') {
      cena.rolagem += (movimento ? 110 : 55) * dt;
      jogador.fase += 11 * dt;
      cao.fase += 13 * dt;
    }
  }

  const api = {
    get ativa() { return cena.ativa; },
    iniciar(bruto, indiceInicial = 0) {
      cena.stats = estatisticasSeguras(bruto, TOTAL_CAMPANHA);
      cena.ativa = true;
      cena.ilustrado = modoIlustrado();
      cena.indice = indiceInicial;
      cena.tempo = 0;
      cena.zoom = CENAS[indiceInicial].zoom;
      cena.rolagem = 0;
      iniciarCena();
    },
    /** Toque/tecla: avança de cena, respeitando um tempo mínimo de leitura. */
    avancar(manual = true) {
      if (!cena.ativa || (manual && cena.tempoCena < TEMPO_MINIMO_PARA_AVANCAR)) return;
      if (cena.indice >= CENAS.length - 1) {
        cena.ativa = false;
        mensagens.limparFaixa();
        aoTerminar(cena.stats);
        return;
      }
      cena.indice += 1;
      iniciarCena();
    },
    dicaVisivel() { return cena.ativa && cena.tempoCena >= TEMPO_MINIMO_PARA_AVANCAR; },
    atualizar(dt) {
      if (!cena.ativa) return;
      cena.tempo += dt;
      cena.tempoCena += dt;
      cena.zoom += (CENAS[cena.indice].zoom - cena.zoom) * Math.min(1, dt * 5);
      atualizarCena(dt);
      if (cena.tempoCena >= CENAS[cena.indice].duracao) api.avancar(false);
    },
    desenhar() {
      const layout = obterLayout();
      const ctx = obterCtx();
      if (!cena.ativa || !layout) return;
      const k = layout.escala * layout.pxRatio;
      ctx.setTransform(k, 0, 0, k, 0, 0);
      if (CENAS[cena.indice].nome === 'retrospectiva') { desenharRetrospectiva(ctx, layout, cena.tempoCena); return; }
      const temaIdx = CENAS[cena.indice].nome === 'epilogo' ? 3 : 0;
      if (!cena.cenario || cena.cenario.chave !== chaveDoCenario(temaIdx, layout)) cena.cenario = criarCenario(temaIdx, layout);
      ctx.save();
      ctx.translate(layout.L / 2, layout.chaoY);
      ctx.scale(cena.zoom, cena.zoom);
      ctx.translate(-layout.L / 2, -layout.chaoY);
      desenharCenario(ctx, cena.cenario, { rolagem: cena.rolagem, travessia: 0, velocidadeEfetiva: 0 }, layout, cena.tempo, movimento, { emUnidades: true });
      pintarTigelaECoracoes(ctx, cena, layout.chaoY);
      pintarPersonagens(ctx, cena, k * ZOOM_MEDIO, layout.chaoY, cena.tempo);
      ctx.restore();
    }
  };
  return api;
}
