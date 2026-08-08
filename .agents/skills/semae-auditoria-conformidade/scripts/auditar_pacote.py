#!/usr/bin/env python3
"""Valida orçamento/formatos básicos do pacote publicado SEMAE."""
import argparse, pathlib
LIMITS={'.html':2*1024*1024,'.svg':150*1024,'.webp':300*1024,'.png':300*1024,'.jpg':500*1024,'.jpeg':500*1024,'.json':256*1024}
FORBID={'.gif'}
def main():
 ap=argparse.ArgumentParser(description=__doc__); ap.add_argument('pasta'); a=ap.parse_args(); root=pathlib.Path(a.pasta)
 total=sum(p.stat().st_size for p in root.rglob('*') if p.is_file()); fail=0
 print(f'Pacote: {total/1024/1024:.2f} MB / limite 8 MB')
 if total>8*1024*1024: print('[FAIL] pacote > 8 MB'); fail+=1
 for p in root.rglob('*'):
  if not p.is_file(): continue
  ext=p.suffix.lower(); size=p.stat().st_size
  if ext in FORBID: print(f'[FAIL] formato proibido: {p}'); fail+=1
  if ext in LIMITS and size>LIMITS[ext]: print(f'[FAIL] {p}: {size/1024:.1f} KB > {LIMITS[ext]/1024:.0f} KB'); fail+=1
  if ext in {'.woff','.woff2','.ttf','.otf'}: print(f'[FAIL] webfont/arquivo de fonte: {p}'); fail+=1
 print('[PASS]' if not fail else '[FAIL]', 'auditoria básica concluída')
 return 1 if fail else 0
if __name__=='__main__': raise SystemExit(main())
