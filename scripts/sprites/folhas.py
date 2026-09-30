"""Tabela das folhas de sprites: qual imagem, que grade, onde fica o pivô e qual a escala.

Cada folha é uma imagem de `imagens/` (fundo magenta) com `colunas` x `linhas` quadros. Campos:
- ancora: 'tronco' | 'massa' | 'centro' | 'esquerda' | 'direita' (ver recorte.ancora_x).
- grupo: 'leiturista' | 'cao' | 'final' | 'kombi'. O azul do uniforme é trocado pelo azul oficial em
  todos os grupos menos 'cao'.
- u_px: unidades do jogo por pixel da imagem original. Se faltar, a escala vem de ALVOS (folhas antigas).
- alinhamento: 'base' (o ponto mais baixo do quadro fica no chão) ou 'teto' (o chão fica a uma altura
  fixa do teto da Kombi; usado nas cenas com a van, onde o menino pode pisar abaixo das rodas).
As escalas de u_px foram calibradas comparando o tamanho do boné/coleira/teto da Kombi entre as folhas
(a IA não mantém a mesma escala de uma folha para outra); ver docs/arte/CALIBRACAO-DE-ESCALA.md.
"""

# Pixels de atlas por unidade do jogo (o leiturista de corrida tem 240 px de altura = 92 unidades).
PX_POR_UNIDADE = 240.0 / 92.0

FOLHAS = [
    dict(nome="leiturista-corrida", arquivo="leiturista-corrida.png", colunas=4, linhas=2, ancora="tronco", grupo="leiturista"),
    dict(nome="leiturista-acoes", arquivo="leiturista-acoes.png", colunas=4, linhas=2, ancora="tronco", grupo="leiturista"),
    dict(nome="cao-galope", arquivo="cao-galope.png", colunas=3, linhas=2, ancora="massa", grupo="cao"),
    dict(nome="cao-acoes", arquivo="cao-acoes.png", colunas=3, linhas=2, ancora="massa", grupo="cao"),
    dict(nome="cena-final", arquivo="final.png", colunas=2, linhas=2, ancora="esquerda", grupo="final"),
    dict(nome="leiturista-pulo", arquivo="leiturista-pulo.png", colunas=4, linhas=2, ancora="tronco", grupo="leiturista", u_px=0.2338),
    dict(nome="leiturista-caminhada", arquivo="leiturista-caminhada.png", colunas=4, linhas=2, ancora="tronco", grupo="leiturista", u_px=0.2048),
    dict(nome="cao-latido", arquivo="cao-osso-latido.png", colunas=3, linhas=2, ancora="massa", grupo="cao", u_px=0.1983),
    dict(nome="derrota", arquivo="derrota.png", colunas=2, linhas=2, ancora="esquerda", grupo="final", u_px=0.20),
    dict(nome="kombi", arquivo="kombi.png", colunas=2, linhas=2, ancora="direita", grupo="kombi", u_px=0.2465),
    dict(nome="kombi-descer", arquivo="kombi-descer.png", colunas=2, linhas=2, ancora="direita", grupo="kombi", u_px=0.2328, alinhamento="teto"),
    dict(nome="kombi-entrar", arquivo="kombi-entrar.png", colunas=2, linhas=2, ancora="direita", grupo="kombi", u_px=0.2506, alinhamento="teto"),
]

# Escala das folhas antigas: altura mediana dos quadros de corrida (leiturista) e largura mediana do galope (cão).
ALVOS = {"leiturista": ("altura", 240.0, "leiturista-corrida"), "cao": ("largura", 250.0, "cao-galope")}
# Altura/largura em unidades do jogo que esse alvo representa (o desenho vetorial tinha 78 x 75).
UNIDADES_ALVO = {"leiturista": 92.0, "cao": 96.0}
RAZAO_CENA_FINAL = 0.735   # a cena final foi desenhada maior; iguala o boné/cão ao das outras folhas
