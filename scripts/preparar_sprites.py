#!/usr/bin/env python3
"""Prepara os sprites: imagens/*.png (fundo magenta) -> src/assets/*.webp + metadados em JS.

Uso: python scripts/preparar_sprites.py [--previa PASTA]
As imagens originais (geradas pelo demandante no ChatGPT) ficam em imagens/ e não vão para o Git;
os atlas otimizados e o arquivo de metadados (gerado) vão. Determinístico: mesma entrada, mesma saída.
"""
from __future__ import annotations

import argparse
import json
import statistics
import sys
from pathlib import Path

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
from sprites.recorte import ancora_x, chave_magenta, separar_quadros  # noqa: E402
from sprites.uniforme import aplicar_azul_oficial  # noqa: E402

RAIZ = Path(__file__).resolve().parents[1]
ORIGEM = RAIZ / "imagens"
DESTINO = RAIZ / "src" / "assets"
METADADOS = RAIZ / "src" / "js" / "config" / "quadros-sprites.js"
LIMITE_BYTES = 300 * 1024
QUALIDADE = 86
MARGEM = 3
RAZAO_CENA_FINAL = 0.735   # a cena final foi desenhada maior; iguala o boné/cão ao das outras folhas

FOLHAS = [
    dict(nome="leiturista-corrida", arquivo="leiturista-corrida.png", colunas=4, linhas=2, ancora="tronco", grupo="leiturista"),
    dict(nome="leiturista-acoes", arquivo="leiturista-acoes.png", colunas=4, linhas=2, ancora="tronco", grupo="leiturista"),
    dict(nome="cao-galope", arquivo="cao-galope.png", colunas=3, linhas=2, ancora="massa", grupo="cao"),
    dict(nome="cao-acoes", arquivo="cao-acoes.png", colunas=3, linhas=2, ancora="massa", grupo="cao"),
    dict(nome="cena-final", arquivo="final.png", colunas=2, linhas=2, ancora="esquerda", grupo="final"),
]
# Alvo de tamanho: altura mediana dos quadros de corrida (leiturista) e largura mediana do galope (cão).
ALVOS = {"leiturista": ("altura", 240.0, "leiturista-corrida"), "cao": ("largura", 250.0, "cao-galope")}
# Altura/largura em unidades do jogo que esse alvo representa (o desenho vetorial tinha 78 x 75).
UNIDADES_ALVO = {"leiturista": 92.0, "cao": 96.0}


def carregar_quadros(folha: dict) -> list[dict]:
    rgb = np.asarray(Image.open(ORIGEM / folha["arquivo"]).convert("RGB"))
    quadros = separar_quadros(chave_magenta(rgb), folha["colunas"], folha["linhas"])
    if folha["grupo"] != "cao":   # uniforme único na cor oficial do SEMAE (o cão não tem azul)
        quadros = [aplicar_azul_oficial(q) for q in quadros]
    return [dict(img=q, px=ancora_x(q, folha["ancora"])) for q in quadros]


def redimensionar(quadro: dict, escala: float) -> dict:
    altura, largura = quadro["img"].shape[:2]
    novo = (max(1, round(largura * escala)), max(1, round(altura * escala)))
    img = Image.fromarray(quadro["img"], "RGBA").convert("RGBa").resize(novo, Image.LANCZOS).convert("RGBA")
    return dict(img=np.asarray(img), px=quadro["px"] * novo[0] / largura)


def medida_de_referencia(quadros: list[dict], eixo: str) -> float:
    indice = 0 if eixo == "altura" else 1
    return statistics.median(q["img"].shape[indice] for q in quadros)


