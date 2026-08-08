---
name: governanca-unificada
description: "Aplica conjuntamente SEMAE v1.1, SDD AI Governance Kit e Diretrizes Globais de Código. Use em qualquer desenvolvimento, manutenção, revisão, migração, auditoria, homologação ou release deste workspace."
---

# Skill: Governança unificada

Leia e aplique, sem resumir como substituição, estas fontes: `docs/especificacao-fonte-v1.1.md`, `docs/sdd/SDD-POLICY.md` e `docs/diretrizes-globais-codigo-aprimoradas-ptbr.md`.

Antes de código, produza o encadeamento Spec → REQ → AC → Plan → Task → Change Set e identifique os itens SEMAE/Anexo A afetados. Durante a implementação, preserve o limite de 200 linhas por arquivo manual. Depois, atualize rastreabilidade por linha, rode validações aplicáveis e reporte somente evidência observada.

Se uma regra material das três fontes não puder ser satisfeita simultaneamente, registre conflito explícito; não improvise nem silencie a divergência.
