# SPEC — Jogo do Leiturista v4.0.0: redesenho visual, desempenho e responsividade

**Spec ID:** SPEC-2026-003
**Status:** DRAFT
**Owner:** CTI SEMAE Piracicaba (demandante: Maurício Pinheiro)
**Created:** 2026-09-29
**Last Updated:** 2026-09-29
**Risco:** moderado (código de jogo estático, sem servidor próprio); a integração com o hub (REQ-109) grava XP no hub quando o jogo roda dentro dele.

## 1. Problema

A v3.4.0 ("Engine Master"), publicada em semae-educa.pages.dev, foi avaliada pelo demandante como **muito feia, com muitos defeitos, travando e com responsividade fraca**. A análise do arquivo publicado (SHA-256 `B401F5AC…DDA89`, 144.031 bytes, 2.949 linhas num único HTML) e as medições de 2026-09-29 mostraram:

- **Desempenho**: o mundo lógico tem altura fixa de 960 e largura proporcional à tela. Em celular deitado (844×390, dpr 3) o canvas interno chega a **4156×1920 (7,98 Mpx)**; em tablet 1024×768, 4,92 Mpx. O custo por quadro medido (rasterização por CPU, flush forçado) foi 2,4 ms em desktop/retrato e **7,2 ms em celular deitado (3×)**. O HUD usa `backdrop-filter`, que recompõe o desfoque a cada quadro sobre um canvas animado. O passo fixo de 1/60 s sem interpolação gera trepidação em telas de 90/120/144 Hz.
- **Proporção visual**: em desktop ~65% da tela é céu vazio; o leiturista ocupa ~9% da altura; em celular deitado ele mede ~32 px. Casas de cor chapada, ícones feitos com emoji desenhado por `fillText` a cada quadro, HUD grande demais.
- **Defeitos de lógica** (lidos no código): retomar partida reinicia a fila de hidrômetros (contagens por rua ficam inconsistentes); soma de hidrômetros das ruas da Fase 5 (84) difere do total declarado (90), deixando a última rua com contagem maior que a meta; total da campanha exibido como 535 na retrospectiva/rever encerramento, enquanto as rotas somam 240; `alert()` bloqueante para erro de armazenamento (bloqueado/mudo em iframe); tocar fora do painel após perder reinicia a partida sem querer; o banner e o tremor só diminuem no estado de corrida; o jogo nunca avisa o hub (`postMessage`), então nenhuma equipe consegue concluí-lo no ranking; não há legenda de símbolos (exigida pelo item 6 do Anexo A da especificação da CTI).

## 2. Goals

- G-001: Nova identidade visual coesa, legível em todas as telas, com a paleta e a tipografia da especificação técnica da CTI v1.1 (§4.1).
- G-002: Desempenho dentro de §9 da CTI (≥45 fps em computador, ≥30 fps em celular intermediário) com canvas proporcional à tela.
- G-003: Layout íntegro em retrato e paisagem e nos pontos de quebra da CTI (§4.2), com alvos de toque ≥44 px.
- G-004: Eliminar os defeitos listados no item 1 e cobrir a jogabilidade com testes automatizados de simulação.
- G-005: Preservar mecânicas, dados reais das rotas, textos narrativos e o progresso já salvo pelos jogadores.
- G-006: Código-fonte modular (≤200 linhas por arquivo) que gera o **único HTML autônomo** exigido pela CTI.

## 3. Non-goals

- NG-001: Alterar as rotas, ruas ou contagens reais do SCI (exceto a divergência da Fase 5, ver Q-001).
- NG-002: Criar ranking próprio, coleta de apelido/turma/escola ou chamadas de rede (o jogo permanece 100% offline).
- NG-003: Publicar em produção. A publicação depende de pedido explícito do demandante.
- NG-004: Novas fases, novos power-ups ou mudança de regra de pontuação/medalhas.

## 4. Actors

- ACTOR-001: Criança do 5º ano (jogadora), em computador da escola ou celular, retrato ou paisagem.
- ACTOR-002: Educador que aplica a atividade no Hub (jogo dentro de `iframe`).
- ACTOR-003: Liderança de testes da CTI (homologação pelo Anexo A).

