---
name: semae-manutencao-migracao
description: "Planeja manutenção e migração das aplicações em carteira da Frente de Gamificação SEMAE, preservando requisitos v1.1 e as adequações específicas do Anexo B."
---

# Skill: Manutenção, legado e migração

## Princípio

Aplicações existentes, ao serem republicadas no Hub, entram no escopo integral da especificação. Não usar “legado” como exceção automática.

## Processo de manutenção

1. Identificar versão, tecnologia, host, save, ranking, dependências e known issues.
2. Rodar auditoria integral da v1.1.
3. Criar lista de não conformidades por jogo.
4. Priorizar bloqueantes de segurança/offline/save/performance/responsividade.
5. Corrigir em lotes pequenos e homologáveis.
6. Atualizar SemVer, README e registro de decisões.
7. Retestar matriz relevante e Anexo A completo antes de republicar.

## Carteira do Anexo B

### Piracicaba: Águas de uma Civilização
Natureza: estratégia histórica sobre saneamento na bacia do PCJ, mapa por bairros e trilha de viola caipira.
Adequação: migrar persistência em planilha para serviço de dados; reaproveitar torneio como base dos rankings por turma/escola; revisar desempenho do mapa em celular.

### Piracity e os desafios aleatórios
Natureza: plataforma 2D sobre fraudes em ligação de água.
Adequação: corrigir responsividade em paisagem e adequar controles de toque.

### Laboratório em Ação
Natureza: gestão do laboratório de controle de qualidade de uma ETA.
Adequação: migrar hospedagem para domínio institucional e retirar aviso de ausência de vínculo.

### Treinamento LGPD
Natureza: capacitação interna em proteção de dados, formato de coleção/evolução.
Adequação: identidade visual padrão; save; ranking interno por unidade.

### Autarquia: Simulador de Gestão do Saneamento
Natureza: simulação de gestão de autarquia municipal, licitações, controle externo e universalização.
Adequação: concluir save padrão; aderir aos rankings; publicar ficha no Hub.

### Hub de Educação SEMAE
Natureza: vitrine/distribuição por perfil e faixa etária.
Adequação: revisão de segurança completa da seção 8 + painel de ranking do educador por turma.

## Migrações especiais

- **Apps Script/planilhas:** não conectar novas aplicações; migrar histórico permitido para serviço relacional com export/backup e controles.
- **React/build:** manter somente até migração; evitar novos acoplamentos.
- **Hospedagem:** verificar todos os critérios de equivalência; portabilidade permanece gate.

## Compatibilidade de save

Qualquer mudança de `versaoEsquema` exige migrador explícito e preservação do save anterior. Versão do jogo e esquema são conceitos distintos.
