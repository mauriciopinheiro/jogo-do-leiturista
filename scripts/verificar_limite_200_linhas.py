#!/usr/bin/env python3
"""Verifica o limite de 200 linhas físicas nos fontes manuais mantidos pelo projeto.

Examina src/, scripts/ e tests/ (JS, CSS, HTML, Python). O index.html da raiz é gerado por
scripts/construir.mjs e os arquivos históricos da raiz (v3.0 e test_final*.html) ficam de fora por
serem cópias preservadas. A versão anterior deste script ignorava .html, por isso nunca acusou o
monolito de 2.949 linhas da v3.4.0.
"""
from __future__ import annotations

from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
PASTAS = ("src", "scripts", "tests")
EXTENSOES = {".js", ".mjs", ".cjs", ".css", ".html", ".py"}
IGNORAR_PARTES = {"node_modules", "saida", "__pycache__"}
LIMITE = 200
ATENCAO = 160


def contar_linhas(caminho: Path) -> int:
    dados = caminho.read_bytes()
    if not dados:
        return 0
    return dados.count(b"\n") + (0 if dados.endswith(b"\n") else 1)


def arquivos_mantidos():
    for pasta in PASTAS:
        base = RAIZ / pasta
        if not base.exists():
            continue
        for caminho in sorted(base.rglob("*")):
            if not caminho.is_file() or caminho.suffix.lower() not in EXTENSOES:
                continue
            if any(parte in IGNORAR_PARTES for parte in caminho.relative_to(RAIZ).parts):
                continue
            yield caminho


def main() -> int:
    violacoes = []
    atencao = []
    total = 0
    for caminho in arquivos_mantidos():
        total += 1
        linhas = contar_linhas(caminho)
        relativo = caminho.relative_to(RAIZ).as_posix()
        if linhas > LIMITE:
            violacoes.append((relativo, linhas))
        elif linhas >= ATENCAO:
            atencao.append((relativo, linhas))
    for relativo, linhas in atencao:
        print(f"ATENCAO {linhas:>4} linhas: {relativo}")
    if violacoes:
        for relativo, linhas in violacoes:
            print(f"VIOLACAO {linhas:>4} linhas: {relativo}")
        print(f"Falha: {len(violacoes)} arquivo(s) manual(is) acima de {LIMITE} linhas.")
        return 1
    print(f"Limite de {LIMITE} linhas: PASS ({total} arquivos verificados)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
