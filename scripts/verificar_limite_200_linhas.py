#!/usr/bin/env python3
from __future__ import annotations
import os
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
EXTENSOES = {
    ".py", ".js", ".mjs", ".cjs", ".ts", ".tsx", ".jsx", ".java", ".kt",
    ".kts", ".go", ".rs", ".cs", ".c", ".h", ".cpp", ".hpp", ".php",
    ".rb", ".swift", ".scala", ".sh", ".ps1", ".vue", ".svelte",
}
IGNORAR_PARTES = {
    ".git", "node_modules", "dist", "build", "vendor", "generated", "__pycache__",
    "_fontes_originais", "_fontes_expandidas",
}

def ignorar(caminho: Path) -> bool:
    return any(parte in IGNORAR_PARTES for parte in caminho.parts)

def contar_linhas(caminho: Path) -> int:
    with caminho.open("rb") as arquivo:
        dados = arquivo.read()
    if not dados:
        return 0
    return dados.count(b"\n") + (0 if dados.endswith(b"\n") else 1)

def main() -> int:
    violacoes = []
    atencao = []
    for caminho in RAIZ.rglob("*"):
        if not caminho.is_file() or ignorar(caminho.relative_to(RAIZ)):
            continue
        if caminho.suffix.lower() not in EXTENSOES:
            continue
        linhas = contar_linhas(caminho)
        relativo = caminho.relative_to(RAIZ).as_posix()
        if linhas > 200:
            violacoes.append((relativo, linhas))
        elif linhas >= 160:
            atencao.append((relativo, linhas))
    for relativo, linhas in atencao:
        print(f"ATENCAO {linhas:>4} linhas: {relativo}")
    if violacoes:
        for relativo, linhas in violacoes:
            print(f"VIOLACAO {linhas:>4} linhas: {relativo}")
        print(f"Falha: {len(violacoes)} arquivo(s) manual(is) acima de 200 linhas.")
        return 1
    print("Limite de 200 linhas: PASS")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
