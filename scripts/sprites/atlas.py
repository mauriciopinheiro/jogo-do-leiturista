"""Montagem dos atlas: redimensiona os quadros e os organiza em células de tamanho uniforme."""
from __future__ import annotations

import statistics

import numpy as np
from PIL import Image

MARGEM = 3


def redimensionar(quadro: dict, escala: float) -> dict:
    altura, largura = quadro["img"].shape[:2]
    novo = (max(1, round(largura * escala)), max(1, round(altura * escala)))
    img = Image.fromarray(quadro["img"], "RGBA").convert("RGBa").resize(novo, Image.LANCZOS).convert("RGBA")
    return dict(img=np.asarray(img), px=quadro["px"] * novo[0] / largura)


def medida_de_referencia(quadros: list[dict], eixo: str) -> float:
    indice = 0 if eixo == "altura" else 1
    return statistics.median(q["img"].shape[indice] for q in quadros)


def _colunas(quadros: list[dict], ancora: str) -> tuple[int, int]:
    """(largura da célula, coluna do pivô). 'esquerda'/'direita' colam o pivô na borda; senão, centro."""
    esquerda = max(q["px"] for q in quadros)
    direita = max(q["img"].shape[1] - q["px"] for q in quadros)
    if ancora == "esquerda":
        largura = int(np.ceil(direita)) + MARGEM * 2
        return largura, MARGEM
    if ancora == "direita":
        largura = int(np.ceil(esquerda)) + MARGEM * 2
        return largura, largura - MARGEM
    meia = int(np.ceil(max(esquerda, direita))) + MARGEM
    return meia * 2, meia


def montar_atlas(quadros: list[dict], colunas: int, ancora: str, alinhamento: str = "base") -> tuple[Image.Image, tuple[int, int], tuple[int, int]]:
    """@returns (atlas, (largura, altura) da célula, (x, y) do pivô dentro da célula).

    'base': o ponto mais baixo de cada quadro fica na linha de chão. 'teto': o chão fica a uma altura
    fixa abaixo do topo (a menor altura entre os quadros); o que passa disso (pés à frente da van) desce.
    """
    largura_celula, pivo_x = _colunas(quadros, ancora)
    alturas = [q["img"].shape[0] for q in quadros]
    if alinhamento == "teto":
        altura_van = min(alturas)
        abaixo = max(h - altura_van for h in alturas)
        altura_celula = MARGEM * 2 + altura_van + abaixo
        pivo_y = MARGEM + altura_van
    else:
        altura_celula = max(alturas) + MARGEM * 2
        pivo_y = altura_celula - MARGEM
    linhas = -(-len(quadros) // colunas)
    atlas = Image.new("RGBA", (largura_celula * colunas, altura_celula * linhas), (0, 0, 0, 0))
    for i, q in enumerate(quadros):
        altura = q["img"].shape[0]
        x = (i % colunas) * largura_celula + pivo_x - round(q["px"])
        topo = MARGEM if alinhamento == "teto" else pivo_y - altura
        atlas.alpha_composite(Image.fromarray(q["img"], "RGBA"), (x, (i // colunas) * altura_celula + topo))
    return atlas, (largura_celula, altura_celula), (pivo_x, pivo_y)
