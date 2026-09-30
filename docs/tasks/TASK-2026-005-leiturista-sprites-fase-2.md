# TASK — Integrar os sprites da fase 2

**Task ID:** TASK-2026-005 · **Plan:** PLAN-2026-005 · **Spec:** SPEC-2026-005 · **Status:** DONE (implementação, evidências e aprovação do demandante em 2026-09-29)

Cobertura: REQ-301 a REQ-312; AC-301 a AC-311.

Arquivos: `scripts/preparar_sprites.py`, `scripts/sprites/*`, `src/assets/*.webp`, `src/js/config/quadros-sprites.js`, `src/js/config/constantes.js`, `src/js/render/{cenas,entidades,renderizador}.js`, `src/js/render/ilustracoes/*`, `src/js/simulacao/{kombi,criar,colisoes}.js`, `src/js/cena-final/coreografia.js`, `tests/**`, `README.md`, `docs/arte/*`.

Verificação: `npm run construir && npm test && npm run testar:e2e && npm run verificar:sprites && python scripts/verificar_limite_200_linhas.py`.

Parar se: for preciso mudar regra de jogo/pontuação, ou se o HTML passar de 2 MB.

## Completion Evidence

- Change Set ID: CS-2026-005 (`.sdd/traceability.yml`)
- Tests: ver `docs/evidencias/EVID-2026-005.md`
- Notes: `leiturista-gestos.png` entregue e integrado após a aprovação; publicação autorizada pelo demandante (ver EVID-2026-005, seção Publicação).