## 5. Functional Requirements

### REQ-101 — Preservação e compatibilidade de progresso
**Statement:** O sistema MUST manter a v3.4.0 preservada com hash e MUST aceitar os saves gravados por ela (chave `semae.jogo-do-leiturista-3.v2`, assinatura SHA-256 ou FNV-1a legada, esquema v1 e v2).
**Priority:** MUST

### REQ-102 — Desempenho
**Statement:** O sistema MUST limitar o canvas interno a um orçamento de pixels por perfil (leve/normal), MUST avançar a simulação por tempo decorrido com limite superior por quadro, MUST desenhar cenários estáticos a partir de camadas pré-renderizadas e MUST NOT usar `backdrop-filter`, emoji em `fillText` no laço nem leitura de layout no laço.
**Priority:** MUST

### REQ-103 — Responsividade
**Statement:** O mundo do jogo MUST se ajustar a qualquer proporção de tela (retrato, paisagem, tablet, ultralargo) mantendo o leiturista com tamanho útil, MUST sobreviver a giro de aparelho e redimensionamento sem encerrar a partida, e as telas MUST não ter rolagem horizontal nos pontos de quebra 1280/1080/960/700/430 px, com alvos de toque ≥44×44 px.
**Priority:** MUST

### REQ-104 — Identidade visual
**Statement:** O sistema MUST apresentar cenário com camadas de paralaxe e tema próprio para cada uma das 5 fases, personagens (leiturista, cão, Kombi) redesenhados, HUD compacto com pontuação, combo, energia do Flow e ameaça do cão com texto e ícone (nunca só cor), e telas de menu/resultado redesenhadas, usando somente fontes do sistema.
**Priority:** MUST

### REQ-105 — Jogabilidade preservada
**Statement:** O sistema MUST preservar: toque curto/longo para pulo baixo/alto, hidrômetros comuns/ouro, anomalia (>42 m³), obstáculos (cone, mangueira, lixeira, poça, barreira, caixote), power-ups (turbo, escudo, osso), ameaça do cão, combo e multiplicador, Flow, 5 fases com ruas reais, placas e travessia de rua, Kombi (chegada e saída), medalhas, modo infinito, uniformes por leituras vitalícias, retrospectiva e encerramento narrativo.
**Priority:** MUST

### REQ-106 — Correção de defeitos
**Statement:** O sistema MUST corrigir os defeitos do item 1: retomada com fila de hidrômetros e contadores consistentes; total de cada rota igual à soma de suas ruas; totais da campanha derivados das rotas; erros de armazenamento notificados por aviso não bloqueante; reinício somente por botão explícito; temporizadores de banner e tremor independentes do estado.
**Priority:** MUST

### REQ-107 — Persistência segura
**Statement:** O sistema MUST validar campo a campo saves lidos do armazenamento ou importados, recusar arquivos adulterados ou acima de 256 KB sem quebrar, migrar o esquema v1, gravar em marcos (não a cada quadro) e permitir exportar/importar `.json`.
**Priority:** MUST

### REQ-108 — Acessibilidade e ajuda
**Statement:** O sistema MUST oferecer operação por teclado com foco visível, respeitar `prefers-reduced-motion`, anunciar eventos em região `aria-live`, e ter tela "Como jogar" com legenda de símbolos gerada dos mesmos desenhos do jogo.
**Priority:** MUST

### REQ-109 — Integração com o Hub
**Statement:** Quando executado em `iframe`, o sistema MUST enviar ao portal `SEMAE_FIM_PARTIDA` (com `jogoId` `app_jogo_do_leiturista`, pontuação 0–100, duração e estrelas) apenas ao **vencer** uma rota da campanha, somente para a origem da própria página; fora de `iframe` ou com origem nula MUST NOT enviar.
**Priority:** MUST

