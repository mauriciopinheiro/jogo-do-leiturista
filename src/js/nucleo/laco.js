/**
 * @file laco.js
 * @description Laço único de animação. Avança por tempo decorrido (segundos), limita o salto
 * após voltar de segundo plano e para de agendar quadros quando não há nada a animar.
 */
import { DT_MAXIMO } from '../config/constantes.js';

/**
 * @param {object} deps
 * @param {(dt:number)=>void} deps.atualizar chamado 1x por quadro com dt em segundos
 * @param {()=>void} deps.desenhar
 * @param {()=>boolean} deps.animando quando falso o laço dorme até `acordar()`
 * @param {(cb:FrameRequestCallback)=>number} [deps.raf]
 */
export function criarLaco({ atualizar, desenhar, animando, raf = (cb) => requestAnimationFrame(cb) }) {
  let agendado = false;
  let ultimo = 0;

  function quadro(agora) {
    agendado = false;
    const dt = ultimo ? Math.min(DT_MAXIMO, Math.max(0, (agora - ultimo) / 1000)) : 0;
    ultimo = agora;
    if (dt > 0) atualizar(dt);
    desenhar();
    if (animando()) agendar();
    else ultimo = 0;
  }

  function agendar() {
    if (agendado) return;
    agendado = true;
    raf(quadro);
  }

  return {
    /** Garante que o laço esteja rodando; o primeiro quadro após acordar tem dt = 0. */
    acordar() {
      if (!agendado) ultimo = 0;
      agendar();
    },
    /** Zera a referência de tempo (ex.: ao voltar de uma pausa) sem parar o laço. */
    zerarRelogio() {
      ultimo = 0;
    }
  };
}
