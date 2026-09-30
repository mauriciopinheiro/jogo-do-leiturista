# SPEC — Nitidez e leitura nas fases avançadas

**Spec ID:** SPEC-2026-006
**Status:** IMPLEMENTED (demanda do usuário em conversa, 2026-09-30; publicada em 2026-09-30 por autorização do demandante, ver §8; evidência em `docs/evidencias/EVID-2026-006.md`)
**Owner:** CTI SEMAE Piracicaba (demandante: Maurício Pinheiro)
**Created:** 2026-09-30
**Risco:** baixo a moderado (só desenho e posição de avisos; a simulação ganha apenas a escolha de quais placas de rua entram na tela)

## 1. Problema

Relato do demandante sobre a v4.2.0, nas fases mais avançadas: jogo "alagado", com ghosting, smearing, ghosting inverso e
motion blur; hidrômetros ilegíveis ("tudo borrado"); placas de rua ilegíveis e **sobrepostas** (quando há muitas juntas, deve
valer a rua mais importante, a de mais hidrômetros); e o cachorro desproporcional na cena final.

Diagnóstico (medido, ver EVID-2026-006): o custo por quadro **não** cresce com a fase (2,1 a 3,4 ms sem GPU), então a lentidão
não foi reproduzida; a sensação de borrão vinha de causas de desenho:

1. Sprites guardados em cache com a escala arredondada a 0,25 e depois **reamostrados** em posições fracionárias a cada quadro
   (tremulação e "arrasto" nos itens em movimento); pulso de escala nos hidrômetros e power-ups.
2. Número do hidrômetro com ≈6 px CSS e nome da rua espremido em telas pequenas (o texto de 9 unidades a 0,7 px/u).
3. Placas de ruas curtas se acumulam na mesma faixa da tela; aviso da corrida (`FLOW ATIVADO!`, `ATRAVESSANDO A RUA…`) desenhado em cima da placa.
4. Tremor de tela aleatório a cada quadro, vinheta vermelha pulsando forte e brilho borrado (`text-shadow` de 14 px) nos avisos.
5. Na cena final o cão avulso (88 u sentado) era desenhado ao lado de quadros compostos em que o cão mede 55 u.

## 2. Goals

- G-401: Itens em movimento nítidos: sprites copiados 1:1 em pixels inteiros, sem reamostragem por quadro.
- G-402: Número dos hidrômetros e nome das placas legíveis em qualquer aparelho, medindo o tamanho **físico** (pixel CSS).
- G-403: Nenhuma placa cobre outra; na disputa fica a rua com mais hidrômetros.
- G-404: Avisos da corrida fora da área de leitura; efeitos de impacto suaves.
- G-405: Cão da cena final na proporção do menino.

## 3. Non-goals

- NG-401: Alterar caixas de colisão, física, pontuação, dificuldade, save ou mensagens ao Hub.
- NG-402: Eliminar o borrão de movimento inerente a telas LCD (tempo de resposta do painel), que o jogo não controla.
- NG-403: Aumentar o orçamento de pixels do canvas (em celulares 3× o canvas continua menor que a tela física e é ampliado pelo navegador).
- NG-404: Publicar sem pedido explícito.

## 4. Requisitos

### REQ-401 — Cópia 1:1
Sprites de cena (hidrômetro, power-up, placa, rótulo) e quadros dos atlas MUST ser copiados ao canvas em **pixels inteiros do dispositivo**, sem mudança de escala
no desenho, com cache na escala **exata** (`k`); o "pulso" dos halos usa transparência, não escala.

### REQ-402 — Leitura pelo tamanho físico
O número do hidrômetro e o nome da placa MUST nascer ampliados quando `escala` (pixels CSS por unidade) for menor que 1,15: até 1,6× (hidrômetro) e 1,35× (placa),
sem mudar a área de colisão. A ampliação MUST usar pixels CSS (`k / pxRatio`): celular 2×/3× amplia igual a um aparelho 1×.

