---
name: semae-auditoria-conformidade
description: "Audita um repositório/jogo contra 100% da Especificação v1.1, produz matriz de não conformidades, evidências, severidade e plano de correção. Use em inventário, revisão de PR, pré-homologação ou manutenção."
---

# Skill: Auditoria integral de conformidade

## Objetivo

Produzir uma avaliação rastreável, sem declarar “conforme” por impressão. A auditoria cobre **todas** as seções da v1.1 e o Anexo A.

## Etapas

1. Ler versão/README/registro de decisões.
2. Identificar arquitetura e dependências.
3. Verificar tamanhos/formatos.
4. Verificar UI, breakpoints, acessibilidade e áudio.
5. Verificar minimização, save, import/export, migração e offline.
6. Verificar serviço de ranking, RLS, endpoint, rate limit, temporadas e opt-in/out.
7. Verificar segurança do cliente e, quando no escopo, do Hub.
8. Medir performance na matriz de referência.
9. Executar simulação se aplicável.
10. Rodar partida completa com console observado, rede desligada e rede instável.
11. Preencher 25 itens do Anexo A.
12. Produzir backlog de não conformidades.

## Formato do achado

- ID: `SEMAE-<seção>-NN`.
- Requisito-fonte.
- Status: `CONFORME / NÃO CONFORME / NÃO VERIFICADO / N/A JUSTIFICADO`.
- Severidade.
- Evidência: arquivo/linha, screenshot, log, métrica ou passo reproduzível.
- Risco/impacto.
- Correção proposta.
- Teste de aceite da correção.
- Responsável sugerido por domínio.

## Regras

- Scanner estático gera pista, não aprovação final.
- “Não verificado” não equivale a “conforme”.
- N/A somente quando o próprio texto condiciona aplicabilidade ou a funcionalidade não existe e isso não remove requisito obrigatório.
- Ambiguidade normativa deve apontar `docs/AMBIGUIDADES-NORMATIVAS.md`.
- Item do Anexo A falho = bloqueio de publicação salvo exceção formal.

## Scripts auxiliares

- `scripts/auditar_html.py <arquivo.html>`: checagens estáticas heurísticas.
- `scripts/auditar_pacote.py <pasta>`: formatos/tamanhos.
- `scripts/auditar_save.py <save.json> <app> <versaoEsquema>`: envelope e limites básicos.

Execute com `--help` primeiro. Scripts não substituem testes de dispositivo, segurança dinâmica ou homologação.
