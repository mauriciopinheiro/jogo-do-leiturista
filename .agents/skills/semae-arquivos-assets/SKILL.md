---
name: semae-arquivos-assets
description: "Valida formatos, tamanhos e regras de assets/publicação dos jogos SEMAE. Use ao adicionar imagens, SVG, fotografia, vídeo, teaser, save, fontes ou preparar pacote final."
---

# Skill: Orçamento de arquivos e assets

## Limites normativos

| Item | Formato | Limite | Regra |
|---|---|---:|---|
| Aplicação | `.html` | 2 MB | arquivo único; minificação opcional |
| Pacote publicado | pasta | 8 MB | inclui imagens e teaser referenciados |
| Ilustração/ícone | `.svg` | 150 KB | preferencial; inline quando reutilizado |
| Raster | `.webp`, `.png` | 300 KB/arquivo | JPG só para fotografia histórica; sem GIF |
| Fotografia | `.jpg` | 500 KB | maior lado <=1600 px + crédito |
| Teaser da ficha | `.mp4` H.264 | 20 MB | 1080p, <=30 s, fora do HTML |
| Vídeo de abertura | `.mp4` H.264 | 80 MB | opcional, sob demanda, nunca bloqueante |
| Save | `.json` | 256 KB | estrutura da seção 6; exportável |
| Fonte | sistema | — | webfont externa proibida |
| Documentação | `.md` | — | README versionado junto ao código |

## Regras

- Não esconder mídia pesada em base64 dentro do HTML para contornar limites.
- GIF é proibido.
- Fotografia histórica em JPG deve ter crédito de fonte.
- Teaser e vídeo opcional não integram o caminho crítico do jogo offline.
- SVG reutilizado deve preferir símbolos internos para reduzir duplicação.
- Otimizar imagens antes de aumentar orçamento.

## Procedimento de review de asset

1. Verificar necessidade pedagógica/visual.
2. Verificar formato permitido.
3. Verificar tamanho individual.
4. Verificar orçamento total do pacote.
5. Verificar crédito/licença quando aplicável.
6. Testar carregamento em 4G e rede limitada.
7. Confirmar que ausência do asset externo opcional não impede jogar.
