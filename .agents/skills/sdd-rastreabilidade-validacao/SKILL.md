---
name: sdd-rastreabilidade-validacao
description: "Mantém Change Sets e rastreabilidade SDD por linha, associa testes/evidências e executa o validador de compliance."
---

# Skill: SDD — rastreabilidade e validação

Registre cada alteração protegida em `.sdd/traceability.yml` com Change Set ID, Spec, REQs, ACs, Tasks, arquivo, intervalos de linhas e evidências.

Valide com `python scripts/validate_sdd.py --base <revisao-base>` quando houver Git e uma base comparável. Sem `--base`, o script faz apenas validação estrutural; não trate isso como cobertura de diff.
