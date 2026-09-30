# PLAN — Sprites da fase 2

**Plan ID:** PLAN-2026-005 · **Spec:** SPEC-2026-005 · **Status:** DRAFT

## Arquitetura
1. Pipeline (`scripts/preparar_sprites.py` + `scripts/sprites/{folhas,atlas,recorte,uniforme}.py`): tabela de folhas com escala própria
   (`u_px`), âncora horizontal (`tronco`, `massa`, `esquerda`, `direita`) e alinhamento vertical (`base` ou `teto`); mesmas regras de recorte e
   do azul oficial; metadados com `upp` por folha. Os 5 atlas da fase 1 saem idênticos (hash conferido).
2. `render/ilustracoes/quadros.js` (puro): escolha do quadro de pulo por `vy`/`alt`, caminhada, latido/investida/osso, Kombi e sequências por tempo.
3. `render/cenas.js`: Kombi (ilustrada ou vetorial), sequências de descer/entrar, degrau rua-calçada do menino e cena da derrota.
4. Simulação (`kombi.js`): subestágios `saindo` e `entrando` com tempos em `TEMPOS`; posição de parada da Kombi calculada pela linha de largada; cadência das pernas por distância.
5. Correção do evento de power-up (`qual`).

## Riscos
R-301 a IA desenhou a van e o menino em escalas ligeiramente diferentes entre folhas → calibração medida e documentada; R-302 peso (12 atlas) → qualidade WebP 80 e medição;
R-303 sequências alongam a abertura (+1,2 s, pulável) e o encerramento (+1,0 s) → constantes em `TEMPOS`.

## Rollback
A v4.1.0 publicada (deploy `a69b57b1`, commit `ce62faa` na `main` do GitHub) é o ponto de retorno.
