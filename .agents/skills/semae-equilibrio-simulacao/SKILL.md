---
name: semae-equilibrio-simulacao
description: "Cria simulação automatizada sem interface para verificar equilíbrio de jogos de gestão e progressão SEMAE antes da homologação, registrando indicadores por ciclo e detectando metas inalcançáveis."
---

# Skill: Equilíbrio por simulação

## Aplicabilidade

Obrigatória para jogos de **gestão e progressão**. Para outros jogos, registrar se não se aplica e por quê.

## Objetivo

Executar uma partida completa sem interface, repetível, registrando indicadores por ciclo para descobrir estados inviáveis, metas inalcançáveis, espirais de falha, excesso de facilidade e dependência excessiva de sorte.

## Requisitos do simulador

- usar as mesmas regras/fórmulas de domínio do jogo sempre que possível;
- não depender de Canvas/DOM/áudio;
- aceitar seed quando houver aleatoriedade;
- executar partida completa;
- emitir CSV/JSON ou tabela com indicadores por ciclo;
- detectar violação de invariantes;
- permitir cenários/políticas de decisão diferentes;
- registrar versão do jogo e parâmetros.

## Cenários mínimos

1. estratégia conservadora;
2. estratégia agressiva;
3. estratégia “média”/heurística;
4. extremos válidos de parâmetros;
5. múltiplas seeds quando sorte afeta resultado;
6. teste de longa duração para progressão.

## Indicadores

Definir por jogo: recursos, receita/custo, demanda, qualidade, satisfação, capacidade, risco, cumprimento de meta, falhas, tempo de recuperação e qualquer KPI pedagógico essencial.

## Gate

Não homologar jogo de gestão/progressão se a simulação mostrar meta estruturalmente inalcançável, quebra determinística precoce sem alternativa plausível, exploit dominante trivial ou divergência entre fórmula simulada e jogo.

Use `resources/simulacao-template.js` como esqueleto, adaptando regras reais.
