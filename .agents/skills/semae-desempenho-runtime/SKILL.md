---
name: semae-desempenho-runtime
description: "Otimiza e valida desempenho dos jogos SEMAE segundo FPS, carregamento, memória, áudio e latência de save, aplicando loop rAF, delta-time, pooling, modo leve e rede assíncrona."
---

# Skill: Desempenho de runtime

## Metas e mínimos

| Métrica | Alvo | Mínimo aceitável |
|---|---:|---:|
| FPS computador | 60 | 45 |
| FPS celular intermediário | 45 | 30 |
| Tela inicial em 4G | 2 s | 4 s |
| Jogável após “iniciar” | 1 s | 2 s |
| Memória da aba | 150 MB | 250 MB |
| Vozes simultâneas | 32 computador | 16 celular |
| Gravação do save | imperceptível | 100 ms |

Mínimos são gate no aparelho de referência. Alvos orientam otimização.

## Técnicas obrigatórias

1. Um único `requestAnimationFrame`.
2. Simulação avança por **tempo decorrido**, não por contagem de frames.
3. Clampear delta para evitar salto após background.
4. Redesenho do mundo no Canvas; não recriar DOM por quadro.
5. Painel DOM atualiza apenas quando dado muda.
6. Teto de agentes simultâneos.
7. Reaproveitamento/pooling de objetos quando criação contínua causar GC.
8. Modo leve automático em touch/largura reduzida: menos áudio, sem convolução, menos decoração, maior janela de áudio.
9. Suspender loop e áudio em aba oculta.
10. Não ler propriedades que forçam layout dentro do loop.
11. Rede assíncrona e fora do caminho crítico; ranking e score nunca seguram partida/tela inicial.

## Padrão de loop

Separar `update(delta)` de `render()`. Definir `MAX_DELTA` e zerar/acertar timestamp ao retomar. Não usar `setInterval` como motor principal da simulação.

## Instrumentação

Em build de diagnóstico, registrar: FPS p50/p95 baixo, frame time, contagem de agentes, memória quando API disponível, tempo de boot, tempo até jogável, duração do save, vozes ativas e falhas de rede. Logs não devem carregar dados pessoais.

## Perfil de teste

Testar cena leve, cena média e pior caso; desktop de rede municipal; Android intermediário; retrato/paisagem; rede 4G/limitada; aba indo para background; sessão longa suficiente para detectar vazamento.

## Correção de regressão

Não reduzir conteúdo pedagógico ou acessibilidade como primeira resposta. Preferir: reduzir trabalho por frame, cachear cálculo, pooling, limitar partículas/agentes decorativos, simplificar efeitos no modo leve, reduzir reflow e desacoplar rede.
