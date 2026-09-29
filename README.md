# Jogo do Leiturista — SEMAE Piracicaba (v4.1.0)

Jogo educativo de corrida em HTML5 Canvas, publicado no Hub de Educação como **"Semana de Leiturista"**.
O jogador é o leiturista do SEMAE: corre pelas ruas reais das rotas de Piracicaba, lê os hidrômetros,
desvia de obstáculos, foge do cachorro da rota e termina cada rota embarcando na Kombi Branca.

- **Público:** crianças do 5º ano do ensino fundamental (uso em sala, com computador ou celular).
- **Objetivo pedagógico:** conhecer o trabalho do leiturista, a unidade metro cúbico (m³) e a ideia de
  consumo anômalo (vazamento), além de reconhecer o valor social do serviço.
- **Entrega:** um único arquivo `index.html`, autônomo, que funciona sem internet.

## Como jogar

| Ação | Toque / mouse | Teclado |
| --- | --- | --- |
| Pulo baixo | toque curto | Espaço, ↑ ou W (toque rápido) |
| Pulo alto | segurar | segurar a tecla |
| Pausar | botão no canto | P ou Esc |
| Música / efeitos | botões do menu | M / S |

Leia todos os hidrômetros da rota antes que o cão alcance você. Cada rua concluída afasta o cão. Consumo
médio acima de 42 m³ nos últimos 3 meses é uma possível anomalia (+75 pontos). Há legenda de símbolos na
tela "Como jogar".

## As 5 rotas (dados do SCI/SEMAE)

| Fase | Rota | Setor / Rota | Hidrômetros | Ruas |
| --- | --- | --- | --- | --- |
| 1 | São Dimas | 36 / 129 | 15 | 2 |
| 2 | Centro / Vila Rezende | 13 / 157 | 30 | 3 |
| 3 | Bairro dos Alemães | 44 / 207 | 45 | 4 |
| 4 | Jaraguá | 19 / 147 | 60 | 6 |
| 5 | Recanto do Piracicamirim | 31 / 57 | 90 | 15 + "Demais ruas da rota" (6) |

A soma das ruas da Fase 5 nos dados recebidos é 84; o total oficial da rota é 90. Os 6 restantes ficam na
rua sintética "Demais ruas da rota" até confirmação com o SCI (SPEC-2026-003, Q-001).

## Para desenvolvedores

`index.html` é **gerado**: não edite à mão. Edite `src/` e reconstrua.

```bash
npm install            # instala apenas o esbuild (dependência de desenvolvimento)
npm run construir      # verifica o limite de 200 linhas e gera o index.html único
npm test               # testes unitários e de simulação (Node, sem navegador)
npm run testar:e2e     # ponta a ponta em Chrome/Edge real (precisa do index.html construído)
npm run verificar:sprites   # recorte limpo, pés na linha de chão e peso dos atlas (Python + Pillow + NumPy + SciPy)
node tests/mutacao/executar.mjs   # verificação por mutação: os testes detectam defeitos injetados?
```

Estrutura (todo arquivo manual tem no máximo 200 linhas):

```
src/index.html         modelo da página (marcadores <!--CSS--> e <!--JS-->)
src/css/               base, hud, telas, menu, ajuda, responsivo
src/js/config/         constantes, rotas, padrões de percurso, temas, uniforme (cor oficial)
src/js/simulacao/      regras do jogo SEM DOM: física, cão, geração, colisões, ruas, Kombi, retomada
src/js/persistencia/   assinatura, armazenamento, save v2, migração v1, gestor
src/js/render/         câmera responsiva, cenário em camadas pré-renderizadas, sprites vetoriais, efeitos
src/js/render/ilustracoes/  personagens ilustrados: escolha de quadro, espelhamento, atlas
src/assets/            atlas WebP dos personagens (embutidos no HTML como data URI pelo build)
src/js/cena-final/     retrospectiva e encerramento narrativo
src/js/audio/          motor Web Audio, efeitos, música procedural
src/js/interface/      HUD, menu, resultado, ajuda, mensagens, medalhas
src/js/app/            controlador do fluxo, eventos, janela, botões
src/js/integracao/     aviso ao Hub (postMessage)
tests/unidade/         node --test (simulação com robô, persistência, câmera, rotas, interface)
tests/e2e/             Chrome por CDP: layout, campanha, Hub, giro, armazenamento, teclado, rede, custo, v3
tests/mutacao/         defeitos injetados para provar que os testes protegem
scripts/               build, limite de linhas, e a preparação dos sprites (recorte do fundo magenta -> WebP)
versoes-preservadas/   v3.4.0 que estava no ar (com SHA-256) e o README antigo
```

## Personagens ilustrados (v4.1.0)

O leiturista e o cão usam ilustrações **geradas por inteligência artificial (ChatGPT) a pedido do
demandante** (CTI/SEMAE), a partir de um roteiro de instruções de arte. Os originais (PNG com fundo
magenta) estão versionados em `imagens/` (decisão do demandante em 2026-09-29, SPEC-2026-004 Q-201/Q-202,
sem restrição adicional ao uso de imagens geradas por IA); o jogo usa só os recortes otimizados em
`src/assets/*.webp` (5 atlas, ~457 KB, cada um ≤300 KB), embutidos no `index.html`.

- Para regerar os atlas: `python scripts/preparar_sprites.py` (lê `imagens/`, remove o fundo, alinha os pés,
  escreve `src/assets/` e `src/js/config/quadros-sprites.js`), depois `npm run verificar:sprites`.
