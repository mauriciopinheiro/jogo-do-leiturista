"""Recorte de sprites: remove o fundo magenta e separa os quadros de uma folha em grade.

Funções puras sobre matrizes NumPy (sem arquivos), para poderem ser testadas.
"""
from __future__ import annotations

import numpy as np
from scipy import ndimage as ndi

LIMIAR_FUNDO = 200          # "magentice" acima disto é fundo puro
BANDA_BORDA = 3             # largura (px) em que a mistura contorno/fundo é reconstruída
LIMIAR_MISTURA = 60         # nenhuma cor legítima da arte passa disto: é mistura com o fundo, mesmo em vãos finos
AREA_MINIMA = 60            # componentes menores que isto são ruído


def magentice(rgb: np.ndarray) -> np.ndarray:
    """~255 no magenta puro; <=45 em qualquer cor do desenho (o vermelho da coleira dá ~43)."""
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    return np.minimum(r, b) - g


def chave_magenta(rgb: np.ndarray) -> np.ndarray:
    """RGB (uint8) -> RGBA (uint8) sem fundo, com borda suave e cor sem mistura de magenta."""
    im = rgb.astype(np.float32)
    m = magentice(im)
    fundo = m > LIMIAR_FUNDO
    banda = (ndi.binary_dilation(fundo, iterations=BANDA_BORDA) | (m > LIMIAR_MISTURA)) & ~fundo
    alfa = np.ones(m.shape, np.float32)
    alfa[fundo] = 0.0
    # nas bordas o pixel é a*contorno + (1-a)*magenta; o contorno é sempre escuro (azul-marinho/marrom)
    alfa[banda] = np.clip((255.0 - m[banda]) / 276.0 * 1.08, 0.0, 1.0)
    magenta = np.array([255, 0, 255], np.float32)
    a3 = np.maximum(alfa, 1e-3)[..., None]
    limpo = np.where(banda[..., None], (im - (1 - a3) * magenta) / a3, im)
    limpo = np.clip(limpo, 0, 255)
    alfa[matiz_lilas(limpo)] = 0.0
    return np.dstack([limpo, alfa * 255.0]).astype(np.uint8)


def matiz_lilas(rgb: np.ndarray) -> np.ndarray:
    """Pixels de matiz 255-335 graus: sobra de magenta misturado em vãos finos.

    Os azuis legítimos da arte vão até ~243 graus e a coleira/língua (rosa/vermelho) passam de 335.
    """
    c = rgb / 255.0
    mx, mn = c.max(-1), c.min(-1)
    d = mx - mn + 1e-9
    r, g, b = c[..., 0], c[..., 1], c[..., 2]
    matiz = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    return (matiz > 255) & (matiz < 335) & (d / (mx + 1e-9) > 0.10) & (mx > 0.35)


def separar_quadros(rgba: np.ndarray, colunas: int, linhas: int) -> list[np.ndarray]:
    """Recorta um RGBA por quadro, na ordem esquerda->direita, cima->baixo.

    Cada componente conexo de pixels opacos pertence à célula da grade onde está o seu centro;
    o recorte é a caixa da união dos componentes da célula (pixels de outros quadros são apagados).
    """
    alfa = rgba[..., 3]
    rotulos, total = ndi.label(alfa > 60, structure=np.ones((3, 3), int))
    altura, largura = alfa.shape
    quadros: dict[tuple[int, int], list[int]] = {}
    areas = ndi.sum(np.ones_like(alfa), rotulos, index=np.arange(1, total + 1))
    centros = ndi.center_of_mass(np.ones_like(alfa), rotulos, index=np.arange(1, total + 1))
    for indice, (area, (cy, cx)) in enumerate(zip(areas, centros), start=1):
        if area < AREA_MINIMA:
            continue
        celula = (min(linhas - 1, int(cy * linhas / altura)), min(colunas - 1, int(cx * colunas / largura)))
        quadros.setdefault(celula, []).append(indice)
    saida = []
    for linha in range(linhas):
        for coluna in range(colunas):
            ids = quadros.get((linha, coluna))
            if not ids:
                raise ValueError(f"célula ({linha},{coluna}) sem figura")
            mascara = np.isin(rotulos, ids)
            ys, xs = np.where(mascara)
            corte = rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1].copy()
            corte[~mascara[ys.min():ys.max() + 1, xs.min():xs.max() + 1]] = 0
            saida.append(corte)
    return saida


def ancora_x(quadro: np.ndarray, modo: str) -> float:
    """Coluna do pivô horizontal: 'tronco' (massa da metade superior), 'massa', 'centro' ou 'esquerda'."""
    alfa = quadro[..., 3].astype(np.float64)
    altura, largura = alfa.shape
    if modo == "centro":
        return largura / 2.0
    if modo == "esquerda":
        return 0.0
    faixa = alfa[: int(altura * 0.55)] if modo == "tronco" else alfa
    colunas = np.arange(largura)
    peso = faixa.sum(axis=0)
    return float((colunas * peso).sum() / max(peso.sum(), 1.0))
