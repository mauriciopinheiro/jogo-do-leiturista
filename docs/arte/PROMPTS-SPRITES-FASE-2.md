# Prompts para o ChatGPT — sprites que faltam (fase 2)

Documento de trabalho do Jogo do Leiturista (SPEC-2026-004, continuação). Cada folha abaixo vira um arquivo em `imagens/`; depois eu recorto, alinho e integro ao jogo.

## Como usar

1. Abra uma **conversa nova** no ChatGPT (modelo com geração de imagens).
2. **Anexe as referências** (estão em `imagens/`): `leiturista-ficha.png`, `cao-ficha.png` e, para a Kombi, `Logo_completo.png` (raiz do repositório). Nas folhas de composição, anexe também a `kombi.png` gerada antes.
3. Cole o **PROMPT BASE** uma vez, no começo da conversa.
4. Depois, na mesma conversa, cole **um prompt de folha por vez**. Se a conversa começar a "desviar" do estilo, abra outra, cole o PROMPT BASE de novo e reanexe as fichas.
5. Salve cada resultado com o **nome exato** indicado, na pasta `imagens/`, e me avise.

**Regra de ouro das cores:** peça sempre o **mesmo azul da ficha**. O jogo troca esse azul pelo azul oficial do SEMAE (`#005E9F`) automaticamente. Se o ChatGPT já desenhar no azul oficial, o resultado sai escuro demais.

**Ordem sugerida** (do que mais falta para o que menos falta):

| # | Arquivo | Grade | Para que serve |
|---|---|---|---|
| 1 | `kombi.png` | 2×2 | Kombi ilustrada (parada, porta aberta, andando). Precisa vir antes das folhas 2 e 3 |
| 2 | `kombi-descer.png` | 2×2 | Leiturista descendo da Kombi na abertura da rota |
| 3 | `kombi-entrar.png` | 2×2 | Leiturista entrando na Kombi no final da rota |
| 4 | `derrota.png` | 2×2 | Cão alcança o leiturista (tom amigável) |
| 5 | `cao-osso-latido.png` | 3×2 | Cão latindo correndo, osso |
| 6 | `leiturista-pulo.png` | 4×2 | Pulo completo |
| 7 | `leiturista-caminhada.png` | 4×2 | Ciclo de caminhada |
| 8 | `leiturista-gestos.png` | 4×2 | Leitura, turbo, escudo, comemorações |
| 9 | `hidrometros.png` | 2×2 | Hidrômetros comum e ouro |
| 10 | `obstaculos.png` | 3×2 | Os 6 obstáculos |
| 11 | `powerups.png` | 3×1 | Turbo, escudo, osso |
| 12 | `capa-nova.png` | 16:9 | Capa do jogo no Hub (sem fundo magenta) |

---

## PROMPT BASE (colar uma vez por conversa)

```
Vou pedir várias folhas de sprites (quadros de animação) para um jogo 2D educativo infantil do SEMAE Piracicaba. Anexei as fichas oficiais dos dois personagens. Siga SEMPRE estas regras em todas as folhas:

PERSONAGENS (idênticos às fichas anexas, sem mudar nada):
- MENINO LEITURISTA: criança de uns 10 anos, proporção "cartoon", cabeça grande; pele morena; cabelo preto curto e liso; olhos grandes e escuros; boné azul com uma gota d'água branca na frente; camisa polo azul com gota branca no peito e DUAS faixas amarelas horizontais no peito; calça cargo azul-marinho com bolso lateral; tênis branco com detalhes azul-marinho; bolsa carteiro azul-marinho a tiracolo com fivela; celular escuro com tela azul-clara na mão. Use EXATAMENTE o mesmo azul da ficha (não clarear, não escurecer, não trocar de tom).
- CÃO CARAMELO: pelo laranja-dourado; peito, focinho e patas cremes; orelhas caídas laranja mais escuro; coleira VERMELHA (vermelha, nunca rosa) com plaquinha dourada; rabo enrolado e felpudo com ponta creme. Contorno marrom-escuro.

ESTILO (igual às fichas): desenho 2D cartoon, contorno grosso e escuro (azul-marinho no menino, marrom-escuro no cão), cores chapadas com sombreado simples de uma ou duas tonalidades (cel-shading), sem texturas realistas, sem degradês complexos, sem brilho fotográfico.

REGRAS TÉCNICAS OBRIGATÓRIAS:
1. Fundo: magenta puro #FF00FF (255,0,255), totalmente chapado. SEM degradê, SEM chão, SEM sombra projetada, SEM reflexo, SEM poeira, SEM partículas, SEM linhas de movimento, SEM textos, SEM números, SEM molduras, SEM linhas de grade.
2. Nada nos personagens pode ser magenta, rosa-choque ou roxo (a língua do cão é rosa-salmão, a coleira é vermelha).
3. A folha é uma GRADE REGULAR de células iguais (o número de colunas × linhas é dito em cada pedido). Um quadro por célula, na ordem de leitura: da esquerda para a direita, de cima para baixo.
4. Cada quadro fica INTEIRO dentro da sua célula, com folga de pelo menos 6% até as bordas. Nada encosta na borda da imagem, nem em outro quadro. Nada cortado (cauda, boné, mão, pé).
5. MESMA ESCALA em todos os quadros da folha (a cabeça do menino tem sempre o mesmo tamanho; o cão idem). Quando o personagem pisa no chão, os pés/patas ficam na mesma linha imaginária em todos os quadros da mesma fileira.
6. Vista lateral, personagem olhando para a DIREITA, salvo quando o pedido disser outra coisa.
7. Tom infantil e amigável: nada de violência, mordida, sangue ou susto exagerado.
8. Formato: imagem horizontal 3:2 (1536×1024), PNG, alta nitidez.

Responda só com a imagem. Se algum quadro ficar diferente do pedido, refaça a folha inteira em vez de explicar.
```

