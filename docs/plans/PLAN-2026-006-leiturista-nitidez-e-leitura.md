# PLAN — Nitidez e leitura nas fases avançadas

**Plan ID:** PLAN-2026-006 · **Spec:** SPEC-2026-006 · **Status:** DONE

## Arquitetura
1. `render/sprites/cache.js`: cache por `chave@k×zoom` na escala exata; `pintarSprite` copia 1:1 em pixels inteiros (identidade + `Math.round`); o halo pulsa por `globalAlpha`.
2. `render/leitura.js` (puro): `escalaDeLeitura(k, máximo)` em pixels CSS (`k / razão`), com `definirRazaoDePixels` chamado pelo renderizador a cada redimensionamento.
3. `render/sprites/{medidor,powerups,placa}.js`: hidrômetro e rótulo ampliados por `escalaDeLeitura`; placa (novo arquivo) com nome no maior tamanho que couber ou em duas linhas.
4. `simulacao/placas.js` (puro): `adicionarPlaca` com afastamento simétrico, prioridade por hidrômetros e substituição das placas ainda invisíveis; `ruas.js` e `efeitos-sonoros.js` só avisam quando a placa entrou.
5. `render/renderizador.js`: tremor senoidal decrescente e vinheta suave; `hud.css`: contorno nítido; `app/janela.js` + `hud.css`: `--faixa-topo` na faixa de asfalto; `responsivo.css`: dica oculta com aviso no celular deitado.
6. `render/ilustracoes/{quadro,atlas,pintura}.js` e `cena-final/personagens.js`: quadros 1:1 e `FATOR_CAO_NA_CENA` para o cão avulso.

## Riscos
R-401 ampliar o texto invade o cenário → limites 1,6× / 1,35× e afastamento de 360 u entre placas; R-402 cache por `k` exato cresce com redimensionamentos → `limparSprites()` a cada redimensionamento;
R-403 avisos no asfalto competem com a dica de toque no celular deitado → dica oculta enquanto há aviso; R-404 o borrão de painel LCD não é corrigível por software → registrado como limitação.

## Rollback
A v4.2.0 publicada (deploy `4bb94dc8`, commit `0ac0faa` na `main` do GitHub) é o ponto de retorno.
