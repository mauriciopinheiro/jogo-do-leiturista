---
name: semae-release-lancamento
description: "Coordena congelamento de código, publicação, lançamento e material de imprensa da plataforma SEMAE conforme cronograma v1.1, incluindo plano offline de demonstração e acompanhamento pós-publicação."
---

# Skill: Release, lançamento e imprensa

## Marco oficial da v1.1

Lançamento: **18/09/2026**, com divulgação à imprensa. O documento declara a data firme e o congelamento de código inegociável.

## Cronograma normativo

- 08–15/08: inventário e diagnóstico das aplicações + não conformidades por jogo.
- 18–29/08: adequação de segurança, save, desempenho e responsividade.
- 18/08–05/09: serviço de dados/rankings + migração do legado em planilha.
- 25/08–05/09: revisão de segurança do Hub.
- 01–08/09: testes integrados na matriz; rede desligada e instável.
- 09–12/09: corrigir bloqueantes e retestar.
- **12/09:** code freeze; depois, apenas defeito crítico.
- 15/09: homologação final, ensaio de carga, material de imprensa fechado.
- 16–17/09: publicação, conferência de fichas, ensaio da apresentação.
- 18/09: lançamento oficial.

## Gate de freeze

Antes de 12/09: nenhuma feature essencial pendente; versões identificadas; backlog de defeitos classificado; save/migração testados; offline e performance conhecidos. Após freeze: toda alteração precisa ser defeito crítico, mínimo patch, reteste direcionado + regressão pertinente, e registro de decisão.

## Preparação para imprensa até 15/09

- texto de divulgação;
- captura de tela de cada aplicação;
- teaser de 15 s por jogo (embora o limite técnico permita teaser até 30 s, o material de imprensa pedido aqui é 15 s);
- roteiro de demonstração ao vivo;
- plano alternativo **sem internet**;
- porta-vozes definidos;
- demonstração sempre na versão congelada, nunca no ambiente de desenvolvimento.

## Publicação

Conferir ficha, versão, classificação etária/perfis, teaser, trilha, identificação institucional, domínio, headers, ranking e artefato homologado. Não publicar build diferente do parecer.

## Pós-publicação

Acompanhar por 7 dias com canal para defeitos, triagem por severidade, correção crítica com patch semântico e nova evidência de teste.