---

## 1. `kombi.png` — Kombi do SEMAE (grade 2 colunas × 2 linhas)

Anexar: `Logo_completo.png`.

```
Folha 2×2 (4 quadros) com a KOMBI BRANCA do SEMAE, vista lateral perfeita, frente da van voltada para a DIREITA.

Veículo: van clássica tipo Kombi, mas SEM logotipo de nenhuma marca de carro. Carroceria branca arredondada; faixa horizontal na lateral com o MESMO AZUL da camisa do menino, um filete verde #4E9959 e um filete amarelo fino; nas portas, a marca do SEMAE conforme o logotipo anexo (o "S" azul e verde e a palavra "semae" em minúsculas, azul) — se o texto ficar impreciso, desenhe só o "S" azul e verde; janelas azul-claras com reflexo simples; farol redondo amarelo-claro; para-choques cinza-claro; pneus pretos com calotas cinza-claro com poucos raios. A van tem o mesmo tamanho e a mesma posição em todos os quadros; as rodas tocam a mesma linha de chão.

Quadros:
1. Parada, todas as portas fechadas.
2. Parada, porta lateral deslizante ABERTA (abertura escura mostrando o interior com um degrau), porta recuada para trás.
3. Em movimento: van ligeiramente mais baixa (suspensão comprimida), raios das calotas numa posição.
4. Em movimento: van ligeiramente mais alta (suspensão esticada), raios das calotas girados em outra posição.
```

Uso no jogo: quadro 1 = parada; 2 = aberta; 3 e 4 alternam enquanto anda.

---

## 2. `kombi-descer.png` — Leiturista descendo da Kombi (2×2)

Anexar: `kombi.png` (a Kombi já aprovada) e `leiturista-ficha.png`.

```
Folha 2×2 (4 quadros). Em TODOS os quadros aparece a MESMA Kombi da imagem anexa (mesmo tamanho, mesma posição na célula, rodas na mesma linha de chão, porta lateral deslizante ABERTA), ocupando a parte esquerda da célula. O menino leiturista (da ficha) desce dela para a direita. Vista lateral, van e menino voltados para a DIREITA.

Quadros:
1. O menino ainda dentro da van: só cabeça e tronco aparecem na abertura da porta, sorrindo, segurando o celular, pronto para sair.
2. Saindo: um pé já fora, descendo o degrau, a outra mão segurando o batente da porta; corpo inclinado para a frente.
3. Aterrissando: os dois pés no chão ao lado da porta, joelhos flexionados, braços para a frente, olhando para a direita.
4. Em pé, na frente da van, ajeitando o boné com uma das mãos, expressão decidida, pronto para correr; a porta continua aberta.

O espaço à direita da van deve ficar livre nos quadros 3 e 4 para o menino aparecer inteiro.
```

Uso: abertura da rota (a Kombi para, o menino desce e corre).

---

## 3. `kombi-entrar.png` — Leiturista entrando na Kombi (2×2)

Anexar: `kombi.png`, `leiturista-ficha.png`.

