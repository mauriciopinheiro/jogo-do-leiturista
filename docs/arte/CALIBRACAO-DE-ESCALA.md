# Calibração de escala dos sprites (fase 1 e fase 2)

A IA que gerou as ilustrações não mantém o mesmo tamanho dos personagens de uma folha para outra. O
pipeline (`scripts/sprites/folhas.py`) converte cada folha para **unidades do jogo** (`u_px` = unidades por
pixel da imagem original) para que o leiturista, o cão e a Kombi tenham tamanho coerente na tela.

Medidas em pixels das imagens originais (`imagens/`), feitas com `scripts` de recorte e comparadas por
proxies de tamanho: altura do quadro, área das faixas amarelas da camisa (o quadrado dessa razão dá a razão
de escala do menino), área da coleira vermelha (idem para o cão) e largura do teto da Kombi.

| Folha | Medida usada | Valor medido | `u_px` adotado | Resultado em unidades do jogo |
|---|---|---|---|---|
| `leiturista-corrida` (referência) | altura mediana dos quadros | 393,5 px | 0,2338 | menino de corrida ≈ 92 u |
| `leiturista-acoes` | igual à corrida | 404 px em pé | 0,2338 | parado ≈ 94 u |
| `leiturista-pulo` | faixas amarelas ≈ as da corrida | mediana ~890 vs ~870 | 0,2338 | 80 a 103 u conforme a pose |
| `leiturista-caminhada` | altura em pé 461 px contra 404 px do parado | ×0,876 | 0,2048 | ≈ 94,4 u |
| `leiturista-gestos` | poses em pé ≈437 px (contra 404 do parado) e faixas ≈1.100 px² (×1,12) | ×0,91 | 0,212 | ≈ 92,6 u em pé |
| `cao-galope` (referência) | largura mediana | 484 px | 0,1983 | cão ≈ 96 u de comprimento |
| `cao-latido` | coleira ≈ igual à do galope | 1.898 a 1.998 vs 1.946 px² | 0,1983 | igual ao galope |
| `cena-final` (fase 1) | razão escolhida a olho | — | 0,735 × corrida | — |
| `derrota` | menino 1,30× maior e cão 0,87× menor que nas folhas base | compromisso | 0,20 | menino ≈ 89 u, cão ≈ 89 u de comprimento (±11% dos alvos) |
| `kombi` | largura total do quadro | 714 px | 0,2465 | 176 u de largura, ≈ 93 u de altura |
| `kombi-descer` | teto da van ≈ 577 px contra 545 da `kombi` | ×0,944 | 0,2328 | van com a mesma largura |
| `kombi-entrar` | teto da van ≈ 536 px contra 545 | ×1,017 | 0,2506 | van com a mesma largura |

Notas:

- Nas folhas com a van (`kombi-descer`, `kombi-entrar`) o chão é alinhado pelo **teto da van** (`alinhamento: teto`): o
  menino pisa um pouco abaixo das rodas (está à frente da van), e alinhar pelo ponto mais baixo faria a van "subir".
- Na `derrota` a IA desenhou o menino bem maior e o cão menor do que nas folhas de referência; como a folha é
  uma cena única, adotou-se um meio-termo. Para acertar de vez, seria preciso regerar a folha com os dois
  personagens no tamanho relativo das fichas.
- A `kombi.png` (van sozinha) e as folhas com o menino foram geradas em separado: a posição da porta deslizante
  e do logotipo difere alguns por cento entre elas. Na tela isso aparece como um pequeno deslocamento da porta
  quando a van troca de "sozinha" para "com o menino".
- Para ajustar um tamanho: altere `u_px` da folha em `folhas.py`, rode `python scripts/preparar_sprites.py` e
  `npm run verificar:sprites`, e confira em `--previa`.

## Cão avulso na cena final (v4.2.1)

O cão da cena final vem do atlas `cao-acoes` (sentado ≈ 88,3 u), mas ao lado dos quadros compostos (`cena-final`, menino + cão) o cão mede ≈ 54,8 u sentado. Sem correção
o cão avulso parecia quase do tamanho do menino. `FATOR_CAO_NA_CENA = 0,68` (em `src/js/config/constantes.js`) reduz o cão avulso para ≈ 60 u (1,10× o do quadro composto), com sombra e pivô na mesma proporção.
Para ajustar, mude a constante e confira a cena final; o teste `nitidez.test.js` exige a razão entre 0,95 e 1,2.
