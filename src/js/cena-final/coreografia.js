/**
 * @file coreografia.js
 * @description Cena "amizade": o leiturista se aproxima do cão, estende a mão, põe a tigela e faz
 * carinho, e o coração sobe. Duas versões da mesma linha do tempo: com ilustrações (poses que já
 * mostram os dois personagens) e com o desenho vetorial (tigela e corações desenhados à parte).
 */
import { ENCONTRO } from './personagens.js';

/** Quanto o leiturista caminha até o cão e a que velocidade (chega em 1,2 s). */
export const APROXIMACAO = 84;
const VELOCIDADE = APROXIMACAO / 1.2;
/** Radianos de fase por unidade caminhada (a caminhada ilustrada tem 8 quadros a cada ~110 u). */
const FASE_POR_UNIDADE = 0.0917;

const AGACHADO = ['ajoelhado', 'tigela', 'afaga'];

/** Posição (canto esquerdo da caixa) do leiturista quando termina a caminhada até o cão. */
export const xDoEncontro = (caoX, ilustrado) => caoX + (ilustrado ? ENCONTRO.ilustrado : ENCONTRO.vetor);

function coracoes(cena, audio, dt) {
  if (cena.tempoCena < 4.5) return;
  if (cena.tempoCena < 5.2) {
    if (cena.coracoes === 0) [523.25, 659.25, 783.99, 987.77].forEach((f, i) => audio.nota(f, 0.14, 0.035, 'sine', 0, 'efeito', i * 0.08));
    cena.coracoes = Math.min(1, cena.coracoes + 2 * dt);
  } else {
    cena.coracoes = Math.max(0, cena.coracoes - 2 * dt);
  }
}

function linhaDoTempoIlustrada(cena) {
  const { jogador, cao } = cena;
  const t = cena.tempoCena;
  jogador.pose = t < 2.2 ? 'mao' : t < 3.0 ? 'tigela' : 'afaga';
  cao.feliz = t >= 3.0;
}

function linhaDoTempoVetorial(cena, chaoY, xTigela) {
  const { jogador, cao } = cena;
  const t = cena.tempoCena;
  if (t < 1.6) {
    jogador.pose = 'ajoelhado';
  } else if (t < 2.2) {
    jogador.pose = 'tigela';
    const p = (t - 1.6) / 0.6;
    cena.tigela = { x: jogador.x - 6 + (xTigela - jogador.x + 6) * p, y: chaoY - 60 + 46 * p };
  } else if (t < 3.0) {
    jogador.pose = 'ajoelhado';
    cena.tigela = { x: xTigela, y: chaoY - 14 };
  } else if (t < 4.5) {
    jogador.pose = 'afaga';
    cao.feliz = true;
  }
}

/** Avança a coreografia em `dt` s. @param {{chaoY:number, audio:object}} amb */
export function coreografiaAmizade(cena, dt, { chaoY, audio }) {
  const { jogador, cao } = cena;
  const alvo = xDoEncontro(cao.x, cena.ilustrado);
  if (cena.tempoCena < 1.2) {
    if (jogador.x > alvo) { jogador.x = Math.max(alvo, jogador.x - VELOCIDADE * dt); jogador.fase += FASE_POR_UNIDADE * VELOCIDADE * dt; } else jogador.pose = 'parado';
  } else if (cena.ilustrado) {
    linhaDoTempoIlustrada(cena);
  } else {
    linhaDoTempoVetorial(cena, chaoY, cao.x + 85);
  }
  coracoes(cena, audio, dt);
  if (cena.tigela && !cena.ilustrado) cena.tigela.y = jogador.pose === 'ajoelhado' || jogador.pose === 'afaga' ? chaoY - 14 : cena.tigela.y;
  jogador.y = chaoY - 78 + (AGACHADO.includes(jogador.pose) ? 18 : 0);
}
