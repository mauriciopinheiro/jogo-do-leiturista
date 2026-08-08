---
name: auditoria-integridade-fontes
description: "Verifica se o pacote unificado preserva as três fontes originais e se as cópias ativas continuam íntegras. Use ao instalar, redistribuir ou auditar este pacote."
---

# Skill: Auditoria de integridade das fontes

As fontes originais ficam em `_fontes_originais/` e as expansões em `_fontes_expandidas/`. O arquivo `INVENTARIO-INTEGRIDADE.json` registra hashes SHA-256.

Execute `python scripts/verificar_integridade_pacote.py`. Qualquer divergência invalida a afirmação de preservação integral até ser explicada e corrigida.
