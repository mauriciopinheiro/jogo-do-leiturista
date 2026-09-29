/**
 * @file quadros-sprites.js
 * @description GERADO por scripts/preparar_sprites.py. Não editar à mão.
 * Medidas dos atlas de sprites ilustrados (px do atlas) e a escala para unidades do jogo.
 */
export const SPRITES = {
  unidadesPorPixel: {"leiturista": 0.38333, "cao": 0.384, "final": 0.38333},
  folhas: {
    'leiturista-corrida': {"colunas": 4, "quadros": 8, "celula": [202, 248], "grupo": "leiturista", "pivo": [101, 245]},
    'leiturista-acoes': {"colunas": 4, "quadros": 8, "celula": [236, 258], "grupo": "leiturista", "pivo": [118, 255]},
    'cao-galope': {"colunas": 3, "quadros": 6, "celula": [276, 202], "grupo": "cao", "pivo": [138, 199]},
    'cao-acoes': {"colunas": 3, "quadros": 6, "celula": [276, 247], "grupo": "cao", "pivo": [138, 244]},
    'cena-final': {"colunas": 2, "quadros": 4, "celula": [343, 233], "grupo": "final", "pivo": [3, 230]},
  }
};