### REQ-403 — Nome da placa
O nome MUST usar o maior tamanho de letra que caiba (18 a 14 unidades), em uma linha ou em duas linhas equilibradas.

### REQ-404 — Placas sem sobreposição
Duas placas MUST ficar a pelo menos `PLACA.largura + PLACA.folga` (360 u) uma da outra. Em conflito, a nova placa entra só se a rua tiver **mais** hidrômetros que todas as que conflitam
(empate: a mais antiga); placas ainda fora da tela são substituídas sem ninguém ver; as já visíveis ficam e a nova vai para depois delas. O aviso `ATRAVESSANDO A RUA…`, a travessia e o
som de rua nova MUST ocorrer só para a rua que ganhou placa.

### REQ-405 — Efeitos suaves
O tremor de tela MUST ser determinístico e decair até zero (≤2,6 × 1,6 u); a vinheta de ameaça MUST ter opacidade ≤0,34 e pulsar devagar; os avisos MUST usar contorno nítido, sem brilho borrado.

### REQ-406 — Avisos fora da área de leitura
Na corrida, a faixa de aviso MUST ficar na faixa de asfalto, abaixo do chão (`--faixa-topo`, calculado a cada redimensionamento), nunca sobre placas, hidrômetros ou obstáculos.
No celular deitado a dica de toque MUST ficar oculta enquanto houver aviso. A faixa da cena final (`vitoria`) continua no céu.

### REQ-407 — Cão da cena final
O cão avulso da cena final MUST ser desenhado com fator `FATOR_CAO_NA_CENA = 0,68` (cão sentado ≈ 60 u, o mesmo dos quadros compostos), inclusive sombra e pivô.

## 5. Critérios de aceite

- AC-401: teste unitário (500 sorteios e rota inteira das fases 4 e 5, com no máximo 3 placas ao mesmo tempo no mundo do teste) e e2e (4 aparelhos, fase 5 inteira): zero quadros com placas sobrepostas. No mundo de 900 u do desktop cabem até 4 placas sem se tocar; o e2e só registra a contagem.
- AC-402: e2e: o aviso da corrida nunca começa acima do chão (`getBoundingClientRect().top ≥ chaoY × escala − 1`) em celular em pé, celular deitado, tablet e desktop.
- AC-403: fotos do e2e (`tests/e2e/saida/nitidez-*.png`) revisadas: placa e hidrômetros legíveis nos 4 aparelhos.
- AC-404: teste unitário: `pintarSprite` desenha sempre em coordenadas inteiras, com `drawImage` sem largura/altura, em posições fracionárias.
- AC-405: teste unitário: `escalaDeLeitura` (limites, monotonia, tamanho mínimo do número, razão de pixels 1×/2×/3×).
- AC-406: teste unitário: `dividirNome` e proporção do cão da cena final.
- AC-407: suíte anterior sem regressão (unidade, 13 cenários e2e, custo ≤4,5 ms, HTML ≤2 MB, limite de 200 linhas).

## 6. Dados e segurança

Sem dados novos, sem rede, sem persistência. Nenhuma mudança em save, Hub ou permissões.

## 7. Questões em aberto

- [ ] Q-401: A lentidão relatada não foi reproduzida (custo plano por fase). Se persistir depois desta versão, precisamos do modelo do aparelho, do navegador e de uma gravação curta.
- [ ] Q-402: Em celulares 3× o canvas é limitado pelo orçamento de pixels (2,2 Mpx) e o navegador o amplia; aumentar o orçamento deixaria o texto mais nítido ao custo de desempenho em aparelhos fracos (decisão do demandante).

## 8. Aprovação

**Requested by:** Maurício Pinheiro (demandante), em conversa com o agente, 2026-09-30, na mensagem que descreve o problema.
Este documento registra o pedido. A publicação no site e no GitHub foi autorizada pelo demandante em conversa, em 2026-09-30 ("sim, publique", em resposta à pergunta sobre publicar); ver `docs/evidencias/EVID-2026-006.md`.
