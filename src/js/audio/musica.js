/**
 * @file musica.js
 * @description Trilha procedural: um passo a cada 125 ms, com percussão leve, arpejo de combo,
 * pulso grave de perigo e arpejo brilhante no Flow.
 */

const ESCALA_COMBO = [523.25, 587.33, 659.25, 783.99, 880];
const ESCALA_FLOW = [659.25, 783.99, 987.77, 1046.5];
const INTERVALO = 0.125;

export function criarMusica(audio) {
  let acumulado = 0;
  let passo = 0;
  return {
    /** Chamar a cada quadro enquanto a corrida está em andamento. */
    atualizar(dt, sim) {
      acumulado += dt;
      if (acumulado < INTERVALO) return;
      acumulado = 0;
      passo = (passo + 1) % 16;
      const n = (...args) => audio.nota(...args, 'musica');
      if (passo % 4 === 0) n(110, 0.08, 0.02, 'sine', -20);
      else if (passo % 4 === 2) n(140, 0.05, 0.015, 'triangle', -10);
      if (sim.combo >= 3 && passo % 2 === 0) n(ESCALA_COMBO[(passo + Math.floor(sim.combo)) % ESCALA_COMBO.length], 0.06, 0.015, 'triangle', 0);
      if (sim.ameaca > 70 && passo % 4 === 3) n(85, 0.12, 0.035, 'sawtooth', -30);
      if (sim.flow.estado === 'ativo') n(ESCALA_FLOW[passo % ESCALA_FLOW.length], 0.05, 0.02, 'sine', 100);
    },
    reiniciar() { acumulado = 0; passo = 0; }
  };
}
