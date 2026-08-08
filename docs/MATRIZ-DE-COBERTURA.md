# Matriz de cobertura da Especificação v1.1

A matriz abaixo garante que todas as partes do documento-fonte tenham dono operacional. “Primário” é quem deve ser carregado para executar o requisito; “auditoria” verifica transversalmente a conformidade.

| Fonte | Conteúdo | Skill primária | Agente(s) principal(is) |
|---|---|---|---|
| Capa / metadados | versão, data, responsáveis, Hub, lançamento, classificação | `semae-normas-gamificacao` | orquestrador, release |
| 1 | objetivo e alcance | `semae-normas-gamificacao` | orquestrador |
| 1.1 | motivação da padronização | `semae-normas-gamificacao` | orquestrador, arquiteto |
| 2 | governança e regra de publicação | `semae-governanca-documentacao` | orquestrador, QA |
| 2.1 | trabalho dos estagiários | `semae-governanca-documentacao` | orquestrador, release/manutenção |
| 3.1 | base tecnológica obrigatória | `semae-arquitetura-html-offline` | arquiteto, engenheiro |
| 3.2 | proibições técnicas | `semae-arquitetura-html-offline` + `semae-seguranca-aplicacao` | arquiteto, segurança |
| 3.3 | estrutura, nomes, semver, README, repositório | `semae-governanca-documentacao` | arquiteto, release |
| 3.4 | hospedagem e equivalência | `semae-hospedagem-portabilidade` | release/manutenção, Hub |
| 4.1 | identidade visual | `semae-ui-responsividade-acessibilidade` | UX |
| 4.2 | responsividade | `semae-ui-responsividade-acessibilidade` | UX, QA |
| 4.3 | componentes padrão | `semae-ui-responsividade-acessibilidade` | UX, engenheiro |
| 4.4 | acessibilidade e linguagem | `semae-ui-responsividade-acessibilidade` | UX, QA |
| 4.5 | áudio | `semae-audio-web` | UX, engenheiro, performance |
| 5 | formatos e limites de arquivos | `semae-arquivos-assets` | arquiteto, release, QA |
| 6.1 | minimização e privacidade | `semae-dados-save-offline` | dados, segurança |
| 6.2 | modos online/offline | `semae-dados-save-offline` | engenheiro, dados, QA |
| 6.3 | envelope de save | `semae-dados-save-offline` | engenheiro, dados |
| 6.4 | serviço de dados/rankings | `semae-rankings-servico-dados` | dados, segurança, Hub |
| 6.5 | desenho dos rankings | `semae-rankings-servico-dados` | dados, Hub |
| 6.6 | sincronização | `semae-dados-save-offline` + `semae-rankings-servico-dados` | dados, engenheiro |
| 6.6 (2º) | onde progresso é guardado | `semae-dados-save-offline` | engenheiro, dados |
| 6.8 | carregamento seguro | `semae-dados-save-offline` + `semae-seguranca-aplicacao` | segurança, engenheiro |
| 7 | segurança da aplicação | `semae-seguranca-aplicacao` | segurança |
| 8 | revisão de segurança do Hub | `semae-seguranca-hub` | segurança, Hub |
| 9 | metas de desempenho | `semae-desempenho-runtime` | performance, QA |
| 9.1 | técnicas obrigatórias | `semae-desempenho-runtime` | performance, engenheiro |
| 9.2 | simulação de equilíbrio | `semae-equilibrio-simulacao` | performance/balanceamento, QA |
| 10.1 | matriz de dispositivos | `semae-testes-homologacao` | QA |
| 10.2 | ciclo de homologação | `semae-testes-homologacao` | QA, orquestrador |
| 11 | cronograma até lançamento | `semae-release-lancamento` | release/manutenção, orquestrador |
| 11 / imprensa | preparação para imprensa | `semae-release-lancamento` | release/manutenção |
| Anexo A 1–25 | checklist de aceite integral | `semae-testes-homologacao` + `semae-auditoria-conformidade` | QA, orquestrador |
| Anexo B | aplicações em carteira e adequações | `semae-manutencao-migracao` | release/manutenção, especialistas |
| Encerramento | manutenção e versionamento da especificação | `semae-governanca-documentacao` | orquestrador |

## Cobertura do Anexo A por domínio

1–2 arquitetura/versionamento; 3–6 UI/acessibilidade; 7 áudio; 8–9 save/migração; 10 privacidade; 11–14 performance/console/simulação; 15–16 conteúdo e linguagem; 17–20 publicação/documentação; 21 offline; 22 sincronização; 23 ranking; 24 segurança do serviço; 25 portabilidade.

Nenhum item pode ser marcado como “N/A” por conveniência. Quando “quando aplicável” estiver no próprio requisito (ex.: simulação de equilíbrio), registrar a justificativa de aplicabilidade.
