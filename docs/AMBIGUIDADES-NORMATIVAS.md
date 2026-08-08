# Ambiguidades e tensões do texto-fonte — não corrigir silenciosamente

Este arquivo não altera a norma. Ele documenta pontos que um agente deve **preservar, sinalizar e tratar conservadoramente** até decisão formal da Coordenação.

## 1. Quantidade de pontos de quebra

A seção 4.2 afirma que “os pontos de quebra são fixos ... e cada aplicação deve ser verificada nos cinco”, porém a tabela lista **seis condições**: acima de 1280 px, 1280 px, 1080 px, 960 px, 700 px e 430 px. O Anexo A também fala em “cinco pontos de quebra”.

**Interpretação operacional conservadora:** testar as seis condições listadas na tabela até que a Coordenação formalize quais cinco constituem o conjunto nominal. Não reduzir cobertura de teste por conta da inconsistência textual.

## 2. Numeração da seção 6

O documento contém `6.6 Sincronização`, depois novamente `6.6 Onde o progresso é guardado`, e em seguida `6.8 Carregamento seguro`. Não existe `6.7` no texto-fonte.

**Tratamento:** manter a numeração original em rastreabilidade. Internamente, skills podem chamar o segundo bloco de “6.6b — Onde o progresso é guardado”, deixando claro que é um rótulo operacional, não uma renumeração oficial.

## 3. “Sem requisição externa” versus ranking online

O Anexo A item 1 exige que a aplicação abra em arquivo único, “sem requisição externa, com a rede desligada”. As seções 6.2, 6.4 e 6.6 exigem serviço online de rankings e sincronização quando houver rede e consentimento.

**Interpretação operacional:** nenhuma funcionalidade essencial, tela, fase, mecânica, inicialização ou asset necessário pode depender de rede. Chamadas de ranking podem existir no modo online, devem ser assíncronas e não bloqueantes, e devem falhar silenciosamente para fila local. Se a Coordenação interpretar “sem requisição externa” como proibição absoluta, o serviço de ranking precisará ser conciliado formalmente.

## 4. HTML autocontido versus mídias externas ao HTML

A base obrigatória exige HTML autocontido; a seção 3.2 proíbe mídia pesada em base64 e a seção 5 permite teaser e vídeo fora do HTML, com vídeo de abertura sob demanda.

**Interpretação operacional:** o **jogo completo e jogável** deve ser autocontido e offline. Materiais de vitrine/teaser e vídeo opcional não podem ser requisito para jogar nem bloquear a experiência.

## 5. Campo `escola` no save

`apelido` e `turma` são explicitamente opcionais; `escola` é descrita como selecionada em lista fechada mantida pela CTI, sem o qualificativo “opcional”. Ao mesmo tempo, o modo offline pode ocorrer sem participação em ranking.

**Interpretação operacional:** não obrigar escola para jogo offline individual; exigir escola quando necessária ao contexto de sala/ranking por escola, sem criar identificador pessoal.

## 6. CSP e script inline

A norma exige arquivo HTML único com JavaScript embutido e CSP restritiva, admitindo `script-src 'self' 'unsafe-inline'` “apenas enquanto o script for embutido”.

**Tratamento:** não remover `unsafe-inline` por iniciativa própria se isso quebrar o formato de arquivo único. A evolução para nonce/hash ou outra estratégia deve ser aprovada sem violar o requisito de portabilidade/autocontenção.
