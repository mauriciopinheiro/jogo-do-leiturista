# TASK — Reescrita modular do Jogo do Leiturista (v4.0.0)

**Task ID:** TASK-2026-003
**Plan ID:** PLAN-2026-003
**Spec ID:** SPEC-2026-003
**Status:** DONE (implementação e evidências; **aprovação humana pendente**)

## Requirement Coverage

REQ-101, REQ-102, REQ-103, REQ-104, REQ-105, REQ-106, REQ-107, REQ-108, REQ-109, REQ-110, REQ-111, REQ-112

## Acceptance Criteria Coverage

AC-101 … AC-112

## Objective

Substituir o monolito `index.html` por fontes modulares em `src/` que geram o mesmo arquivo único autônomo, com nova arte, desempenho e responsividade, corrigindo os defeitos listados na SPEC e preservando mecânicas, dados e saves.

## Expected Files / Components

- `src/**`, `scripts/construir.mjs`, `scripts/verificar_limite_200_linhas.py` (ampliado), `tests/unidade/**`, `tests/e2e/**`
- `index.html` (gerado), `README.md`, `package.json`
- `versoes-preservadas/v3.4.0-no-ar/**` (não editar)

## Implementation Constraints

- ≤200 linhas por arquivo manual; português sem acento em identificadores.
- Sem dependência de execução, sem rede, sem `eval`.
- Não commitar, não publicar, não tocar o hub sem pedido explícito.

## Verification

```bash
npm run construir
npm test
npm run testar:e2e
python scripts/verificar_limite_200_linhas.py
python scripts/validate_sdd.py
```

## Stop Conditions

Parar se for preciso alterar regra de pontuação/medalha, dados de rota além de Q-001, ou publicar em produção.

## Completion Evidence

- Change Set ID: CS-2026-003 (`.sdd/traceability.yml`)
- Tests: ver `docs/evidencias/EVID-2026-003.md`
- CI: não aplicável (sem pipeline configurado neste repositório)
- Notes: ver limitações (sem aparelho físico).
