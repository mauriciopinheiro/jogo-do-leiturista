# SPEC — Sprites da fase 2: pulo, caminhada, cão, Kombi e sequências

**Spec ID:** SPEC-2026-005
**Status:** DRAFT (implementada em 2026-09-29; evidência em `docs/evidencias/EVID-2026-005.md`; **aprovação humana pendente**)
**Owner:** CTI SEMAE Piracicaba (demandante: Maurício Pinheiro)
**Created:** 2026-09-29
**Risco:** moderado (arte e desenho; a simulação ganha subestágios e tempos, sem mudar regras, pontuação, save ou Hub)

## 1. Problema

Depois da v4.1.0 restavam movimentos sem sprite: pulo com uma só pose de subida e uma de descida, caminhada
sem ciclo, cão latindo parado enquanto se move, cão sem reação ao osso, Kombi vetorial, o menino que aparece do
nada ao lado da Kombi e some ao chegar à porta, e a derrota sem cena (5 s de tropeço piscando). O demandante gerou
no ChatGPT as folhas pedidas em `docs/arte/PROMPTS-SPRITES-FASE-2.md`, **exceto** `leiturista-gestos.png`
(não entregue), hidrômetros, obstáculos e power-ups (mantidos vetoriais por escolha do demandante).

## 2. Goals

- G-301: Usar as novas folhas no jogo: pulo completo, caminhada, cão latindo correndo/investindo/com o osso,
  Kombi ilustrada e as três sequências com dois personagens (descer da Kombi, entrar na Kombi, derrota).
- G-302: Manter a reserva vetorial (sem imagem, o jogo continua jogável).
- G-303: Manter o arquivo único ≤2 MB e cada atlas ≤300 KB, com o custo por quadro ≤4,5 ms.
- G-304: Corrigir defeitos encontrados no caminho (cadência das pernas nos trechos da Kombi; evento de power-up).

## 3. Non-goals

- NG-301: Alterar caixas de colisão, física, pontuação, dificuldade, save ou mensagens ao Hub.
- NG-302: Ilustrar hidrômetros, obstáculos e power-ups, ou usar poses de gestos (folha não entregue).
- NG-303: Publicar sem pedido explícito.

## 4. Requisitos

### REQ-301 — Pulo completo
O sistema MUST escolher o quadro do pulo pela velocidade vertical e pela altura do pé (decolagem, subida, topo, queda,
pré-pouso), percorrendo os quadros **em ordem, sem voltar atrás**, tanto no pulo alto quanto no baixo.

### REQ-302 — Caminhada
A pose "anda" MUST usar o ciclo de 8 quadros de caminhada, com cadência proporcional à distância caminhada.

### REQ-303 — Cão
O cão MUST latir correndo (quadros de latido, não parado), usar o quadro de salto na investida e mostrar
farejar → pegar → trotar com o osso por 1,8 s quando o power-up osso é coletado; sentado vale mais que o osso e latir vale mais que investir.

### REQ-304 — Kombi ilustrada
A Kombi MUST ser desenhada com as ilustrações (parada, porta aberta, andando com dois quadros de roda), com sombra, e
o vetor como reserva. A frente da van fica em `x + 176 u` e as rodas em `chaoY + 23 u`.

### REQ-305 — Descer da Kombi
Na abertura, depois de a Kombi parar, MUST haver uma sequência de 1,2 s (subestágio `saindo`) com o menino descendo (4 quadros),
sem o menino desenhado à parte; a Kombi MUST parar no ponto em que o menino termina a sequência 25 u antes da linha de largada, sem correr para trás.
Tocar para pular a abertura MUST continuar levando direto à corrida, em qualquer subestágio.

### REQ-306 — Entrar na Kombi
No encerramento o menino MUST correr até a porta da Kombi e, ao chegar, mostrar uma sequência de 1,0 s (subestágio `entrando`, 3 quadros) antes de a Kombi partir com ele.

### REQ-307 — Derrota
Ao ser alcançado, o menino MUST ser mostrado na sequência do cão que o derruba e o lambe (4 quadros em 1,4 s, tom amigável, sem violência), com o respiro
de derrota ≥ a sequência (1,6 s) antes da tela de resultado; obstáculos na área da cena MUST ser omitidos.

### REQ-308 — Cadência das pernas
Nos trechos da abertura (desembarque, cão) e do embarque, a fase das pernas MUST crescer proporcional à distância percorrida (0,22 rad/u no menino, 0,24 rad/u no cão), como na corrida.

### REQ-309 — Evento de power-up
Coletar um power-up MUST emitir o evento `powerup` (som e faíscas), com o campo `qual` (`turbo`, `escudo` ou `osso`); o campo `tipo` do evento não pode ser sobrescrito.

### REQ-310 — Peso, custo e recorte
Cada atlas MUST ter ≤300 KB, o `index.html` ≤2 MB e o custo médio por quadro sem GPU ≤4,5 ms (paisagem/retrato ≤1,5). Os quadros MUST estar sem fundo magenta e
com a camisa no azul oficial do SEMAE (REQ-209 da SPEC-2026-004), inclusive a faixa azul da Kombi.

### REQ-311 — Capa
A nova capa (`docs/arte/capa-jogo.jpg`, 1376×774) MUST estar pronta para substituir a do Hub; a troca no Hub depende de publicação autorizada.

## 5. Critérios de aceite

- AC-301: teste unitário e e2e da abertura: subestágios `chegada → saindo → desembarque → partida → cão → corrida`, saída de 1,2 s, menino não desenhado à parte, Kombi parando em `jogadorX + 22,5 − 145 − 25`, sem correr para trás; pular a abertura funciona em qualquer subestágio.
- AC-302: teste unitário e e2e do encerramento: `chegada → embarque → entrando → saida`, `entrando` de 1,0 s só depois de chegar à porta.
- AC-303: teste unitário (respiro ≥ duração da sequência) e e2e (a tela muda durante a sequência da derrota).
- AC-304: e2e com as imagens bloqueadas percorre abertura, encerramento e derrota sem erro de console.
- AC-305: testes unitários da escolha de quadros (pulo em ordem alto/baixo, caminhada, latido, investida, osso, Kombi, sequências) e de que todo quadro escolhido existe no atlas.
- AC-306: teste unitário da cadência (0,22 rad/u no desembarque).
- AC-307: teste unitário do evento de power-up.
- AC-308: `npm run verificar:sprites` nos 12 atlas (recorte limpo, pés/teto alinhados, ≤300 KB, camisa no azul oficial).
- AC-309: e2e de custo e de peso dentro dos limites.
- AC-310: `docs/arte/capa-jogo.jpg` existe com as dimensões e o peso combinados.

## 6. Dados e segurança

Imagens estáticas embutidas como `data:` URI; nenhuma requisição externa; nenhum dado pessoal. Os originais de IA estão versionados em `imagens/` (decisão do demandante, SPEC-2026-004 Q-201/Q-202).

## 7. Questões em aberto

- [ ] Q-301: `leiturista-gestos.png` (leitura do hidrômetro, turbo, escudo, comemorações, olhar para trás) não foi entregue; sem ele essas poses seguem sem sprite.
- [ ] Q-302: A van sozinha (`kombi.png`) e as folhas com o menino diferem alguns por cento (porta, logotipo). Regerar `kombi.png` a partir da van de `kombi-descer.png` eliminaria o deslocamento visível na troca.
- [ ] Q-303: Na `derrota.png` o tamanho relativo menino/cão difere das fichas (ver `docs/arte/CALIBRACAO-DE-ESCALA.md`).

## 8. Aprovação

**Approved by:** (pendente — não preenchido pelo agente)
