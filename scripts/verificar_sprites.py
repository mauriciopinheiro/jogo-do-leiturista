#!/usr/bin/env python3
"""Verifica os atlas de sprites gerados (AC-202, AC-205 da SPEC-2026-004).

Falha (código 1) se algum atlas: passar de 300 KB; tiver medidas diferentes das do arquivo de
metadados; tiver quadro vazio; tiver pixel opaco de magenta do fundo ou franja lilás; ou tiver o
pé fora da linha de chão declarada. Uso: python scripts/verificar_sprites.py
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

RAIZ = Path(__file__).resolve().parents[1]
ASSETS = RAIZ / "src" / "assets"
METADADOS = RAIZ / "src" / "js" / "config" / "quadros-sprites.js"
LIMITE_BYTES = 300 * 1024
LIMITE_MAGENTA = 100      # magentice legítima da arte é <= 45 (coleira vermelha)
LIMITE_LILAS_POR_QUADRO = 25
TOLERANCIA_PE_PX = 1


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
        base = int(np.where((quadro[..., 3] > 60).any(axis=1))[0].max())
        if abs(base - meta["pivo"][1]) > TOLERANCIA_PE_PX:
            problemas.append(f"{nome}[{i}]: pé em y={base}, esperado {meta['pivo'][1]}")


def main() -> int:
    metadados = ler_metadados()
    problemas: list[str] = []
    for nome, meta in metadados.items():
        verificar_folha(nome, meta, problemas)
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
