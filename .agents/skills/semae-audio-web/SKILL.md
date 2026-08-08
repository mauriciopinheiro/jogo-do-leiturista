---
name: semae-audio-web
description: "Implementa e valida áudio sintetizado com Web Audio API segundo o padrão SEMAE, incluindo controles, gesto inicial, níveis, envelopes, compressor e suspensão em background."
---

# Skill: Áudio Web Audio

## Requisitos

- Trilha e efeitos sintetizados em Web Audio; sem arquivos de áudio.
- Música e efeitos com controles independentes, sempre visíveis, estado indicado.
- Criar/retomar contexto de áudio somente após gesto do usuário.
- Pico abaixo de `0,85`.
- Volume médio entre `-18` e `-21 dBFS`.
- Compressor no barramento final.
- Percussões: ataque mínimo de `3 ms` e envelope com rampa até zero, evitando clique/estalo.
- Suspender contexto quando aba perde foco; retomar de modo seguro após retorno/gesto permitido.

## Arquitetura recomendada

`AudioContext` → buses de música/SFX → ganho independente → master compressor → destination. Limitar vozes pelo modo de desempenho: referência de 32 em computador e 16 em celular.

## Modo leve

Em touch/largura reduzida: menos vozes, sem convolução/reverb pesado e maior janela/buffer quando aplicável. Áudio nunca pode degradar FPS abaixo do mínimo.

## Testes

- primeira abertura sem autoplay indevido;
- controles antes/depois de iniciar;
- alternância música/SFX independente;
- múltiplos efeitos sem clipping;
- aba oculta/visível;
- celular intermediário;
- ausência de estalo em percussões e início/fim de notas;
- pico/ganho verificados por analisador durante cena mais intensa.
