/**
 * @file constantes.js
 * @description Identidade, física e temporizadores do jogo. Unidades: "u" (unidade lógica do
 * mundo), segundos e u/s. Os valores da física vêm da v3.4.0 (px/quadro x 60), para que o
 * "toque curto = pulo baixo, segure = pulo alto" continue com a mesma sensação.
 */

/** Identificador histórico da v3: mantê-lo preserva os saves já gravados nos aparelhos. */
export const ID_APP = 'jogo-do-leiturista-3';
export const VERSAO_APP = '4.0.0';
export const ESQUEMA_SAVE = 2;
export const CHAVE_SAVE = `semae.${ID_APP}.v${ESQUEMA_SAVE}`;
export const CHAVE_SAVE_V1 = `semae.${ID_APP}.v1`;
export const LIMITE_SAVE_BYTES = 256 * 1024;

/** Identificador do jogo no catálogo do hub (public/catalogo.json). */
export const ID_JOGO_NO_HUB = 'app_jogo_do_leiturista';

export const FISICA = {
  gravidade: 2952,
  impulsoPulo: 1008,
  /** Ao soltar o toque durante a subida, a velocidade vertical é limitada a este valor. */
  corteSoltar: 420,
  toleranciaChao: 0.117,
  bufferPulo: 0.1,
  /** Velocidade vertical (u/s) abaixo da qual a leitura no ar conta como "coleta aérea perfeita". */
  limitePerfeita: 228
};

/** O leiturista: caixa de desenho e caixa de colisão (altitudes relativas ao pé). */
export const JOGADOR = {
  largura: 45,
  altura: 78,
  caixa: { recuoX: 8, largura: 29, base: 2, topo: 66 }
};

export const CAO = { largura: 75, altura: 48, distanciaMinima: 60, distanciaMaxima: 230 };

export const TEMPOS = {
  combo: 3,
  turbo: 5,
  flow: 6,
  machucado: 0.583,
  tremor: 0.2,
  decaimentoGolpes: 6,
  intervaloPowerup: [10, 16],
  travessiaRua: 1.4,
  respiroDerrota: 0.9
};

export const AMEACA = {
  passiva: 0.3,
  porColisao: 20,
  ruaConcluida: -25,
  osso: -30,
  limite: 100
};

/** Distância mínima entre o fim de um padrão e o início do seguinte. */
export const FOLGA_ENTRE_PADROES = 160;
export const MARGEM_SPAWN = 40;
export const RAIO_MEDIDOR = 18;
export const RAIO_POWERUP = 16;
export const LIMITE_ANOMALIA = 42;
export const PASSO_MAXIMO = 1 / 60;
export const DT_MAXIMO = 1 / 20;
