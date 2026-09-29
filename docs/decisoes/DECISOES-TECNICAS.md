# Registro de decisões técnicas — Jogo do Leiturista v4.0.0

Uma decisão por bloco: contexto, decisão, alternativas, consequências e condição de revisão.

## ADR-001 — Fontes modulares que geram um único HTML

- **Contexto:** a v3.4.0 tinha 2.949 linhas num só arquivo (o verificador de 200 linhas do repositório só
  olhava extensões de código e nunca examinou `.html` com JavaScript embutido). A especificação da CTI
  (§3.1) pede arquivo único autônomo e, ao mesmo tempo, "sem etapa de build".
- **Decisão:** fontes em `src/` (≤200 linhas) empacotadas por esbuild em um `index.html` único. A saída
  não é minificada nem transpilada (ES2020), portanto continua legível e auditável.
- **Alternativas:** manter o monolito (viola a regra de 200 linhas do projeto); carregar módulos por
  `<script type="module">` (quebraria o arquivo único).
- **Consequência:** existe uma etapa de build de desenvolvimento; quem só copia o `index.html` não precisa
  dela. Divergência consciente do "sem build" da CTI, na mesma linha do Caça-Vazamentos.
- **Revisar se:** a CTI tornar o "sem build" um critério bloqueante da homologação.

## ADR-002 — Simulação pura, separada de desenho, interface e áudio

- **Decisão:** `src/js/simulacao/` não conhece DOM, canvas nem áudio; emite eventos que renderizador, HUD
  e áudio consomem. Tempo em segundos e passos de no máximo 1/60 s.
- **Consequência:** a física é a mesma em 30, 60, 120 e 144 Hz e a partida inteira roda em Node com robô
  (testes determinísticos por semente).

## ADR-003 — Mundo lógico responsivo e orçamento de pixels

- **Contexto:** a v3 fixava a altura lógica em 960 e esticava a largura: em celular deitado o canvas chegava
  a 4156×1920 (8 Mpx) e o leiturista ficava com ~32 px.
- **Decisão:** largura lógica entre 560 e 900 unidades e altura mínima de 380, conforme a proporção da
  tela; pixels do canvas limitados (2,2 Mpx em toque/estreito; 4,2 Mpx em computador).
- **Consequência:** tamanho útil do personagem em qualquer tela; a folga à frente do jogador varia de ~400 a
  ~650 unidades, então telas largas dão um pouco mais de tempo de reação (aceitável para o 5º ano).

## ADR-004 — Assinatura do save: SHA-256 correto na gravação, variante da v3 só na leitura

- **Contexto:** o `sha256Sync` da v3.4.0 não é SHA-256 padrão (array esparso; a soma com `undefined` zera
  passos). Os saves já gravados carregam o prefixo `sha256-` com essa variante.
- **Decisão:** a v4 grava SHA-256 padrão e aceita, ao ler, o padrão OU a variante antiga
  (`assinatura-legado.js`, cópia fiel, testada contra a função extraída do arquivo publicado). Também
  aceita `fnv1a-` das primeiras versões.
- **Alternativas:** continuar gravando a variante (perpetua o erro e a mentira do prefixo); recusar saves
  antigos (as crianças perderiam o progresso).
- **Consequência:** voltar à v3.4.0 depois de jogar na v4 faz a v3 recusar o save novo. Documentado no
  README e no plano de rollback.
- **Nota de segurança:** a assinatura detecta adulteração casual; não é segredo (qualquer pessoa pode
  recalcular). Não protege ranking; o Hub deve validar por conta própria.

## ADR-005 — Cenário pré-renderizado e copiado 1:1 em pixels do dispositivo

- **Contexto:** medição sem GPU mostrou que copiar bitmaps com escala fracionária custa 1,8–3,4 ms por
  camada; a cópia 1:1 com deslocamento inteiro custa 0,03–0,23 ms.
- **Decisão:** cada camada do cenário é criada com o tamanho exato em pixels da tela e desenhada com
  deslocamento inteiro; a cena final (com zoom) usa o caminho em unidades.
- **Consequência:** a rolagem das camadas lentas anda em passos de 1 pixel; os bitmaps são refeitos a cada
  redimensionamento e troca de fase (dezenas de milissegundos, durante a abertura).

## ADR-006 — Aviso ao Hub apenas na vitória, com nota de 0 a 100

- **Contexto:** o Hub só credita jogos que enviam `SEMAE_FIM_PARTIDA`; a v3.4.0 nunca enviava.
- **Decisão:** enviar uma mensagem por rota vencida na campanha, para a origem da própria página, com nota
  60% leitura + 25% coleta aérea + 15% combo. Nada é enviado em derrota, modo infinito ou fora de `iframe`.
- **Risco aceito e pendente (Q-002):** repetir a mesma rota soma XP de novo (igual ao Caça-Vazamentos).
- **Como desfazer:** remover a chamada `notificarPortal` em `src/js/app/fluxo-resultado.js`.
