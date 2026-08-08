# Governança unificada — Antigravity

Esta regra deve ser **Always On** junto com `01-diretrizes-globais-codigo-aprimoradas-ptbr.md` e, para a frente SEMAE, `00-semae-gamificacao-normativa.md`.

## Três autoridades complementares

1. **Especificação CTI/SEMAE v1.1** governa requisitos de produto, jogo, Hub, ranking, hospedagem, homologação e publicação.
2. **SDD AI Governance Kit** governa autorização, especificação, planejamento, tarefas, Change Sets, rastreabilidade por linha, evidência, revisão e gates de CI.
3. **Diretrizes Globais Aprimoradas de Código** governam qualidade de implementação, completude, segurança, modularidade, testes, observabilidade, documentação e o limite inviolável de 200 linhas por arquivo manual de código.

Nenhuma autoridade substitui outra. A execução deve satisfazer a **interseção das três**. Se houver conflito material impossível de satisfazer simultaneamente, não improvisar: registrar a divergência, indicar os trechos conflitantes e interromper somente a parte bloqueada.

## Sequência obrigatória para alteração de código

1. Identificar a especificação governante e os requisitos/ACs afetados.
2. Aplicar `docs/sdd/SDD-POLICY.md`; confirmar Spec APPROVED, plano, tarefa e Change Set.
3. Aplicar integralmente `docs/diretrizes-globais-codigo-aprimoradas-ptbr.md`.
4. Para SEMAE, mapear seções da especificação v1.1 e itens do Anexo A.
5. Implementar a menor mudança completa, segura, testável e sem omissões.
6. Atualizar `.sdd/traceability.yml` com linhas exatas alteradas.
7. Executar testes, validações de SDD, auditorias SEMAE e verificação de 200 linhas.
8. Só declarar conclusão com evidências observadas, IDs de rastreabilidade e zero gate obrigatório falhando.

## Invariantes de integração

- Arquivo manual de código: **máximo 200 linhas físicas**.
- Código essencial nunca pode ser omitido, reduzido a TODO ou pseudocódigo.
- Segurança e integridade têm prioridade máxima.
- Português brasileiro é preferencial quando o ecossistema/contrato não exigir outro idioma.
- Não inventar requisito, resultado de teste, credencial, API, versão ou validação.
- Mudança protegida sem rastreabilidade SDD é não conformidade.
- Requisito SEMAE sem evidência de Anexo A, quando aplicável, é não conformidade.
- A existência das fontes originais em `_fontes_originais/` é parte da auditabilidade do pacote.
