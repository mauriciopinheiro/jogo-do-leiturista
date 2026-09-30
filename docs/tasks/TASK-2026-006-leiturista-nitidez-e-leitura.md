# TASK — Nitidez e leitura nas fases avançadas

**Task ID:** TASK-2026-006 · **Plan:** PLAN-2026-006 · **Spec:** SPEC-2026-006 · **Status:** DONE (implementação e evidências em 2026-09-30; publicada em 2026-09-30 com autorização do demandante)

Cobertura: REQ-401 a REQ-407; AC-401 a AC-407.

Arquivos: `src/js/render/{leitura,renderizador,entidades}.js`, `src/js/render/sprites/{cache,medidor,powerups,placa}.js`, `src/js/render/ilustracoes/{quadro,atlas,pintura}.js`,
`src/js/simulacao/{placas,ruas}.js`, `src/js/audio/efeitos-sonoros.js`, `src/js/app/janela.js`, `src/js/cena-final/personagens.js`, `src/js/config/constantes.js`, `src/css/{hud,responsivo}.css`,
`tests/unidade/{nitidez,ilustracoes}.test.js`, `tests/e2e/cenarios/13-nitidez.mjs`, `tests/mutacao/mutacoes-nitidez.mjs`.

Verificação: `npm run construir && npm test && npm run testar:e2e && npm run verificar:sprites && python scripts/verificar_limite_200_linhas.py`.

Parar se: for preciso mudar regra de jogo/pontuação/colisão, ou se o HTML passar de 2 MB ou o custo por quadro de 4,5 ms.

## Completion Evidence

- Change Set ID: CS-2026-006 (`.sdd/traceability.yml`)
- Tests: ver `docs/evidencias/EVID-2026-006.md`
- Notes: publicada no site (deploy `779e3c75`) e no GitHub (`main` = `11d0f89`) com autorização do demandante; ver EVID-2026-006, seção Publicação.
