/**
 * @file quadros-sprites.js
 * @description GERADO por scripts/preparar_sprites.py. Não editar à mão.
 * Medidas dos atlas de sprites ilustrados (px do atlas): grade, célula, pivô (pé) e `upp`,
 * as unidades do jogo por pixel do atlas.
 */
export const SPRITES = {
  folhas: {
    'leiturista-corrida': {"colunas": 4, "quadros": 8, "celula": [202, 248], "grupo": "leiturista", "pivo": [101, 245], "upp": 0.38333},
    'leiturista-acoes': {"colunas": 4, "quadros": 8, "celula": [236, 258], "grupo": "leiturista", "pivo": [118, 255], "upp": 0.38333},
    'cao-galope': {"colunas": 3, "quadros": 6, "celula": [276, 202], "grupo": "cao", "pivo": [138, 199], "upp": 0.384},
    'cao-acoes': {"colunas": 3, "quadros": 6, "celula": [276, 247], "grupo": "cao", "pivo": [138, 244], "upp": 0.384},
    'cena-final': {"colunas": 2, "quadros": 4, "celula": [343, 233], "grupo": "final", "pivo": [3, 230], "upp": 0.38333},
    'leiturista-pulo': {"colunas": 4, "quadros": 8, "celula": [218, 274], "grupo": "leiturista", "pivo": [109, 271], "upp": 0.38333},
    'leiturista-caminhada': {"colunas": 4, "quadros": 8, "celula": [168, 253], "grupo": "leiturista", "pivo": [84, 250], "upp": 0.38333},
    'cao-latido': {"colunas": 3, "quadros": 6, "celula": [274, 189], "grupo": "cao", "pivo": [137, 186], "upp": 0.38333},
    'derrota': {"colunas": 2, "quadros": 4, "celula": [400, 244], "grupo": "final", "pivo": [3, 241], "upp": 0.38333},
    'kombi': {"colunas": 2, "quadros": 4, "celula": [466, 250], "grupo": "kombi", "pivo": [463, 247], "upp": 0.38333},
    'kombi-descer': {"colunas": 2, "quadros": 4, "celula": [451, 262], "grupo": "kombi", "pivo": [448, 243], "upp": 0.38333, "alinhamento": "teto"},
    'kombi-entrar': {"colunas": 2, "quadros": 4, "celula": [511, 250], "grupo": "kombi", "pivo": [508, 242], "upp": 0.38333, "alinhamento": "teto"},
  }
};
