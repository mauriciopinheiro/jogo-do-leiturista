# SPEC — Personagens ilustrados (sprites) e refino do vetorial

**Spec ID:** SPEC-2026-004
**Status:** DRAFT
**Owner:** CTI SEMAE Piracicaba (demandante: Maurício Pinheiro)
**Created:** 2026-09-29
**Risco:** moderado (arte e desenho; sem alteração de regras, save ou integração com o Hub)

## 1. Problema

Depois da v4.0.0 o demandante avaliou que os personagens (leiturista e cão), desenhados por código a partir de formas geométricas, estão "muito, mas muito feios". O demandante gerou ilustrações no ChatGPT seguindo um roteiro de prompts: ficha e quadros de corrida/ações do leiturista, ficha, galope e ações do cão, e quatro poses da cena final (leiturista e cão juntos). Os arquivos estão em `imagens/` (PNG, fundo magenta #FF00FF, 1,5–1,7 MB cada).

## 2. Goals

- G-201: Usar as ilustrações como personagens do jogo (corrida, pulo, tropeço, parado, vitória, aterrissagem; cão galopando, sentado, investindo) e na cena final.
- G-202: Preservar uniformes por leituras vitalícias (5 variações) e toda a jogabilidade.
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

### REQ-203 — Uniformes
Os 5 uniformes MUST continuar selecionáveis e visualmente distintos (recolorização do azul das ilustrações em tempo de execução, sem ilustrações extras).

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

## 5. Critérios de aceite

- AC-201: teste unitário da escolha de quadro (todos os estados) e de espelhamento.
- AC-202: verificação automática do recorte: nenhum pixel com matiz magenta opaco; contorno preservado; pés alinhados (±2 px) em cada ciclo.
- AC-203: 5 uniformes geram imagens distintas (diferença média de cor entre variantes acima de um limite) e a variante 0 é idêntica à original.
- AC-204: cena final percorre as 5 cenas sem erro e mostra as poses ilustradas (captura de tela revisada).
- AC-205: e2e de custo e de peso passam com os limites de REQ-205.
- AC-206: e2e com as imagens bloqueadas (`Image` falhando) joga uma rota completa com console limpo.
- AC-207: README e evidência contêm a proveniência.
- AC-208: capturas de tela dos objetos vetoriais revisadas; e2e de custo continua passando.

## 6. Dados e segurança

As imagens são estáticas, embutidas como `data:` URI no HTML gerado; nenhuma requisição externa. Nenhum dado pessoal.

## 7. Questões em aberto

- [ ] Q-201: Política institucional para uso de imagens geradas por IA e crédito exigido (CTI Anexo A item 17). Decisão do demandante/coordenação.
- [ ] Q-202: Manter `imagens/` (10 MB de PNG originais) fora do Git ou versionar? Padrão adotado: fora do Git; somente os recortes otimizados entram.

## 8. Aprovação

**Approved by:** (pendente — não preenchido pelo agente)
