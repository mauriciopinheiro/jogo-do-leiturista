---
name: semae-dados-save-offline
description: "Projeta e implementa minimização de dados, save versionado, localStorage, export/import JSON, modo offline, fila de sincronização, assinatura e migração segura para jogos SEMAE."
---

# Skill: Dados, save, offline e sincronização

## Princípio de minimização

O jogo guarda apenas o necessário para devolver progresso. É proibido coletar: nome completo, documento, endereço, telefone, e-mail pessoal, imagem ou geolocalização.

Identificação permitida: apelido escolhido; turma e escola em contexto de sala. Turma/escola são dados da atividade, não devem ser combinados com campo que permita identificar diretamente estudante.

Toda coleta deve estar descrita na ficha do Hub em linguagem da faixa etária. Base legal, finalidade e retenção devem constar do inventário de tratamento sob acompanhamento do encarregado.

## Dois modos obrigatórios no mesmo arquivo

### Online
Condição: rede disponível + jogador optou pelo ranking. Progresso continua salvo localmente; pontuação pode ser enviada ao serviço para rankings geral/escola/turma.

### Offline
Condição: sem rede, sem autorização ou por escolha. Jogo completo, save local e exportável. Resultados pendentes permanecem em fila e sobem quando houver rede. O jogador perde apenas ranking ao vivo.

## Envelope de save obrigatório

```json
{
  "app": "identificador-kebab-case",
  "versaoJogo": "1.0.0",
  "versaoEsquema": 1,
  "criadoEm": "2026-08-07T12:00:00.000Z",
  "apelido": "opcional",
  "turma": "opcional",
  "escola": "lista-fechada-cti",
  "estado": {},
  "assinatura": "resumo-criptografico"
}
```

`estado` é específico do jogo. Não colocar dado adicional de ranking fora do conjunto normativo sem aprovação.

## Armazenamento local

- chave: `semae.<aplicacao>.v<versaoEsquema>`;
- limite: 256 KB;
- gravar em marcos relevantes (fase, decisão, checkpoint), **não por quadro**;
- save local é a fonte de progresso; ranking em nuvem não o substitui.

## Exportação/importação

A UI deve permitir exportar e importar `.json`. Exportação é mecanismo de backup do jogador e recuperação se o navegador limpar storage.

### Carregamento defensivo
1. verificar tamanho antes da leitura;
2. `JSON.parse` dentro de `try/catch`;
3. validar objeto e campos um a um;
4. validar tipos, enums e faixas;
5. confirmar `app` esperado;
6. conferir versão do esquema;
7. conferir assinatura;
8. se versão antiga suportada, copiar/preservar original e migrar explicitamente;
9. em qualquer falha, recusar com mensagem clara e manter progresso local atual;
10. renderizar valores do save como texto, nunca como HTML.

## Assinatura

A especificação pede resumo criptográfico para detectar adulteração. Em cliente puramente estático, não trate isso como segredo inviolável: use a assinatura para detectar inconsistência/adulteração acidental e combine com validação server-side para pontuação. Nunca embutir segredo privado para “proteger” o save.

## Fila de resultados

Cada item pendente deve ter identificador único de partida e dados estritamente necessários ao envio. Reenvio não pode duplicar pontuação. A fila deve persistir localmente, ter timeout curto, retry em marcos e indicador discreto de estado.

## Falhas de rede

- jamais modal bloqueante;
- jamais perder partida;
- jamais apagar fila por timeout;
- envio em segundo plano;
- nova tentativa quando a conexão retorna ou no próximo marco seguro.

## Casos de teste obrigatórios

save novo; save válido; JSON inválido; >256 KB; app incorreto; tipo/faixa inválida; assinatura inválida; esquema anterior migrável; esquema futuro desconhecido; localStorage indisponível/cheio; export/import; browser storage limpo; rede cai antes/durante/depois da partida; reenvio idempotente.