```
Folha 2×2 (4 quadros). Em TODOS os quadros aparece a MESMA Kombi da imagem anexa (mesmo tamanho, mesma posição na célula, rodas na mesma linha de chão, porta lateral deslizante ABERTA). O menino leiturista (da ficha) vem da esquerda e embarca. Vista lateral, tudo voltado para a DIREITA. Deixe espaço livre à ESQUERDA da van para o menino chegar.

Quadros:
1. Chegando: o menino corre e desacelera na frente da porta, um braço estendido para alcançar o batente, olhando para a van.
2. Segurando o batente da porta com uma mão, um pé no degrau, impulsionando o corpo para dentro.
3. Metade do corpo dentro da van, inclinado para dentro, só uma perna ainda fora, visto parcialmente de costas.
4. Dentro da abertura da porta, sentado, olhando para a frente, acenando com uma mão, sorrindo (a porta continua aberta).
```

Uso: encerramento da rota (o menino embarca e a Kombi sai).

---

## 4. `derrota.png` — O cão alcança o leiturista (2×2, tom amigável)

Anexar: `leiturista-ficha.png`, `cao-ficha.png`.

```
Folha 2×2 (4 quadros) com o MENINO LEITURISTA e o CÃO CARAMELO juntos em cada quadro. Tom AMIGÁVEL e engraçado, para crianças: o cão só quer brincar (língua para fora, olhos alegres, nunca rosnando, nunca mordendo). Vista lateral: o cão vem da ESQUERDA, o menino está à direita dele, os dois voltados para a DIREITA (no quadro 3 e 4 o menino pode olhar de volta para o cão).

Quadros:
1. O menino corre olhando assustado para trás; o cão logo atrás, no ar, patas dianteiras estendidas, quase alcançando, boca aberta sorrindo com a língua de fora.
2. O cão salta no menino; o menino perde o equilíbrio, braços abertos, olhos arregalados, celular ainda na mão.
3. O menino sentado no chão, surpreso, mãos apoiadas atrás; o cão de pé sobre as pernas dele, rabo abanando, língua de fora.
4. O menino sentado, rindo de olhos fechados, enquanto o cão lambe o rosto dele; o boné ligeiramente torto.

Os dois personagens mantêm sempre o mesmo tamanho relativo entre si em todos os quadros.
```

Uso: tela de derrota (a partir do momento em que o cão alcança o leiturista).

---

## 5. `cao-osso-latido.png` — Cão: latir correndo e osso (3×2)

Anexar: `cao-ficha.png`.

```
Folha 3×2 (6 quadros) só com o CÃO CARAMELO, vista lateral, voltado para a DIREITA.

Quadros:
1. Latindo enquanto CORRE: galope com as quatro patas fora do chão, cabeça erguida, boca bem aberta latindo, orelhas balançando.
2. Latindo enquanto corre, segundo momento do galope: patas dianteiras estendidas à frente, traseiras apoiando, boca aberta.
3. Parado, farejando: cabeça baixa perto do chão, focinho no chão, rabo levantado.
4. Pegando o osso: focinho no chão, mordendo um osso de desenho animado (cor creme, contorno escuro), olhos fechados de felicidade.
5. Trotando feliz com o osso na boca, cabeça erguida, orelhas balançando.
6. Deitado de barriga para baixo, segurando o osso entre as patas dianteiras e roendo, rabo abanando.

O osso é sempre do mesmo tamanho (aproximadamente do tamanho da cabeça do cão).
```

Uso: latido enquanto persegue, e o cão distraído pelo osso (power-up).

---

## 6. `leiturista-pulo.png` — Pulo completo (4×2)

Anexar: `leiturista-ficha.png`.

```
Folha 4×2 (8 quadros) só com o MENINO LEITURISTA, vista lateral, voltado para a DIREITA, mostrando UM PULO COMPLETO em ordem, com o celular na mão direita e a bolsa a tiracolo balançando.

Quadros:
1. Agachado, joelhos bem dobrados, braços para trás, preparando o pulo.
2. Decolagem: corpo esticado para cima e para a frente, só a ponta dos pés saindo do chão, um braço subindo.
3. Subindo: joelhos recolhidos, celular levantado, expressão animada.
4. Quase no topo: corpo encolhido, braços abertos.
5. Topo do pulo: flutuando, pernas encolhidas, sorrindo, boné e cabelo levantados.
6. Começando a cair: pernas começando a se esticar para baixo.
7. Descendo: pernas esticadas para baixo, braços abertos para equilíbrio.
8. Prestes a pisar: pés quase tocando o chão, joelhos começando a flexionar.

Mesma escala em todos os quadros; o corpo do menino sempre na mesma coluna central de cada célula.
```

Uso: pulo baixo e pulo alto (mais quadros entre a subida e a descida).

