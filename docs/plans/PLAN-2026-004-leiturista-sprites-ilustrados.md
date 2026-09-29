# PLAN — Sprites ilustrados

**Plan ID:** PLAN-2026-004 · **Spec:** SPEC-2026-004 · **Status:** DRAFT

## Arquitetura
1. `scripts/preparar_sprites.py` (Python, determinístico): lê `imagens/*.png`, remove o fundo magenta (cor para alfa), recorta as células, alinha pés/pivôs, redimensiona e grava atlas WebP em `src/assets/` e os metadados em `src/js/config/quadros-sprites.js` (gerado).
2. `scripts/construir.mjs` embute os WebP como `data:` URI num bloco `<script type="application/json">` do HTML.
3. `src/js/render/ilustracoes/`: carregamento assíncrono (`Image`+`decode`), recolorização dos uniformes, escolha de quadro (função pura, testável), desenho com espelhamento. O desenho vetorial atual permanece como reserva.
4. Cena final usa poses compostas (leiturista + cão) e as animações de corrida/galope.
5. Vetorial refinado (contorno + sombra) em Kombi, hidrômetro, obstáculos e power-ups.

## Riscos
R-201 franjas magenta no contorno → despill + verificação automática. R-202 peso → WebP com qualidade calibrada e medição. R-203 uniformes com recolorização feia → regras por matiz/luminosidade e revisão por captura.

## Rollback
Branch separada; a v4.0.0 publicada (deploy 84a05488) é o ponto de retorno.
