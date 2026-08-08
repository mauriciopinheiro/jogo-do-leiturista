---
name: diretrizes-codigo-200-linhas
description: "Aplica integralmente as Diretrizes Globais Aprimoradas de Código, especialmente completude, modularidade, português brasileiro e limite obrigatório de 200 linhas. Use sempre que código for criado, alterado, revisado ou auditado."
---

# Skill: Diretrizes globais de código

A fonte normativa integral é `docs/diretrizes-globais-codigo-aprimoradas-ptbr.md`. Ela não pode ser substituída por este resumo.

## Gates

- máximo 200 linhas físicas em cada arquivo manual de código;
- arquivos de 160–200 linhas exigem revisão de crescimento;
- sem minificação/compactação artificial para caber no limite;
- implementação completa, sem TODO funcional, elipse ou pseudocódigo no lugar do solicitado;
- validar entradas, autorização, erros, segredos, dados sensíveis e dependências;
- testes determinísticos e adequados ao risco;
- documentação e comandos coerentes com o código real;
- nunca declarar execução/teste/implantação não observados.

Execute `python scripts/verificar_limite_200_linhas.py` antes de concluir alterações de código.