---

## 7. `leiturista-caminhada.png` — Caminhada (4×2)

Anexar: `leiturista-ficha.png`.

```
Folha 4×2 (8 quadros) só com o MENINO LEITURISTA, vista lateral, voltado para a DIREITA, CAMINHANDO tranquilo (não correndo), olhando de relance para o celular na mão direita. Ciclo de caminhada contínuo de 8 quadros, em ordem: contato do pé da frente, apoio, passagem, impulso — e depois o mesmo com a outra perna. O quadro 8 deve encaixar suavemente no quadro 1 (o ciclo se repete sem salto). Braços balançando de leve, bolsa oscilando pouco, cabeça na mesma altura com uma pequena subida e descida. Os pés que tocam o chão ficam na mesma linha em todos os quadros.
```

Uso: caminhada na cena final (hoje usa a corrida em câmera lenta).

---

## 8. `leiturista-gestos.png` — Leitura, turbo, escudo e comemorações (4×2)

Anexar: `leiturista-ficha.png`.

```
Folha 4×2 (8 quadros) só com o MENINO LEITURISTA, vista lateral, voltado para a DIREITA, cada quadro uma pose diferente:

1. Lendo o hidrômetro: braço estendido à frente apontando o celular como quem escaneia, olhando para o celular, corpo inclinado para a frente.
2. Leitura concluída: olhando o celular e sorrindo, com a outra mão fazendo joinha (polegar para cima).
3. Leitura perfeita: soco no ar comemorando, punho fechado para o alto, boca aberta de alegria.
4. Turbo: corrida em disparada, tronco muito inclinado para a frente, braços para trás, expressão determinada.
5. Escudo: postura firme e corajosa, uma palma aberta estendida à frente (como se segurasse um escudo invisível), olhar sério.
6. Acenando: uma mão levantada acenando, sorriso largo.
7. Rota concluída: pulando de alegria, os dois braços para o alto, celular na mão, olhos fechados de felicidade.
8. Fugindo do cão: correndo em disparada olhando assustado por cima do ombro para trás, boca aberta.

Sem efeitos de luz, aura ou linhas de velocidade: só o personagem.
```

Uso: leitura do hidrômetro, power-ups, alerta do cão e conclusão.

---

## 9. `hidrometros.png` — Hidrômetros (2×2)

Anexar: `leiturista-ficha.png` (para o azul).

```
Folha 2×2 (4 quadros) com HIDRÔMETROS residenciais de água, desenho 2D cartoon no mesmo estilo dos personagens (contorno grosso azul-marinho escuro, cores chapadas com sombreado simples), vistos DE FRENTE, redondos, de tamanho igual em todos os quadros, centralizados na célula.

Cada hidrômetro: aro externo grosso ciano-claro brilhante, corpo azul (o MESMO azul da camisa do menino), mostrador circular branco com marcações finas nas bordas, e um visor retangular PRETO, VAZIO e liso na metade de baixo do mostrador (o jogo escreve o número ali depois — não desenhe números). SEM ponteiro (o jogo desenha o ponteiro depois).

Quadros:
1. Hidrômetro comum.
2. Hidrômetro OURO: aro e corpo dourados, uma pequena estrela amarelo-clara no canto superior direito.
3. Hidrômetro com vazamento: igual ao comum, com uma gota d'água azul escorrendo pela lateral e uma luz vermelha pequena no aro.
4. Hidrômetro lido: igual ao comum, com um selo redondo verde com um "check" branco no canto superior direito.
```

Uso: quadros 1 e 2 já; 3 e 4 reservados para futuros efeitos (anomalia e leitura feita).

---

## 10. `obstaculos.png` — Obstáculos (3×2)

```
Folha 3×2 (6 quadros) com OBSTÁCULOS de calçada de uma cidade brasileira, desenho 2D cartoon no mesmo estilo dos personagens (contorno grosso azul-marinho escuro, cores chapadas com sombreado simples), vista lateral, apoiados numa linha de chão imaginária (a mesma altura em todos os quadros da mesma fileira). ESCALA REAL ENTRE ELES: use 4 pixels por unidade e as medidas de largura × altura abaixo (em unidades) para as proporções; nenhum objeto pode ficar cortado.

Quadros:
1. CONE de sinalização laranja com duas faixas brancas e base preta quadrada — 42 × 52.
2. MANGUEIRA verde de jardim enrolada no chão em duas voltas, com esguicho amarelo e cinza na ponta — 92 × 22 (bem baixa e comprida).
3. LIXEIRA verde com tampa mais escura, duas rodinhas pretas e o símbolo de reciclagem branco — 52 × 65.
4. POÇA D'ÁGUA no chão, oval bem achatada, azul com reflexo branco e uma ondinha — 96 × 14 (quase rente ao chão).
5. BARREIRA DE OBRA: tábua horizontal laranja com listras brancas diagonais sobre dois pés de madeira marrom, e uma luz de sinalização amarela APAGADA (sem brilho) no topo — 70 × 74.
6. CAIXOTE DE MADEIRA com tábuas, travessas em X e pregos — 58 × 58.
```

