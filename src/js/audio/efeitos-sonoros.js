/**
 * @file efeitos-sonoros.js
 * @description Traduz eventos da simulação em sons. Notas agendadas com `atraso` no relógio do
 * áudio (sem setTimeout), então não se atrasam nem se acumulam com a aba em segundo plano.
 */

export function tocarEvento(audio, e) {
  const n = (...args) => audio.nota(...args);
  switch (e.tipo) {
    case 'pulo': n(420, 0.06, 0.02, 'square', 180); break;
    case 'aterrissagem': if (e.forca > 500) n(150, 0.05, 0.02, 'sine', -40); break;
    case 'leitura':
      if (e.perfeita) { n(880, 0.06, 0.03, 'triangle', 220); n(1100, 0.08, 0.035, 'triangle', 180, 'efeito', 0.05); n(1320, 0.1, 0.03, 'sine', 150, 'efeito', 0.1); }
      else if (e.ouro) { n(600, 0.05, 0.03, 'square', 200); n(900, 0.06, 0.03, 'square', 200, 'efeito', 0.04); n(1200, 0.08, 0.03, 'triangle', 150, 'efeito', 0.08); }
      else { n(720, 0.05, 0.022, 'triangle', 180); n(1040, 0.07, 0.02, 'triangle', 140, 'efeito', 0.055); }
      break;
    case 'perdido': n(140, 0.08, 0.02, 'sawtooth', -30); break;
    case 'colisao': n(120, 0.15, 0.045, 'sawtooth', -60); break;
    case 'escudo-bloqueou': n(400, 0.1, 0.04, 'square', -150); break;
    case 'impacto-flow': n(600, 0.08, 0.03, 'triangle', 200); break;
    case 'powerup': n(520, 0.08, 0.03, 'sine', 200); n(840, 0.12, 0.035, 'sine', 220, 'efeito', 0.07); break;
    case 'flow-pronto': n(880, 0.1, 0.04, 'triangle', 300); break;
    case 'flow-ativo': n(1040, 0.12, 0.04, 'sine', 300); break;
    case 'rua-concluida': n(620, 0.08, 0.03, 'triangle', 180); n(930, 0.1, 0.03, 'triangle', 160, 'efeito', 0.09); break;
    case 'rua-nova': if (!e.primeira) { n(520, 0.08, 0.03, 'sine', 100); n(660, 0.1, 0.03, 'sine', 150, 'efeito', 0.12); } break;
    case 'rota-finalizada': n(780, 0.1, 0.03, 'triangle', 200); n(1180, 0.12, 0.03, 'triangle', 150, 'efeito', 0.12); break;
    case 'latido': n(165, 0.07, 0.035, 'square', -35); n(130, 0.09, 0.028, 'sawtooth', -25, 'efeito', 0.065); break;
    case 'derrota': n(220, 0.3, 0.05, 'sawtooth', -140); break;
    case 'combo-perdido': n(200, 0.1, 0.02, 'triangle', -60); break;
    default: break;
  }
}

/** Fanfarra curta usada ao vencer/abrir cenas. */
export function fanfarra(audio) {
  [523.25, 659.25, 783.99].forEach((f, i) => audio.nota(f, 0.14, 0.045, 'triangle', 0, 'efeito', i * 0.1));
}
