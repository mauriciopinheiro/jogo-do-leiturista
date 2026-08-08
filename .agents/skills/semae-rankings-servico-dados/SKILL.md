---
name: semae-rankings-servico-dados
description: "Projeta serviço Postgres/API e rankings geral, por escola e por turma para os jogos SEMAE, com RLS, validação server-side, rate limiting, moderação, temporadas, opt-in e portabilidade."
---

# Skill: Serviço de dados e rankings

## Objetivo

Substituir gradualmente Google Apps Script/planilhas por plataforma gerenciada com banco relacional e API. Supabase é referência; equivalente é permitido se cumprir os requisitos. A planilha atual é apenas contingência até produção e não deve receber novas aplicações.

## Dados permitidos no serviço

**Somente:** apelido, turma, escola, aplicação, pontuação e data. Não ampliar schema de dados do jogador por conveniência.

## Requisitos de plataforma

- Postgres/relacional gerenciado.
- Esquema versionado via migrações no repositório.
- RLS/regras no banco.
- Leitura pública somente das visões de ranking apropriadas.
- Gravação somente via função/endpoint de envio.
- Cliente contém apenas chave pública de escopo restrito.
- Chave de serviço nunca no HTML.
- Função server-side recalcula e valida pontuação, rejeitando valor impossível para a partida declarada.
- Rate limit por apelido e endereço, com bloqueio progressivo em abuso.
- Moderação de apelidos por lista de termos vedados + remoção administrativa.
- Retenção definida por temporada.
- Backup diário + teste de restauração documentado.
- Exportação completa em formato aberto.

## Modelo de segurança

O cliente é não confiável. Pontuação declarada pelo cliente nunca é autoridade suficiente. O endpoint deve validar coerência com regras da aplicação/partida e impor limites. Não resolver antifraude com segredo embarcado no HTML.

## Escopos obrigatórios

1. Geral.
2. Por escola.
3. Por turma — primeiro a mostrar quando turma estiver identificada.

## Cálculo

Ranking de escola e turma usa **média das melhores pontuações dos participantes**, não soma. O objetivo é evitar premiar grupo apenas por tamanho. A função exata de “melhores pontuações” por participante deve ser documentada pela aplicação sem contrariar a regra de média.

## Temporadas

Cada temporada tem início/fim declarados e histórico preservado. Isso permite campeonato por bimestre sem apagar temporada anterior.

## Transparência pedagógica

Critério de pontuação precisa estar na ficha do jogo em linguagem que o educador consiga explicar. Não criar fórmula opaca sem documentação.

## Participação

- opt-in explícito;
- reversível;
- saída do ranking remove registro correspondente conforme política definida;
- exibição pública: apelido + pontuação; demais dimensões apenas quando necessárias ao escopo/agregação.

## Painel do educador

No Hub: mostrar ranking da **própria turma** e permitir exportação em planilha para uso pedagógico. Autorização deve impedir acesso a turma alheia.

## Sincronização e idempotência

- `partidaId` único;
- endpoint idempotente;
- fila local;
- retry silencioso;
- consulta/envio assíncronos;
- estado discreto na UI;
- nenhuma chamada segura o jogo.

## Testes adversariais

Envio de pontuação impossível; replay de mesma partida; alteração de aplicação/turma/escola; burst de requisições; apelido vedado; tentativa de escrever diretamente em tabela; tentativa de ler dados não expostos; uso de chave pública para ação privilegiada; acesso de educador à turma errada; restauração de backup; exportação completa.
