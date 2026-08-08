---
name: semae-normas-gamificacao
description: "Aplica a especificação normativa v1.1 da Frente de Gamificação CTI/SEMAE como constituição do projeto. Use em qualquer criação, alteração, revisão, migração, homologação, publicação ou manutenção de jogos e do Hub."
---

# Skill: Normas de Gamificação CTI/SEMAE

## Missão

Transformar a Especificação Técnica v1.1 em **restrições executáveis de decisão**. Esta skill é transversal e deve ser combinada com uma skill de domínio.

## Fonte normativa

Leia `../../../docs/especificacao-fonte-v1.1.md` quando a tarefa envolver decisão não reproduzida integralmente aqui. Consulte também `../../../docs/AMBIGUIDADES-NORMATIVAS.md`.

## Escopo

Aplica-se a toda aplicação gamificada produzida pela CTI ou sob sua supervisão: educacional, treinamento interno, comunicação institucional e aplicação existente republicada no Hub.

## Princípios de precedência

1. Texto da especificação e exceções formais registradas pela Coordenação.
2. Requisitos de segurança, privacidade, offline e homologação; na dúvida, adotar a interpretação que preserve maior proteção e maior disponibilidade offline, sem inventar requisito novo.
3. Decisões técnicas registradas da aplicação, desde que não contrariem a norma.
4. Preferências de implementação.

## Classificação de requisitos

Ao analisar uma tarefa, marque cada requisito afetado como:
- **BLOQUEANTE:** falha impede publicação pelo Anexo A ou por regra explícita.
- **OBRIGATÓRIO:** deve ser implementado; ausência é não conformidade.
- **CONDICIONAL:** só se aplica quando a função existe (ex.: ranking, simulação para jogos de gestão/progressão, vídeo de abertura).
- **RECOMENDADO/ALVO:** alvo preferencial acima do mínimo aceitável (ex.: 60 FPS versus mínimo 45 em computador).
- **INFORMATIVO:** motivação/contexto que orienta decisão, mas não é gate por si só.

## Gates universais

### Gate A — Projeto e portabilidade
- HTML único/autocontido para a aplicação.
- JS ES2020 sem transpilação/etapa de build.
- Sem dependência externa em runtime para jogar.
- Repositório CTI é fonte única da verdade.
- Sem recurso exclusivo de provedor como requisito funcional.

### Gate B — Offline real
- Rede desligada desde antes de abrir: jogo inicia e permanece completo.
- Nenhuma tela, fase, mecânica ou conteúdo obrigatório depende do servidor.
- Pontuação pode ficar pendente; ranking ao vivo é a única capacidade perdida.
- Falha de rede não produz modal bloqueante nem quebra de partida.

### Gate C — Dados e privacidade
- Minimização estrita e campos permitidos.
- Consentimento/opt-in para ranking; reversibilidade/remoção.
- Dados de turma/escola usados para agrupamento sem reidentificação.
- Coleta declarada na ficha do Hub e registrada no inventário de tratamento.

### Gate D — Segurança
- Entrada externa validada; sem execução dinâmica de código.
- Sem segredos no cliente.
- HTTPS/HSTS e cabeçalhos previstos.
- RLS, validação server-side e rate limiting no serviço de ranking.

### Gate E — Experiência e acessibilidade
- Responsividade em todos os pontos listados na tabela da seção 4.2.
- 44×44 px, contraste, foco visível, teclado, reduced motion, redundância além de cor.
- Componentes padrão, legenda de símbolos, linguagem pt-BR adequada à faixa etária.

### Gate F — Desempenho
- Cumprir mínimos da seção 9 no aparelho de referência.
- Técnicas obrigatórias de loop, renderização, pooling, modo leve, suspensão e rede assíncrona.

### Gate G — Homologação
- Entrega inclui README, versão e registro de decisões.
- Revisão por servidor efetivo da CTI.
- 25 itens do Anexo A com evidência.
- Correção/reteste de falhas.
- Parecer de homologação antes do Hub.
- Pós-publicação por 7 dias.

## Protocolo para qualquer mudança

1. **Defina o impacto:** quais seções e itens do Anexo A a mudança toca.
2. **Leia as skills de domínio.**
3. **Planeje testes antes do código.** Inclua offline e falha de rede quando houver qualquer integração.
4. **Implemente incrementalmente.** Uma fase jogável/testada é preferível a múltiplas fases não homologadas.
5. **Registre decisão relevante** em uma linha do registro técnico.
6. **Execute verificação estática e dinâmica.** Não confundir scanner com homologação manual.
7. **Produza relatório de conformidade** com: requisito, evidência, status, arquivo/linha, dispositivo, observação e correção.
8. **Escalone divergência normativa**; nunca invente exceção.

## Critério de pronto

“Pronto” significa: funcionalidade concluída + critérios normativos afetados verificados + testes registrados + documentação atualizada + zero bloqueante conhecido. “Funciona no meu computador” não é pronto.
