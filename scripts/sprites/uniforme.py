"""Uniforme único: troca o azul da arte pelo azul oficial do SEMAE.

A cor oficial vem do logotipo (Logo_completo.png, mediana dos pixels azuis: rgb(0, 94, 159) = #005E9F).
As ilustrações foram geradas com um azul mais claro e violáceo (camisa ~#0357D5); em vez de listar regiões
(boné, camisa, calça), aplica-se uma única transformação de matiz e brilho a todo o azul da arte, o que
preserva as relações de tom (boné e calça mais escuros que a camisa), sombras, brilhos e contorno.
O amarelo da faixa refletiva, a pele, o cabelo e o cão não entram (matiz fora da janela do azul).
Funções puras sobre matrizes NumPy.
"""
from __future__ import annotations

import numpy as np

AZUL_OFICIAL = "#005E9F"
# Tom "chapado" da camisa na arte original (matiz em graus, saturação e valor de 0 a 1), medido nos atlas.
REF_CAMISA = (215.0, 0.99, 0.83)
JANELA_MATIZ = (195.0, 205.0, 240.0, 250.0)   # peso 0 -> 1 -> 1 -> 0
SATURACAO_MINIMA = (0.45, 0.70)               # peso 0 -> 1 (exclui o ciano claro da tela do celular)


def hex_para_hsv(hex_: str) -> tuple[float, float, float]:
    n = int(hex_.lstrip("#"), 16)
    rgb = np.array([[(n >> 16) & 255, (n >> 8) & 255, n & 255]], np.float32)
    h, s, v = rgb_para_hsv(rgb)
    return float(h[0]), float(s[0]), float(v[0])


def rgb_para_hsv(rgb: np.ndarray) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    c = rgb.astype(np.float32) / 255.0
    mx, mn = c.max(-1), c.min(-1)
    d = mx - mn + 1e-9
    r, g, b = c[..., 0], c[..., 1], c[..., 2]
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60.0
    return h, np.where(mx > 0, (mx - mn) / (mx + 1e-9), 0.0), mx


def hsv_para_rgb(h: np.ndarray, s: np.ndarray, v: np.ndarray) -> np.ndarray:
    h6 = (h % 360.0) / 60.0
    i = np.floor(h6).astype(int) % 6
    f = h6 - np.floor(h6)
    p, q, t = v * (1 - s), v * (1 - s * f), v * (1 - s * (1 - f))
    r = np.choose(i, [v, q, p, p, t, v])
    g = np.choose(i, [t, v, v, q, p, p])
    b = np.choose(i, [p, p, t, v, v, q])
    return np.stack([r, g, b], -1) * 255.0


def _rampa(x: np.ndarray, a: float, b: float) -> np.ndarray:
    return np.clip((x - a) / (b - a), 0.0, 1.0)


def peso_do_azul(h: np.ndarray, s: np.ndarray) -> np.ndarray:
    """0 a 1: quanto o pixel é "azul da arte" (mistura suave, sem borda dura nas transições)."""
    a, b, c, d = JANELA_MATIZ
    peso_matiz = np.minimum(_rampa(h, a, b), 1.0 - _rampa(h, c, d))
    return peso_matiz * _rampa(s, *SATURACAO_MINIMA)


def aplicar_azul_oficial(rgba: np.ndarray, alvo_hex: str = AZUL_OFICIAL) -> np.ndarray:
    """RGBA (uint8) -> RGBA (uint8) com o azul da arte trocado pelo azul oficial."""
    alvo_h, alvo_s, alvo_v = hex_para_hsv(alvo_hex)
    ref_h, ref_s, ref_v = REF_CAMISA
    rgb = rgba[..., :3]
    h, s, v = rgb_para_hsv(rgb)
    peso = peso_do_azul(h, s)
    novo_h = h + (alvo_h - ref_h)
    novo_s = np.clip(s * (alvo_s / ref_s), 0.0, 1.0)
    novo_v = np.clip(v * (alvo_v / ref_v), 0.0, 1.0)
    trocado = hsv_para_rgb(novo_h, novo_s, novo_v)
    misturado = rgb.astype(np.float32) * (1.0 - peso[..., None]) + trocado * peso[..., None]
    saida = rgba.copy()
    saida[..., :3] = np.clip(np.rint(misturado), 0, 255).astype(np.uint8)
    return saida
