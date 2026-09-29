# TASK — Integrar sprites ilustrados e refinar o vetorial

**Task ID:** TASK-2026-004 · **Plan:** PLAN-2026-004 · **Spec:** SPEC-2026-004 · **Status:** DONE (implementação, evidências e aprovação do demandante em 2026-09-29)

Cobertura: REQ-201 a REQ-208; AC-201 a AC-208.

Arquivos previstos: `scripts/preparar_sprites.py`, `src/assets/*.webp`, `src/js/config/quadros-sprites.js`, `src/js/render/ilustracoes/*`, `src/js/render/entidades.js`, `src/js/cena-final/*`, `src/js/render/sprites/*` (vetorial), `scripts/construir.mjs`, `tests/unidade/*`, `tests/e2e/cenarios/*`, `README.md`.

Verificação: `npm run construir && npm test && npm run testar:e2e && python scripts/verificar_limite_200_linhas.py`.

Parar se: for necessário mudar regra de jogo, ou se o peso passar de 2 MB.

## Completion Evidence

- Change Set ID: CS-2026-004 (`.sdd/traceability.yml`)
- Tests: ver `docs/evidencias/EVID-2026-004.md` (53 unitários, 11 e2e, 23 mutações, verificação dos atlas)
- CI: não aplicável (sem pipeline configurado neste repositório)
- Notes: Q-201 e Q-202 resolvidas pelo demandante em 2026-09-29 (imagens de IA no Git, sem restrições); publicação no site e no GitHub autorizada.