def montar_atlas(quadros: list[dict], colunas: int, assimetrico: bool = False) -> tuple[Image.Image, tuple[int, int], int]:
    """Uniformiza as células. Simétrica: o pivô é o centro. Assimétrica: o pivô é a borda esquerda."""
    esquerda = max(q["px"] for q in quadros)
    direita = max(q["img"].shape[1] - q["px"] for q in quadros)
    meia = int(np.ceil(max(esquerda, direita))) + MARGEM
    largura_celula = int(np.ceil(direita)) + MARGEM * 2 if assimetrico else meia * 2
    pivo_x = MARGEM if assimetrico else meia
    altura_celula = max(q["img"].shape[0] for q in quadros) + MARGEM * 2
    linhas = -(-len(quadros) // colunas)
    atlas = Image.new("RGBA", (largura_celula * colunas, altura_celula * linhas), (0, 0, 0, 0))
    for i, q in enumerate(quadros):
        altura, largura = q["img"].shape[:2]
        x = (i % colunas) * largura_celula + pivo_x - round(q["px"])
        y = (i // colunas) * altura_celula + altura_celula - MARGEM - altura
        atlas.alpha_composite(Image.fromarray(q["img"], "RGBA"), (x, y))
    return atlas, (largura_celula, altura_celula), pivo_x


def main() -> int:
    analisador = argparse.ArgumentParser()
    analisador.add_argument("--previa", type=Path, help="pasta para salvar prévias sobre fundo cinza")
    args = analisador.parse_args()
    DESTINO.mkdir(parents=True, exist_ok=True)
    brutos = {f["nome"]: carregar_quadros(f) for f in FOLHAS}
    escalas = {}
    for grupo, (eixo, alvo, folha_ref) in ALVOS.items():
        escalas[grupo] = alvo / medida_de_referencia(brutos[folha_ref], eixo)
    escalas["final"] = escalas["leiturista"] * RAZAO_CENA_FINAL
    metadados = {"unidadesPorPixel": {}, "folhas": {}}
    for grupo, unidades in UNIDADES_ALVO.items():
        metadados["unidadesPorPixel"][grupo] = round(unidades / ALVOS[grupo][1], 5)
    metadados["unidadesPorPixel"]["final"] = metadados["unidadesPorPixel"]["leiturista"]
    for folha in FOLHAS:
        quadros = [redimensionar(q, escalas[folha["grupo"]]) for q in brutos[folha["nome"]]]
        atlas, celula, pivo_x = montar_atlas(quadros, folha["colunas"], folha["ancora"] == "esquerda")
        caminho = DESTINO / f"{folha['nome']}.webp"
        atlas.save(caminho, "WEBP", quality=QUALIDADE, alpha_quality=100, method=6)
        tamanho = caminho.stat().st_size
        if tamanho > LIMITE_BYTES:
            print(f"ERRO: {caminho.name} tem {tamanho} bytes (limite {LIMITE_BYTES})", file=sys.stderr)
            return 1
        metadados["folhas"][folha["nome"]] = dict(
            colunas=folha["colunas"], quadros=len(quadros), celula=list(celula), grupo=folha["grupo"],
            pivo=[pivo_x, celula[1] - MARGEM])
        print(f"{caminho.name}: {atlas.size[0]}x{atlas.size[1]}, célula {celula[0]}x{celula[1]}, {tamanho / 1024:.0f} KB")
        if args.previa:
            args.previa.mkdir(parents=True, exist_ok=True)
            fundo = Image.new("RGBA", atlas.size, (200, 205, 215, 255))
            fundo.alpha_composite(atlas)
            fundo.convert("RGB").save(args.previa / f"{folha['nome']}.png")
    linhas = ["  unidadesPorPixel: " + json.dumps(metadados["unidadesPorPixel"]) + ",", "  folhas: {"]
    linhas += [f"    '{nome}': {json.dumps(dados, ensure_ascii=False)}," for nome, dados in metadados["folhas"].items()]
    cabecalho = [
        "/**",
        " * @file quadros-sprites.js",
        " * @description GERADO por scripts/preparar_sprites.py. Não editar à mão.",
        " * Medidas dos atlas de sprites ilustrados (px do atlas) e a escala para unidades do jogo.",
        " */",
        "export const SPRITES = {",
    ]
    METADADOS.write_text("\n".join(cabecalho + linhas + ["  }", "};", ""]), encoding="utf-8")
    print(f"metadados: {METADADOS.relative_to(RAIZ)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
