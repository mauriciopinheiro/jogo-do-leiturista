#!/usr/bin/env python3
"""Auditoria estática heurística de HTML SEMAE. Não substitui homologação."""
import argparse, pathlib, re, sys

def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('html')
    a=ap.parse_args(); p=pathlib.Path(a.html); data=p.read_text('utf-8', errors='replace'); b=p.stat().st_size
    checks=[]
    def c(nome, ok, detalhe=''): checks.append((ok,nome,detalhe))
    c('HTML <= 2 MB', b <= 2*1024*1024, f'{b/1024:.1f} KB')
    c('Sem eval()', not re.search(r'\beval\s*\(',data))
    c('Sem new Function', not re.search(r'\bnew\s+Function\s*\(',data))
    ext_script=re.findall(r'<script[^>]+src=["\'](https?://|//)',data,re.I)
    ext_css=re.findall(r'<link[^>]+href=["\'](https?://|//)',data,re.I)
    c('Sem script externo/CDN', not ext_script)
    c('Sem stylesheet/webfont externo', not ext_css)
    c('Usa requestAnimationFrame', 'requestAnimationFrame' in data)
    c('Possui prefers-reduced-motion', 'prefers-reduced-motion' in data)
    c('Possui min-width: 0', bool(re.search(r'min-width\s*:\s*0',data,re.I)))
    c('Possui Web Audio', bool(re.search(r'AudioContext|webkitAudioContext',data)))
    c('Possui localStorage', 'localStorage' in data)
    c('Não usa GIF', not re.search(r'\.gif(?:["\'?\s<])',data,re.I))
    c('Sem geolocation API', 'geolocation' not in data.lower(), 'A norma nega geolocalização; ocorrência exige revisão.')
    c('Sem getUserMedia', 'getusermedia' not in data.lower(), 'Câmera/microfone não devem ser usados.')
    # network calls are review, not fail because rankings online are specified
    net=bool(re.search(r'\bfetch\s*\(|XMLHttpRequest|WebSocket',data))
    checks.append((None,'Chamadas de rede detectadas' if net else 'Nenhuma chamada de rede detectada','Se houver rede, validar que é só ranking/sync, assíncrona e não bloqueante.'))
    fail=0
    for ok,n,d in checks:
        tag='PASS' if ok is True else ('FAIL' if ok is False else 'REVIEW')
        if ok is False: fail+=1
        print(f'[{tag}] {n}' + (f' — {d}' if d else ''))
    return 1 if fail else 0
if __name__=='__main__': raise SystemExit(main())
