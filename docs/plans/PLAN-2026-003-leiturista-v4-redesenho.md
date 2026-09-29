# PLAN — Jogo do Leiturista v4.0.0

**Plan ID:** PLAN-2026-003
**Spec ID:** SPEC-2026-003
**Status:** DRAFT

## 1. Arquitetura

```
src/
  index.html            modelo com marcadores <!--CSS--> e <!--JS-->
  css/                  base, tema, hud, menu, painel, legenda (cada ≤200 linhas)
  js/
    principal.js        composição (única que conhece todas as camadas)
    config/             constantes, rotas, padroes, temas, uniformes
    nucleo/             prng, util, laco (rAF por tempo), eventos
    simulacao/          PURA, sem DOM: mundo, jogador, cao, geracao, medidores,
                        colisoes, pontuacao, powerups, fases, kombi, passo, retomada
    persistencia/       assinatura, armazenamento, salvamento, migracao, arquivo
    render/             camera, camadas (pré-renderizadas), cenario, sprites/*, efeitos
    cena-final/         retrospectiva e encerramento narrativo
    audio/              motor, efeitos, musica
    interface/          hud, menu, fases, resultado, ajuda, aviso, pausa
    entrada/            ponteiro, teclado
    integracao/         portal (postMessage)
scripts/construir.mjs   limite de linhas → esbuild (IIFE, ES2020) → index.html
tests/unidade/          node --test (simulação, persistência, rotas, padrões, robô)
tests/e2e/              Chrome headless por CDP (viewports, console, hub, custo)
```

Fluxo de dados: `laco` chama `simulacao.passo(dt, entrada)`, que devolve eventos; `render`, `interface` e `audio` consomem os eventos e o estado somente-leitura. Nenhuma camada de saída altera a simulação.

## 2. Contratos

- `criarSimulacao({ rotas, progresso, semente }) → sim`; `sim.passo(dt)`; `sim.entrada.pular()/soltar()`; `sim.eventos` (fila consumida a cada quadro).
- `Camera.ajustar(larguraCss, alturaCss, dpr, leve) → { L, A, escala, chaoY, pxRatio, backingW, backingH }`.
- Save: envelope v2 inalterado; `salvamento.validar(d)`, `migrar(d1)`, `montar(progresso, sim)`.

## 3. Decisões de desempenho

- Camadas de cenário (céu, silhuetas, casas, calçada) em canvases fora de tela por fase e por resolução; por quadro: poucas `drawImage`.
- Sprites de hidrômetro, power-up e obstáculos em cache; leiturista e cão desenhados por caminhos vetoriais (poucos traços).
- Pools de partículas e de textos flutuantes; nenhum `filter`/`map` que aloque por quadro no caminho quente.
- HUD em DOM atualizado somente na mudança de valor; sem `backdrop-filter`.

## 4. Riscos

- R-001: mudança grande de arte e código de uma vez. Mitigação: simulação testada por robô antes de qualquer tela; captura de tela por viewport a cada etapa.
- R-002: dispositivos físicos indisponíveis. Mitigação: medição por proxy (rasterização por CPU) e declaração explícita da limitação.
- R-003: XP no hub. Mitigação: envio apenas na vitória, testado com pai simulado; sem teste contra produção.

## 5. Rollback

`versoes-preservadas/v3.4.0-no-ar/index.html` (SHA-256 `B401F5AC…DDA89`) e histórico de deploys do Cloudflare Pages.

## 6. Implantação

Fora de escopo até pedido explícito. Quando pedido: staging do `public/` do hub com apenas este arquivo trocado, conferência por hash (memória do projeto: publicar-hub-semae-educa).

## 7. Decisões pendentes

Q-001, Q-002, Q-003 da SPEC-2026-003.
