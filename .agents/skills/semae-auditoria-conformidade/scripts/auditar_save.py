#!/usr/bin/env python3
"""Valida envelope básico de save SEMAE (sem validar assinatura específica do jogo)."""
import argparse,json,pathlib,datetime
REQ={'app':str,'versaoJogo':str,'versaoEsquema':int,'criadoEm':str,'estado':dict,'assinatura':str}
OPT={'apelido':str,'turma':str,'escola':str}
def main():
 ap=argparse.ArgumentParser(description=__doc__); ap.add_argument('save'); ap.add_argument('app'); ap.add_argument('versao_esquema',type=int); a=ap.parse_args(); p=pathlib.Path(a.save)
 fail=0
 if p.stat().st_size>256*1024: print('[FAIL] >256 KB'); fail+=1
 try: d=json.loads(p.read_text('utf-8'))
 except Exception as e: print('[FAIL] JSON inválido:',e); return 1
 for k,t in REQ.items():
  if k not in d or not isinstance(d[k],t): print(f'[FAIL] {k} ausente/tipo inválido'); fail+=1
 for k,t in OPT.items():
  if k in d and d[k] is not None and not isinstance(d[k],t): print(f'[FAIL] {k} tipo inválido'); fail+=1
 if d.get('app')!=a.app: print('[FAIL] app divergente'); fail+=1
 if d.get('versaoEsquema')!=a.versao_esquema: print('[REVIEW] versaoEsquema divergente: requer migração/recusa explícita')
 if not fail: print('[PASS] envelope básico válido; ainda falta conferir assinatura e schema de estado do jogo')
 return 1 if fail else 0
if __name__=='__main__': raise SystemExit(main())
