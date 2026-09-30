/**
 * @file renderizador.js
 * @description Compõe o quadro: ajusta o canvas ao layout, mantém o cenário da fase e desenha
 * na ordem cenário -> carga -> personagens -> efeitos -> aviso de perigo.
 */
import { calcularLayout } from './camera.js';
import { criarCenario, desenharCenario, chaveDoCenario } from './cenario/index.js';
import { criarEfeitos, efeitoDoEvento } from './efeitos.js';
import { limparSprites } from './sprites/cache.js';
import { limparAtlasEscalados, prepararAtlas, ilustracoesProntas } from './ilustracoes/atlas.js';
import { criarTela } from './primitivas.js';
import { desenharCarga, desenharCaoDaCena, desenharJogador } from './entidades.js';
import { desenharKombiDaCena, desenharDerrota, emDerrota } from './cenas.js';
import { estagioDoOsso } from './ilustracoes/quadros.js';

const SEM_TREMOR = { x: 0, y: 0 };

function criarVinheta(layout) {
  const k = Math.min(layout.escala * layout.pxRatio, 1);
  const tela = criarTela(layout.L * k, layout.A * k);
  const c = tela.getContext('2d');
  const g = c.createRadialGradient(tela.width / 2, tela.height / 2, tela.height * 0.25, tela.width / 2, tela.height / 2, tela.height * 0.75);
  g.addColorStop(0, 'rgba(224,74,95,0)');
  g.addColorStop(1, 'rgba(224,74,95,0.75)');
  c.fillStyle = g;
  c.fillRect(0, 0, tela.width, tela.height);
  return tela;
}

/**
 * @param {{canvas:HTMLCanvasElement, sim:object,
 *   reduzirMovimento:boolean, leve:boolean}} deps
 */
export function criarRenderizador({ canvas, sim, reduzirMovimento, leve }) {
  const ctx = canvas.getContext('2d', { alpha: false });
  const efeitos = criarEfeitos({ reduzirMovimento, leve });
  let layout = null;
  let cenario = null;
  let vinheta = null;
  let relogio = 0;
  let rolagemMenu = 0;
  let tempoOsso = null;   // s desde que o cão pegou o osso (null = não pegou)

  const api = {
    efeitos,
    get layout() { return layout; },
    /** Ajusta o canvas interno e devolve o layout (a simulação usa L, chaoY e jogadorX). */
    redimensionar(largura, altura, dpr) {
      layout = calcularLayout({ largura, altura, dpr, leve });
      canvas.width = layout.pixelsW;
      canvas.height = layout.pixelsH;
      cenario = null;
      vinheta = null;
      limparSprites();
      limparAtlasEscalados();
      return layout;
    },
    /** Gera antes da corrida os atlas na resolução da tela (evita engasgo ao começar). */
    prepararPersonagens() {
      if (layout) prepararAtlas(layout.escala * layout.pxRatio);
    },
    atualizar(dt) {
      relogio += dt;
      if (tempoOsso !== null) tempoOsso = estagioDoOsso(tempoOsso + dt) === null ? null : tempoOsso + dt;
      if (sim.estagio === 'inativo') rolagemMenu += 26 * dt;
      efeitos.atualizar(dt);
    },
    processarEventos(eventos) {
      if (!layout) return;
      for (const e of eventos) {
        efeitoDoEvento(efeitos, e, sim, layout.chaoY);
        if (e.tipo === 'powerup' && e.qual === 'osso') tempoOsso = 0;
      }
    },
    desenhar() {
      if (!layout) return;
      const k = layout.escala * layout.pxRatio;
      const faseIdx = sim.estagio === 'inativo' ? 0 : sim.faseIdx;
      if (!cenario || cenario.chave !== chaveDoCenario(faseIdx, layout)) cenario = criarCenario(faseIdx, layout);
      ctx.setTransform(k, 0, 0, k, 0, 0);
      const tremer = sim.tremor > 0 && !reduzirMovimento;
      const tremor = tremer ? { x: Math.round((Math.random() - 0.5) * 9 * k), y: Math.round((Math.random() - 0.5) * 6 * k) } : SEM_TREMOR;
      const noMenu = sim.estagio === 'inativo';
      const vista = noMenu ? { ...sim, rolagem: rolagemMenu, travessia: 0 } : sim;
      desenharCenario(ctx, cenario, vista, layout, relogio, !reduzirMovimento, { tremor });
      ctx.save();
      ctx.translate(tremor.x / k, tremor.y / k);
      const { chaoY } = layout;
      if (noMenu) {
        desenharKombiDaCena(ctx, sim, { x: layout.L * 0.62, portaAberta: false }, chaoY, relogio, k);
      } else {
        if (sim.kombi.visivel) desenharKombiDaCena(ctx, sim, sim.kombi, chaoY, relogio, k);
        const derrota = emDerrota(sim) && ilustracoesProntas();
        desenharCarga(ctx, sim, chaoY, k, relogio, derrota ? [sim.jogador.x - 60, sim.jogador.x + 130] : null);
        if (!(derrota && desenharDerrota(ctx, sim, chaoY, k))) {
          if (sim.cao.visivel) desenharCaoDaCena(ctx, sim.cao, sim, chaoY, relogio, k, tempoOsso === null ? null : estagioDoOsso(tempoOsso));
          desenharJogador(ctx, sim, chaoY, relogio, k);
        }
      }
      efeitos.desenhar(ctx);
      ctx.restore();
      if (sim.ameaca > 60 && sim.estagio === 'corrida') {
        vinheta = vinheta || criarVinheta(layout);
        ctx.globalAlpha = Math.min(0.55, ((sim.ameaca - 60) / 40) * (0.55 + Math.sin(relogio * 8) * 0.25));
        ctx.drawImage(vinheta, 0, 0, layout.L, layout.A);
        ctx.globalAlpha = 1;
      }
    }
  };
  return api;
}