- **Uniforme único** na cor oficial do SEMAE: a camisa é o azul do logotipo (`#005E9F`, medido em
  `Logo_completo.png`). A cor é aplicada na própria arte durante a preparação dos sprites
  (`scripts/sprites/uniforme.py`: uma transformação de matiz/brilho para todo o azul da arte, o que mantém
  boné e calça mais escuros que a camisa, sombras e contornos); a faixa refletiva continua amarela. Não há
  mais troca nem desbloqueio de uniformes; saves antigos com outro uniforme continuam aceitos e o valor é
  ignorado. Para mudar a cor: `AZUL_OFICIAL` em `uniforme.py` e `AZUL_SEMAE` em `config/uniformes.js`.
- Reserva: se as imagens não carregarem, o jogo continua com o desenho vetorial (testado com as imagens
  bloqueadas). Kombi, hidrômetros, obstáculos e power-ups (vetoriais) ganharam contorno escuro para
  combinar com as ilustrações.

## Salvamento

Chave `semae.jogo-do-leiturista-3.v2` no `localStorage` (limite de 256 KB), mesmo envelope da v3.4.0
(`app`, `versaoJogo`, `versaoEsquema`, `criadoEm`, `estado`, `assinatura`). A v4 **aceita os saves da
v3.4.0**, do esquema v1 e os arquivos exportados; recusa saves adulterados e maiores que 256 KB, sem
quebrar. Save ilegível não é apagado: fica uma cópia em `<chave>.invalido`. Exportar/importar `.json` está
no menu ("Salvar ou carregar progresso"). Nenhum dado pessoal é coletado.

Atenção: a v3.4.0 gravava a assinatura com uma variante que **não é o SHA-256 padrão**. A v4 grava com o
SHA-256 correto e ainda verifica a variante antiga ao ler (ADR-004). Voltar para a v3.4.0 depois de jogar na
v4 faz a v3 recusar o save novo.

## Integração com o Hub

Dentro de um `iframe`, ao **vencer** uma rota da campanha, o jogo envia à mesma origem da página:

```js
{ tipo: 'SEMAE_FIM_PARTIDA', jogoId: 'app_jogo_do_leiturista', pontuacao /* 0-100 */,
  vitoria: true, duracao, estrelas /* 1-3 */, pontosDoJogo, carimbo }
```

O Hub soma `pontuacao` ao XP da equipe a cada mensagem e marca o jogo como concluído (a v3.4.0 nunca
enviava nada). Derrota, modo infinito e execução fora de `iframe` não enviam. A nota (0–100) é 60% leitura,
25% coleta aérea e 15% combo, a mesma régua das medalhas.

## Desempenho e responsividade

- O mundo do jogo tem largura de 560 a 900 unidades conforme a proporção da tela; o canvas interno respeita
  um orçamento de pixels (2,2 Mpx em celular/toque, 4,2 Mpx em computador). A v3.4.0 chegava a 8 Mpx em
  celular deitado.
- O cenário é pré-renderizado em camadas e copiado 1:1 em pixels do dispositivo (cerca de 0,1 ms por
  camada, até sem GPU). A simulação avança por tempo decorrido em passos de no máximo 1/60 s.
- Medido sem GPU (pior caso), custo médio por quadro (varia até ~30% entre execuções nesta máquina):
  v4.1.0: desktop 1920×1080 3,8–5,3 ms; notebook ≈2,2 ms; celular em pé ≈2,3 ms; celular deitado ≈3,0 ms;
  tablet ≈3,9 ms (limite do teste: 4,5 ms). A v3.4.0, na mesma medição: 2,4 / 2,3 / 2,5 / 7,2 / 5,3 ms
  (desktop, notebook, em pé, deitado, tablet).
- Pontos de quebra verificados: 1600, 1280, 1080, 960, 700, 430 e 360 px, em pé e deitado.

**Limitação:** não houve teste em aparelhos físicos (Android, iOS, Chromebook); as medições usam Chrome
headless com rasterização por CPU como aproximação do pior caso.

## Histórico de versões

- **4.1.0 (2026-09-29)** — personagens ilustrados (leiturista e cão animados por quadros, poses da cena
  final), uniforme único na cor oficial do SEMAE (sem troca de uniformes), contorno escuro no vetorial (Kombi, hidrômetros,
  obstáculos, power-ups), coreografia da cena final centrada na tela e sem emendas no chão com zoom.
  Ver `docs/specs/SPEC-2026-004…` e `docs/evidencias/EVID-2026-004.md`.
- **4.0.0 (2026-09-29)** — reescrita modular; arte nova; HUD compacto; canvas proporcional à tela; layout
  responsivo; legenda "Como jogar"; aviso ao Hub; correção de defeitos da v3 (retomada de partida,
  progresso de rua com hidrômetro perdido, total da Fase 5, totais da campanha, `alert` bloqueante, reinício
  acidental, temporizadores); compatibilidade de saves. Ver `docs/decisoes/DECISOES-TECNICAS.md`.
- **3.4.0** — versão anterior, preservada em `versoes-preservadas/v3.4.0-no-ar/`.

## Governança (SDD)

`docs/specs/SPEC-2026-003…` e `SPEC-2026-004…`, `docs/plans/PLAN-…`, `docs/tasks/TASK-…`,
`docs/evidencias/EVID-2026-003.md` e `EVID-2026-004.md`. Validação: `python scripts/validate_sdd.py` e
`python scripts/verificar_limite_200_linhas.py`.

*SEMAE Piracicaba — Serviço Municipal de Água e Esgoto · Coordenadoria de Tecnologia da Informação*
