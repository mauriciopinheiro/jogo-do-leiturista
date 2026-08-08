---
name: semae-governanca-documentacao
description: "Governa desenvolvimento, revisão, versionamento, documentação e trabalho dos estagiários na frente de gamificação SEMAE. Use ao iniciar projeto, preparar entrega, registrar decisão, versionar, revisar código ou organizar manutenção."
---

# Skill: Governança, documentação e versionamento

## Papéis permanentes

- **Liderança de testes e ajustes — Maurício Pinheiro:** conduz homologação; mantém matriz de dispositivos; aplica Anexo A; registra/prioriza defeitos; executa ajustes de correção; emite parecer de publicação.
- **Novos desenvolvimentos — estagiários da CTI:** criam/evoluem aplicações conforme norma, com orientação técnica e revisão obrigatória antes de publicação.
- **Coordenação e arquitetura — CTI:** mantém especificação; prioriza; define roteiro de conteúdo; aprova exceções; responde por segurança e relação com demandantes.

## Regra de publicação

Sem parecer de homologação assinado pela liderança de testes, **não publicar**. Item reprovado = corrigir ou obter exceção formal registrada pela Coordenação.

## Regras para trabalho dos estagiários

1. Partir do modelo de projeto mantido pela CTI, com estrutura, CSS padrão e utilitários de save/áudio.
2. Nenhum código chega ao ambiente de publicação sem revisão de servidor efetivo.
3. Manter registro de decisões técnicas com uma linha por decisão relevante e entregá-lo com o código.
4. Preferir entregas parciais jogáveis/testadas a lotes grandes não homologados.

## Nomenclatura e versionamento

- Arquivo/pasta: minúsculas + hífen; exemplo `jogo-laboratorio-em-acao.html`.
- SemVer `MAIOR.MENOR.CORREÇÃO`.
- Versão em constante no topo do arquivo.
- Versão visível no rodapé da tela inicial.
- Código, comentários, identificadores e interface em português do Brasil.
- Repositório institucional da CTI = fonte única da verdade. Publicação deriva do repositório, nunca o inverso.

## README obrigatório

O README de cada aplicação deve conter no mínimo:
- nome e identificador em kebab-case;
- objetivo pedagógico/institucional;
- público e faixa etária;
- contexto narrativo e objetivos de jogo;
- instruções para jogar e testar;
- instruções específicas para teste offline e rede instável;
- versão do jogo e versão do esquema de save;
- descrição de dados coletados e ranking, quando aplicável;
- instruções de exportação/importação de save;
- matriz de dispositivos testada;
- histórico de versões;
- limitações conhecidas e exceções formais, se existirem.

Use `resources/README-template.md`.

## Registro de decisões

Cada linha deve incluir: data, decisão, contexto/problema, alternativa rejeitada quando relevante, requisito da especificação afetado, responsável e consequência. Mudanças que afetam segurança, persistência, hospedagem, ranking, privacidade, performance ou compatibilidade devem sempre gerar registro.

## Revisão de código

A revisão obrigatória deve verificar, no mínimo:
- aderência arquitetural e ausência de build/dependência externa;
- entradas/saídas de dados e persistência;
- segurança e segredos;
- offline e tolerância a falha de rede;
- impacto nos itens do Anexo A;
- atualização de versão/README/decisões.

## Evolução da especificação

A especificação é mantida pela CTI, usa o mesmo princípio de versionamento das aplicações e suas revisões são comunicadas à frente antes de vigorar. Quando chegar uma versão normativa nova, **não sobrescrever historicamente** a versão anterior: versionar skills, registrar delta e executar auditoria de impacto nas aplicações.
