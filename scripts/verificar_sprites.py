#!/usr/bin/env python3
"""Verifica os atlas de sprites gerados (AC-202, AC-205 da SPEC-2026-004).

Falha (código 1) se algum atlas: passar de 300 KB; tiver medidas diferentes das do arquivo de
metadados; tiver quadro vazio; tiver pixel opaco de magenta do fundo ou franja lilás; ou tiver o
pé fora da linha de chão declarada; ou tiver a camisa fora do azul oficial do SEMAE. Uso: python scripts/verificar_sprites.py
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
from sprites.recorte import magentice, matiz_lilas  # noqa: E402
from sprites.uniforme import AZUL_OFICIAL, rgb_para_hsv  # noqa: E402

RAIZ = Path(__file__).resolve().parents[1]
ASSETS = RAIZ / "src" / "assets"
METADADOS = RAIZ / "src" / "js" / "config" / "quadros-sprites.js"
LIMITE_BYTES = 300 * 1024
LIMITE_MAGENTA = 100      # magentice legítima da arte é <= 45 (coleira vermelha)
LIMITE_LILAS_POR_QUADRO = 25
TOLERANCIA_PE_PX = 1
MARGEM = 3                # margem transparente de cada célula (sprites/atlas.py)
TOLERANCIA_COR = 10       # por canal, na camisa (azul oficial do SEMAE, do logotipo)


def ler_metadados() -> dict:
    texto = METADADOS.read_text(encoding="utf-8")
    return {m.group(1): json.loads(m.group(2)) for m in re.finditer(r"'([\w-]+)': (\{.*\}),", texto)}


def verificar_folha(nome: str, meta: dict, problemas: list[str]) -> None:
    caminho = ASSETS / f"{nome}.webp"
    if not caminho.exists():
        problemas.append(f"{nome}: atlas ausente")
        return
    tamanho = caminho.stat().st_size
    if tamanho > LIMITE_BYTES:
        problemas.append(f"{nome}: {tamanho} bytes passa de {LIMITE_BYTES}")
    imagem = np.asarray(Image.open(caminho).convert("RGBA"))
    cw, ch = meta["celula"]
    linhas = -(-meta["quadros"] // meta["colunas"])
    if imagem.shape[1] != cw * meta["colunas"] or imagem.shape[0] != ch * linhas:
        problemas.append(f"{nome}: atlas {imagem.shape[1]}x{imagem.shape[0]} difere dos metadados")
        return
    for i in range(meta["quadros"]):
        c, l = i % meta["colunas"], i // meta["colunas"]
        quadro = imagem[l * ch:(l + 1) * ch, c * cw:(c + 1) * cw]
        opaco = quadro[..., 3] > 128
        if opaco.sum() < 500:
            problemas.append(f"{nome}[{i}]: quadro vazio")
            continue
        rgb = quadro[..., :3].astype(np.float32)
        magenta = int(((magentice(rgb) > LIMITE_MAGENTA) & opaco).sum())
        lilas = int((matiz_lilas(rgb) & opaco).sum())
        if magenta:
            problemas.append(f"{nome}[{i}]: {magenta} pixel(s) de magenta opaco")
        if lilas > LIMITE_LILAS_POR_QUADRO:
            problemas.append(f"{nome}[{i}]: {lilas} pixel(s) lilás (franja do fundo)")
        linhas_opacas = np.where((quadro[..., 3] > 60).any(axis=1))[0]
        if meta.get("alinhamento") == "teto":   # cenas com a van: o teto fica na margem; os pés podem descer abaixo das rodas
            if abs(int(linhas_opacas.min()) - MARGEM) > TOLERANCIA_PE_PX:
                problemas.append(f"{nome}[{i}]: teto em y={int(linhas_opacas.min())}, esperado {MARGEM}")
        elif abs(int(linhas_opacas.max()) - meta["pivo"][1]) > TOLERANCIA_PE_PX:
            problemas.append(f"{nome}[{i}]: pé em y={int(linhas_opacas.max())}, esperado {meta['pivo'][1]}")


def verificar_cor_da_camisa(nome: str, problemas: list[str]) -> None:
    """A camisa (o azul mais claro e mais frequente da arte) precisa estar no azul oficial do SEMAE."""
    rgba = np.asarray(Image.open(ASSETS / f"{nome}.webp").convert("RGBA"))
    rgb = rgba[..., :3][rgba[..., 3] > 250]
    h, s, v = rgb_para_hsv(rgb)
    camisa = rgb[(h > 195) & (h < 225) & (s > 0.9) & (v > 0.55) & (v < 0.70)]
    if len(camisa) < 2000:
        problemas.append(f"{nome}: poucos pixels de camisa ({len(camisa)}) para medir a cor")
        return
    mediana = np.median(camisa, axis=0).astype(int)
    lido = tuple(int(c) for c in mediana)
    alvo = int(AZUL_OFICIAL.lstrip("#"), 16)
    esperado = np.array([(alvo >> 16) & 255, (alvo >> 8) & 255, alvo & 255])
    if np.abs(mediana - esperado).max() > TOLERANCIA_COR:
        problemas.append(f"{nome}: camisa em rgb{lido}, o azul oficial {AZUL_OFICIAL} é rgb{tuple(int(c) for c in esperado)}")


def main() -> int:
    metadados = ler_metadados()
    problemas: list[str] = []
    for nome, meta in metadados.items():
        verificar_folha(nome, meta, problemas)
    for nome in ("leiturista-corrida", "leiturista-acoes", "leiturista-pulo", "leiturista-caminhada", "leiturista-gestos"):
        verificar_cor_da_camisa(nome, problemas)
    extras = sorted(p.stem for p in ASSETS.glob("*.webp") if p.stem not in metadados)
    if extras:
        problemas.append(f"atlas sem metadados: {', '.join(extras)}")
    if problemas:
        print("FALHOU:\n  " + "\n  ".join(problemas), file=sys.stderr)
        return 1
    total = sum((ASSETS / f"{n}.webp").stat().st_size for n in metadados)
    print(f"OK: {len(metadados)} atlas, {total / 1024:.0f} KB no total, recorte limpo e pés na linha de chão.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
