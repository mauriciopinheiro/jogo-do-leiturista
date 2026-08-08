---
name: semae-testes-homologacao
description: "Executa a matriz mínima de dispositivos, ciclo de homologação e os 25 itens do Anexo A da Especificação de Gamificação SEMAE. Use antes de qualquer publicação e após correções relevantes."
---

# Skill: Testes e homologação

## Matriz mínima de dispositivos

- Computador da rede municipal: Windows + Chrome atualizado, 1366×768.
- Computador da CTI: Windows + Chrome e Edge, 1920×1080.
- Android intermediário: tela 6", Chrome, retrato e paisagem.
- iOS: Safari corrente.
- Tablet: uso em sala, retrato e paisagem.
- Rede: Wi-Fi da escola e 4G; testar conexão limitada.

Além disso, executar rede **desligada** e rede instável porque são requisitos explícitos do cronograma/Anexo A.

## Ciclo formal

1. Desenvolvedor entrega README, versão e registro de decisões.
2. Servidor efetivo da CTI revisa código com foco em segurança/persistência.
3. Liderança de testes executa checklist.
4. Corrigir itens reprovados.
5. Retestar itens corrigidos e regressões relacionadas.
6. Emitir parecer de homologação.
7. Publicar ficha no Hub.
8. Acompanhar 7 dias com canal aberto para defeitos.

## Anexo A — 25 gates

1. arquivo único; abre com rede desligada sem dependência externa necessária;
2. versão no arquivo e visível na tela inicial;
3. layout íntegro nos pontos de quebra, sem corte/scroll horizontal indevido;
4. touch targets e operação completa por toque;
5. contraste/legibilidade; nada só por cor;
6. legenda de símbolos;
7. áudio pós-interação, controles independentes, sem estalo/distorção;
8. save/load, inclusive arquivo exportado;
9. save adulterado e versão anterior sem quebrar app;
10. nenhum dado pessoal além do declarado;
11. FPS mínimo;
12. carregamento em 4G no limite;
13. console sem erro em partida completa;
14. equilíbrio por simulação quando aplicável;
15. português revisado e faixa etária adequada;
16. conteúdo técnico/jurídico conferido com área responsável;
17. créditos/fontes de imagem corretos;
18. ficha Hub completa: teaser, descrição, faixa etária, perfis e trilha;
19. identificação institucional correta;
20. README + decisões no repositório;
21. partida completa offline sem erro/trava/perda;
22. score offline enfileirado e enviado depois sem duplicidade;
23. rankings geral/escola/turma corretos + participação opcional/reversível;
24. RLS + rate limit testados contra envio forjado;
25. pasta publicada portável sem recurso exclusivo do provedor.

## Evidência exigida

Cada item deve ter `PASS/FAIL/N/A justificado`, versão, dispositivo/browser, data, executor, passos, resultado e evidência (log/captura/medição). Item reprovado bloqueia publicação salvo exceção formal.

## Severidade de defeitos

- **Bloqueante:** impede qualquer item de aceite, quebra offline, perda de save, exposição/segurança, crash, ranking forjável, performance abaixo do mínimo.
- **Alta:** função principal degradada, acessibilidade importante, responsividade recorrente.
- **Média/Baixa:** não bloqueia gate, mas deve entrar em backlog com decisão explícita.

Use `resources/checklist-aceite.md` e `resources/parecer-homologacao-template.md`.