Uso: substitui os obstáculos vetoriais. As proporções acima são as das caixas de colisão do jogo.

---

## 11. `powerups.png` — Power-ups (3×1: três colunas, uma linha)

```
Folha com 3 colunas × 1 linha (3 quadros lado a lado, alinhados pelo centro vertical) com EMBLEMAS de power-up, desenho 2D cartoon no mesmo estilo dos personagens (contorno grosso azul-marinho escuro, cores chapadas com sombreado simples), vistos DE FRENTE, cada um dentro de um medalhão redondo do MESMO tamanho, sem brilho, aura nem raios ao redor.

1. TURBO: medalhão amarelo com um tênis esportivo de corrida com asinhas e um raio dourado.
2. ESCUDO: medalhão azul (o mesmo azul da camisa do menino) com um escudo branco com contorno azul-marinho e uma gota d'água azul-clara no centro.
3. OSSO: medalhão creme com um osso de desenho animado marrom-claro (cor de osso) com contorno escuro.
```

Uso: substitui os emblemas vetoriais (turbo, escudo, osso).

---

## 12. `capa-nova.png` — Capa do jogo no Hub (sem fundo magenta)

Anexar: `leiturista-ficha.png`, `cao-ficha.png`, `kombi.png` e `Logo_completo.png`.

```
Ilustração de CAPA para o jogo "Jogo do Leiturista — SEMAE" (proporção 16:9), desenho 2D cartoon colorido para crianças, NÃO usar fundo magenta (este é um cenário completo).

Cena: rua ensolarada de um bairro de Piracicaba (SP) com casinhas coloridas de janelas e portas, palmeiras e árvores, o Rio Piracicaba e colinas ao fundo com alguns prédios da cidade, céu azul com nuvens. No primeiro plano o MENINO LEITURISTA (idêntico à ficha) correndo para a DIREITA, sorrindo, com o celular na mão; logo atrás dele o CÃO CARAMELO (idêntico à ficha) galopando, língua de fora, alegre; ao fundo, à direita, a KOMBI BRANCA do SEMAE (idêntica à imagem anexa). Um hidrômetro azul grande e brilhante flutuando à frente do menino, como item a coletar.

Cores oficiais do SEMAE em destaque: azul #005E9F e verde #4E9959 (como no logotipo anexo), com amarelo como cor de apoio.

Título no alto à direita, em letras grandes, arredondadas e brancas com contorno azul-marinho: "JOGO DO LEITURISTA" e, abaixo, "SEMAE". Se o texto sair com letras erradas, gere OUTRA versão idêntica SEM NENHUM TEXTO, deixando o espaço do título livre (eu coloco o texto depois).
```

Uso: substitui `capa.jpg` no Hub (1376×768 hoje).

---

## Prompt de correção (quando a folha vier torta)

```
Refaça a folha inteira mantendo os mesmos personagens e poses, mas corrigindo: (1) fundo magenta #FF00FF 100% chapado, sem chão e sem sombras; (2) grade regular de células iguais, com todos os quadros do mesmo tamanho e sem encostar nas bordas nem uns nos outros; (3) mesma escala do personagem em todos os quadros; (4) sem textos, números, linhas de movimento ou efeitos soltos.
```

## O que conferir antes de me mandar cada arquivo

- Fundo magenta uniforme (sem manchas, sem degradê).
- Quantidade de quadros exata da grade, todos inteiros e sem tocar nas bordas ou uns nos outros.
- Personagem com o mesmo tamanho em todos os quadros e o mesmo azul da ficha.
- Nada de texto, número ou efeito solto.
- Nas folhas de composição (Kombi + menino, cão + menino): a Kombi idêntica nos 4 quadros.

## Depois que você mandar

Eu estendo o `scripts/preparar_sprites.py` para as folhas novas, aplico o mesmo azul oficial, integro cada quadro ao jogo, corrijo a velocidade da animação na abertura e rodo toda a bateria de testes. Publicar de novo só com o seu "pode publicar".
