# SPEC — Personagens ilustrados (sprites) e refino do vetorial

**Spec ID:** SPEC-2026-004
**Status:** APPROVED (aprovada pelo demandante em 2026-09-29, ver §8; implementada, evidência em `docs/evidencias/EVID-2026-004.md`)
**Owner:** CTI SEMAE Piracicaba (demandante: Maurício Pinheiro)
**Created:** 2026-09-29
**Risco:** moderado (arte e desenho; sem alteração de regras, save ou integração com o Hub)

## 1. Problema

Depois da v4.0.0 o demandante avaliou que os personagens (leiturista e cão), desenhados por código a partir de formas geométricas, estão "muito, mas muito feios". O demandante gerou ilustrações no ChatGPT seguindo um roteiro de prompts: ficha e quadros de corrida/ações do leiturista, ficha, galope e ações do cão, e quatro poses da cena final (leiturista e cão juntos). Os arquivos estão em `imagens/` (PNG, fundo magenta #FF00FF, 1,5–1,7 MB cada).

## 2. Goals

- G-201: Usar as ilustrações como personagens do jogo (corrida, pulo, tropeço, parado, vitória, aterrissagem; cão galopando, sentado, investindo) e na cena final.
- G-202: Preservar toda a jogabilidade. O uniforme passa a ser **único**, na cor oficial do SEMAE (decisão do demandante em 2026-09-29, que substitui os 5 uniformes por leituras vitalícias da v3.4.0).
- G-203: Manter arquivo único, offline, ≤2 MB, com cada imagem embutida ≤300 KB (CTI §5).
- G-204: Manter o desenho vetorial como reserva quando a imagem não carregar e refinar o vetorial dos demais elementos (Kombi, hidrômetros, obstáculos, power-ups) para combinar com o novo estilo (contorno escuro, sombreado simples).
- G-205: Registrar a proveniência e os créditos das imagens (Anexo A, item 17 da CTI).

## 3. Non-goals

- NG-201: Alterar caixas de colisão, física, pontuação, dificuldade, save ou mensagens ao Hub.
- NG-202: Gerar novas imagens (a arte é fornecida pelo demandante).
- NG-203: Publicar sem pedido explícito.

## 4. Requisitos

### REQ-201 — Animação com as ilustrações
O sistema MUST escolher o quadro do leiturista e do cão pelo estado da simulação (corrida por velocidade, subida, descida, aterrissagem, tropeço, parado, vitória; galope, investida, sentado) e MUST espelhar horizontalmente quando o personagem olha para a esquerda.

### REQ-202 — Recorte limpo
Os quadros MUST estar sem fundo magenta e sem franjas visíveis sobre fundos claros e escuros; os pés MUST ficar na mesma linha de chão em todos os quadros de um ciclo.

### REQ-203 — (substituído por REQ-209)
Previa 5 uniformes por recolorização em tempo de execução; foi abandonado a pedido do demandante.

### REQ-204 — Cena final
A cena final MUST usar as poses ilustradas (mão estendida, tigela, carinho) e as animações de corrida/galope para a caminhada final, mantendo os textos aprovados.

### REQ-205 — Peso e desempenho
Cada imagem embutida MUST ter ≤300 KB, o `index.html` ≤2 MB, e o custo médio por quadro sem GPU MUST ficar ≤4,5 ms em todas as telas de referência com razão paisagem/retrato ≤1,5.

### REQ-206 — Reserva vetorial
Se uma imagem não carregar ou decodificar, o jogo MUST continuar jogável com o desenho vetorial, sem erro de console.

### REQ-207 — Proveniência
O README MUST informar que as imagens foram geradas por IA (ChatGPT) a pedido do demandante, e o SPEC MUST registrar a pendência de política institucional (Q-201).

### REQ-208 — Vetorial coerente
Kombi, hidrômetros, obstáculos e power-ups MUST ganhar contorno escuro e sombreado simples compatíveis com as ilustrações, sem aumentar o custo por quadro além de REQ-205.

### REQ-209 — Uniforme único na cor oficial do SEMAE
O leiturista MUST usar um único uniforme, cuja camisa é o azul do logotipo do SEMAE (`#005E9F`, mediana dos pixels azuis de `Logo_completo.png`). A troca de uniformes e o desbloqueio por leituras vitalícias MUST deixar de existir; boné e calça são tons mais escuros do mesmo azul (relação de tons da arte preservada) e a faixa refletiva permanece amarela. Saves da v3.4.0 com `selectedSkin` de 0 a 4 MUST continuar aceitos (o valor é ignorado e regravado como 0); o total de leituras vitalícias continua sendo contado e salvo.

## 5. Critérios de aceite

- AC-201: teste unitário da escolha de quadro (todos os estados) e de espelhamento.
- AC-202: verificação automática do recorte: nenhum pixel com matiz magenta opaco; contorno preservado; pés alinhados (±2 px) em cada ciclo.
- AC-203: (substituído por AC-209)
- AC-204: cena final percorre as 5 cenas sem erro e mostra as poses ilustradas (captura de tela revisada).
- AC-205: e2e de custo e de peso passam com os limites de REQ-205.
- AC-206: e2e com as imagens bloqueadas (`Image` falhando) joga uma rota completa com console limpo.
- AC-207: README e evidência contêm a proveniência.
- AC-208: capturas de tela dos objetos vetoriais revisadas; e2e de custo continua passando.
- AC-209: `verificar_sprites.py` mede a cor da camisa nos atlas (±10 por canal de rgb(0,94,159)) e reprova a arte original; teste unitário: saves da v3 com `selectedSkin` 0–4 são aceitos, o 5 é recusado, e o save regravado traz 0; e2e: o menu não tem o botão de uniforme; a captura de tela é revisada.

## 6. Dados e segurança

As imagens são estáticas, embutidas como `data:` URI no HTML gerado; nenhuma requisição externa. Nenhum dado pessoal.

## 7. Questões em aberto

- [x] Q-201: Política para uso de imagens geradas por IA (CTI Anexo A item 17). **Resolvida em 2026-09-29** pelo demandante, em conversa com o agente: "pode colocar imagens de ia no git, sem problemas". Nenhuma restrição adicional; o crédito segue no README. (Não há registro de política institucional da coordenação além dessa decisão.)
- [x] Q-202: Manter `imagens/` (11 MB de PNG originais) fora do Git ou versionar? **Resolvida em 2026-09-29**: versionar. A pasta `imagens/` e o `cao-galope.png` avulso da raiz (outra versão da mesma ilustração) entram no repositório.

## 8. Aprovação

**Approved by:** Maurício Pinheiro (demandante), em conversa com o agente, 2026-09-29: "aprovo, pode colocar imagens de ia no git, sem problemas, pode publicar no site e no git". Registro feito pelo agente a partir dessa mensagem; a aprovação cobre o resultado visto (personagens ilustrados, uniforme único no azul do logotipo, vetorial com contorno) e autoriza a publicação no site e no GitHub. A aprovação formal da SPEC-2026-003 (v4.0.0) não foi dada nesta mensagem e segue sem registro.
