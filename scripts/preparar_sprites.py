#!/usr/bin/env python3
"""Prepara os sprites: imagens/*.png (fundo magenta) -> src/assets/*.webp + metadados em JS.

Uso: python scripts/preparar_sprites.py [--previa PASTA]
As imagens originais (geradas pelo demandante no ChatGPT) ficam em imagens/ (versionadas); o jogo usa
os atlas otimizados de src/assets/ e o arquivo de metadados (gerado). Determinístico: mesma entrada,
mesma saída. A tabela das folhas está em scripts/sprites/folhas.py.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
from sprites.atlas import MARGEM, medida_de_referencia, montar_atlas, redimensionar  # noqa: E402
from sprites.folhas import ALVOS, FOLHAS, PX_POR_UNIDADE, RAZAO_CENA_FINAL, UNIDADES_ALVO  # noqa: E402
from sprites.recorte import ancora_x, chave_magenta, separar_quadros  # noqa: E402
from sprites.uniforme import aplicar_azul_oficial  # noqa: E402

RAIZ = Path(__file__).resolve().parents[1]
ORIGEM = RAIZ / "imagens"
DESTINO = RAIZ / "src" / "assets"
METADADOS = RAIZ / "src" / "js" / "config" / "quadros-sprites.js"
LIMITE_BYTES = 300 * 1024
QUALIDADE = 80


def carregar_quadros(folha: dict) -> list[dict]:
    rgb = np.asarray(Image.open(ORIGEM / folha["arquivo"]).convert("RGB"))
    quadros = separar_quadros(chave_magenta(rgb), folha["colunas"], folha["linhas"])
    if folha["grupo"] != "cao":   # uniforme único na cor oficial do SEMAE (o cão não tem azul)
        quadros = [aplicar_azul_oficial(q) for q in quadros]
    return [dict(img=q, px=ancora_x(q, folha["ancora"])) for q in quadros]


def escalas_das_folhas(brutos: dict) -> tuple[dict, dict]:
    """(escala px original -> px do atlas, unidades do jogo por px do atlas) de cada folha."""
    base = {g: alvo / medida_de_referencia(brutos[ref], eixo) for g, (eixo, alvo, ref) in ALVOS.items()}
    base["final"] = base["leiturista"] * RAZAO_CENA_FINAL
    upp_base = {g: round(UNIDADES_ALVO[g] / ALVOS[g][1], 5) for g in UNIDADES_ALVO}
    upp_base["final"] = upp_base["leiturista"]
    escalas, upps = {}, {}
    for f in FOLHAS:
        if "u_px" in f:
            escalas[f["nome"]] = f["u_px"] * PX_POR_UNIDADE
            upps[f["nome"]] = round(1.0 / PX_POR_UNIDADE, 5)
        else:
            escalas[f["nome"]] = base[f["grupo"]]
            upps[f["nome"]] = upp_base[f["grupo"]]
    return escalas, upps


def escrever_metadados(folhas: dict) -> None:
    linhas = [f"    '{nome}': {json.dumps(dados, ensure_ascii=False)}," for nome, dados in folhas.items()]
    texto = "\n".join([
        "/**", " * @file quadros-sprites.js", " * @description GERADO por scripts/preparar_sprites.py. Não editar à mão.",
        " * Medidas dos atlas de sprites ilustrados (px do atlas): grade, célula, pivô (pé) e `upp`,",
        " * as unidades do jogo por pixel do atlas.", " */", "export const SPRITES = {", "  folhas: {", *linhas, "  }", "};", ""])
    METADADOS.write_bytes(texto.encode("utf-8"))


def main() -> int:
    analisador = argparse.ArgumentParser()
    analisador.add_argument("--previa", type=Path, help="pasta para salvar prévias sobre fundo cinza")
    args = analisador.parse_args()
    DESTINO.mkdir(parents=True, exist_ok=True)
    brutos = {f["nome"]: carregar_quadros(f) for f in FOLHAS}
    escalas, upps = escalas_das_folhas(brutos)
    folhas_meta = {}
    for folha in FOLHAS:
        quadros = [redimensionar(q, escalas[folha["nome"]]) for q in brutos[folha["nome"]]]
        atlas, celula, pivo = montar_atlas(quadros, folha["colunas"], folha["ancora"], folha.get("alinhamento", "base"))
        caminho = DESTINO / f"{folha['nome']}.webp"
        atlas.save(caminho, "WEBP", quality=QUALIDADE, alpha_quality=100, method=6)
        tamanho = caminho.stat().st_size
        if tamanho > LIMITE_BYTES:
            print(f"ERRO: {caminho.name} tem {tamanho} bytes (limite {LIMITE_BYTES})", file=sys.stderr)
            return 1
        folhas_meta[folha["nome"]] = dict(
            colunas=folha["colunas"], quadros=len(quadros), celula=list(celula), grupo=folha["grupo"],
            pivo=list(pivo), upp=upps[folha["nome"]])
        if folha.get("alinhamento", "base") != "base":
            folhas_meta[folha["nome"]]["alinhamento"] = folha["alinhamento"]
        print(f"{caminho.name}: {atlas.size[0]}x{atlas.size[1]}, celula {celula[0]}x{celula[1]}, {tamanho / 1024:.0f} KB")
        if args.previa:
            args.previa.mkdir(parents=True, exist_ok=True)
            fundo = Image.new("RGBA", atlas.size, (200, 205, 215, 255))
            fundo.alpha_composite(atlas)
            fundo.convert("RGB").save(args.previa / f"{folha['nome']}.png")
    escrever_metadados(folhas_meta)
    print(f"metadados: {METADADOS.relative_to(RAIZ)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
