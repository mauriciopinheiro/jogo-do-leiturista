---
name: semae-hospedagem-portabilidade
description: "Avalia Cloudflare Pages e qualquer migração de hospedagem segundo disponibilidade, desempenho, HTTPS/HSTS, cabeçalhos, deploy, rollback, portabilidade, custo e logs. Use em publicação, domínio, infraestrutura ou migração de provedor."
---

# Skill: Hospedagem e portabilidade

## Padrão atual

Cloudflare Pages sob domínio institucional permanece a plataforma padrão. Migração é permitida e pode ser desejável por custo/operação **somente** se todos os critérios forem verificados e registrados pela Coordenação.

## Checklist de equivalência — todos obrigatórios

1. **Disponibilidade:** compromisso de 99,9% ao mês + página pública de status.
2. **Desempenho:** distribuição em borda com PoP no Brasil; TTFB <200 ms; tela inicial <2 s em 4G como alvo da hospedagem.
3. **Transporte:** HTTPS automático, HSTS e domínio próprio da autarquia.
4. **Cabeçalhos:** configuração livre de CSP, `frame-ancestors` e demais controles.
5. **Publicação:** deploy a partir do repositório, preview e rollback imediato.
6. **Independência:** publicação de estáticos sem compilação proprietária; saída continua copiável.
7. **Custo/contrato:** previsível e compatível com modalidade de contratação da autarquia.
8. **Registro:** logs de acesso/erro sem dado pessoal do usuário.

## Protocolo de avaliação de provedor

Produza tabela com: requisito, evidência documental, teste executado, resultado, risco, observação contratual e decisão. Um “sim” sem evidência não é suficiente.

## Portabilidade como requisito de projeto

- Aplicação deve ser um artefato estático copiável.
- DNS/domínio pode mudar sem alteração de lógica do jogo.
- Não usar KV, edge function, analytics, auth ou storage específicos do host como dependência do jogo.
- Serviço de ranking é componente separado e também deve ter exportação em formato aberto.

## Publicação segura

Antes do deploy:
- commit/tag correspondente à versão declarada;
- artefato gerado do repositório institucional;
- preview validado;
- cabeçalhos de segurança conferidos;
- teste offline feito no artefato final;
- plano de rollback conhecido;
- logs sem dados pessoais.

## Migração

Fases: inventário → prova de conceito → teste de equivalência → homologação técnica → janela de migração → DNS → smoke test → observação → possibilidade de rollback. A mudança de host não autoriza alterar padrão tecnológico do jogo.