### REQ-110 — Áudio
**Statement:** O áudio MUST iniciar somente após gesto do usuário, ter controles independentes de música e efeitos, compressor no barramento final, teto de vozes (16 em celular, 32 em computador) e suspensão quando a aba fica oculta.
**Priority:** MUST

### REQ-111 — Modularidade e entrega
**Statement:** Cada arquivo manual de código MUST ter no máximo 200 linhas; o build MUST gerar `index.html` único, autônomo (sem requisição externa), com a versão 4.0.0 visível na tela inicial.
**Priority:** MUST

### REQ-112 — Verificabilidade
**Statement:** A lógica de jogo MUST rodar sem DOM para testes determinísticos, e MUST existir bateria em navegador real (viewports, console sem erros, estouro horizontal, alvos de toque, custo por quadro, hub simulado).
**Priority:** MUST

## 6. Non-functional Requirements

### NFR-001 — Orçamento de pixels
Canvas ≤ 2,2 Mpx no perfil leve (toque/largura ≤ 768 px) e ≤ 4,2 Mpx no perfil normal.

### NFR-002 — Tamanho
`index.html` gerado ≤ 2 MB (limite da CTI §5).

### NFR-003 — Português do Brasil
Interface, comentários e identificadores em português; identificadores sem acento.

## 7. Acceptance Criteria

### AC-101 — Saves antigos
**Linked requirements:** REQ-101, REQ-107
Given um save v2 assinado pela v3.4.0 e um save v1, When carregados pela v4.0.0, Then o progresso é aceito/migrado e um save adulterado ou de 300 KB é recusado sem exceção.

### AC-102 — Custo de quadro
**Linked requirements:** REQ-102, NFR-001
Given os cenários 1920×1080, 1366×768, 390×844, 844×390 e 1024×768, When o jogo roda 5 s com rasterização por CPU, Then o canvas respeita o orçamento e o custo médio por quadro em 844×390 é ≤ 1,5× o de 390×844.

### AC-103 — Layout
**Linked requirements:** REQ-103
Given larguras 1600, 1280, 1080, 960, 700, 430 e 360 px em retrato e paisagem, When o menu e o jogo são exibidos, Then não há rolagem horizontal, e todo botão visível mede ≥44×44 px.

### AC-104 — Giro de tela
**Linked requirements:** REQ-103
Given uma partida em andamento, When a janela alterna entre 390×844 e 844×390, Then a partida continua, o leiturista permanece visível e o cão não alcança o jogador por causa do giro.

### AC-105 — Campanha completa por robô
**Linked requirements:** REQ-105, REQ-112
Given um robô com tempo de reação humano, When joga as 5 fases em semente fixa, Then conclui todas; e um jogador sem entrada perde em cada fase.

### AC-106 — Retomada consistente
**Linked requirements:** REQ-106
Given uma partida salva no meio da Fase 3, When retomada, Then os hidrômetros restantes correspondem exatamente aos não processados e os contadores por rua nunca excedem a meta da rua.

### AC-107 — Dados das rotas
**Linked requirements:** REQ-106
Given as 5 rotas, Then `total_hidrometros` é igual à soma das ruas em todas.

### AC-108 — Sem alerta bloqueante
**Linked requirements:** REQ-106, REQ-107
Given armazenamento cheio ou bloqueado, When se tenta salvar, Then aparece aviso não bloqueante (≤3,5 s) e o jogo continua; `alert` nunca é chamado.

### AC-109 — Console limpo
**Linked requirements:** REQ-112
Given uma partida completa em navegador real, Then o console não registra erros.

### AC-110 — Hub
**Linked requirements:** REQ-109
Given o jogo dentro de um `iframe` de mesma origem, When uma rota é vencida, Then o pai recebe exatamente uma mensagem `SEMAE_FIM_PARTIDA` com pontuação inteira em 0–100; When o jogo perde ou roda fora de `iframe`, Then nenhuma mensagem é enviada.

### AC-111 — Limite de linhas e arquivo único
**Linked requirements:** REQ-111
Given o repositório, Then nenhum arquivo manual de código excede 200 linhas, e `index.html` não faz requisições externas (rede desligada).

