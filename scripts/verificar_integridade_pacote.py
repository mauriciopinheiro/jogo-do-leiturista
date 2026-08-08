#!/usr/bin/env python3
from __future__ import annotations
import hashlib
import json
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
INVENTARIO = RAIZ / "INVENTARIO-INTEGRIDADE.json"

def sha256(caminho: Path) -> str:
    resumo = hashlib.sha256()
    with caminho.open("rb") as arquivo:
        for bloco in iter(lambda: arquivo.read(1024 * 1024), b""):
            resumo.update(bloco)
    return resumo.hexdigest()

def main() -> int:
    dados = json.loads(INVENTARIO.read_text(encoding="utf-8"))
    falhas = []
    for item in dados["arquivos_verificados"]:
        caminho = RAIZ / item["caminho"]
        if not caminho.exists():
            falhas.append(f"AUSENTE: {item['caminho']}")
            continue
        atual = sha256(caminho)
        if atual != item["sha256"]:
            falhas.append(f"HASH: {item['caminho']} esperado={item['sha256']} atual={atual}")
    if falhas:
        print("Integridade do pacote: FAIL")
        for falha in falhas:
            print(f"- {falha}")
        return 1
    print(f"Integridade do pacote: PASS ({len(dados['arquivos_verificados'])} arquivos verificados)")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