### AC-112 — Ajuda e teclado
**Linked requirements:** REQ-108, REQ-110
Given a tela inicial, Then existe "Como jogar" com legenda; Espaço/↑/W pulam, P/Esc pausa, M/S alternam áudio; sem gesto prévio o AudioContext não é criado.

## 8. Data

Save local (`localStorage`, ≤256 KB): mesmo envelope v2 da v3.4.0 (`app`, `versaoJogo`, `versaoEsquema`, `criadoEm`, `estado`, `assinatura`, `checksum`). A `partidaEmAndamento` ganha campos opcionais (`perdidos`, `perdidosPorRua`); saves sem eles continuam válidos. A fila de hidrômetros retoma do total processado (lidos + perdidos). Nenhum dado pessoal é coletado.

## 9. API / Interface Contracts

`window.parent.postMessage({ tipo: 'SEMAE_FIM_PARTIDA', jogoId: 'app_jogo_do_leiturista', carimbo, pontuacao, vitoria: true, duracao, duracaoSegundos, estrelas }, location.origin)` — contrato do hub (`public/index.html`, listener `message`). O hub soma `pontuacao` ao XP da equipe a cada mensagem.

## 10. Security and Privacy

- Sem rede, sem `eval`, sem HTML vindo de dado externo (save importado só entra como texto).
- Save adulterado recusado; limite de tamanho verificado antes de `JSON.parse`.
- `postMessage` com `targetOrigin` = origem da página; nunca `*`.
- Sem coleta de dados pessoais.

## 11. Edge Cases

- EC-001: aba oculta/retomada (dt limitado, pausa automática).
- EC-002: giro de aparelho no meio da corrida (mundo deslocado, sem game over).
- EC-003: armazenamento indisponível (modo privado): jogo funciona sem salvar, com aviso.
- EC-004: toque durante a abertura da Kombi (pula a abertura).
- EC-005: telas ultralargas e muito pequenas (360×640).

## 12. Failure Modes

- FM-001: `AudioContext` indisponível → jogo segue mudo, sem erro.
- FM-002: `postMessage` falha → erro registrado no console, jogo segue.
- FM-003: save corrompido → ignorado com aviso; progresso zerado apenas na memória (o arquivo bruto não é apagado).

## 13. Compatibility

Chave e esquema de save preservados. `index.html` continua sendo o único arquivo a publicar; `capa.jpg`, `og_preview.jpg` e logos do hub permanecem. Navegadores: Chrome/Edge/Safari/Firefox recentes (ES2020).

## 14. Dependencies

- DEP-001: `esbuild` (somente desenvolvimento, para empacotar módulos ES em um único script). Nenhuma dependência em execução.

## 15. Architecture Decisions

- ADR-001: fontes modulares em `src/` → `scripts/construir.mjs` → `index.html` (gerado, isento do limite por ser artefato). Divergência consciente do "sem build" da CTI §3.1 para cumprir o limite de 200 linhas do projeto; a saída não é minificada nem transpilada (ES2020).
- ADR-002: simulação pura (sem DOM) em `src/js/simulacao/`, consumida por renderizador, HUD e áudio por eventos.
- ADR-003: mundo lógico com largura entre 560 e 900 unidades conforme a proporção da tela.

## 16. Open Questions

- [ ] Q-001: A Fase 5 lista 15 ruas somando 84 hidrômetros, mas o total é 90. Decisão provisória: manter 90 e acrescentar a rua sintética "Demais ruas da rota" (6). Confirmar com o SCI.
- [ ] Q-002: Pontuação enviada ao hub por vitória de rota (0–100) e repetição de rota soma XP de novo (igual ao Caça-Vazamentos). Confirmar se se deseja limitar.
- [ ] Q-003: Usar as logomarcas do repositório (Logo_S.png / Logo_completo.png) embutidas? Decisão provisória: não; usar apenas texto e desenho próprios.

## 17. Approval

**Approved by:** (pendente — não preenchido pelo agente)
**Approval date:**
**Approval evidence:**
