#!/usr/bin/env python3
from __future__ import annotations
import argparse, fnmatch, subprocess, sys
from pathlib import Path
from typing import Dict, Iterable, List, Set, Tuple
import yaml

ROOT = Path(__file__).resolve().parents[1]

class ValidationError(Exception): pass

def load_yaml(path: Path):
    if not path.exists(): raise ValidationError(f"Missing required file: {path.relative_to(ROOT)}")
    with path.open('r', encoding='utf-8') as f: return yaml.safe_load(f) or {}

def matches_any(path: str, patterns: Iterable[str]) -> bool:
    return any(fnmatch.fnmatch(path, p) for p in patterns)

def is_protected(path: str, config: dict) -> bool:
    return matches_any(path, config.get('protected_paths', [])) and not matches_any(path, config.get('ignored_paths', []))

def run_git(args: List[str]) -> str:
    p = subprocess.run(['git', *args], cwd=ROOT, text=True, capture_output=True)
    if p.returncode != 0: raise ValidationError(f"git {' '.join(args)} failed:\n{p.stderr.strip()}")
    return p.stdout

def changed_added_lines(base: str | None) -> Dict[str, Set[int]]:
    if not base: return {}
    diff = run_git(['diff', '--unified=0', f'{base}...HEAD', '--'])
    result: Dict[str, Set[int]] = {}
    current = None
    for line in diff.splitlines():
        if line.startswith('+++ b/'):
            current = line[6:]; result.setdefault(current, set()); continue
        if line.startswith('@@') and current:
            try:
                new = line.split(' ')[2].lstrip('+')
                if ',' in new: s, c = map(int, new.split(',', 1))
                else: s, c = int(new), 1
                if c > 0: result[current].update(range(s, s+c))
            except Exception as e: raise ValidationError(f'Unable to parse diff hunk: {line}') from e
    return result

def validate_shape(data: dict) -> List[dict]:
    if data.get('version') != 1: raise ValidationError('traceability.yml must contain `version: 1`.')
    cslist = data.get('change_sets')
    if not isinstance(cslist, list): raise ValidationError('`change_sets` must be a list.')
    seen = set()
    for i, cs in enumerate(cslist, 1):
        if not isinstance(cs, dict): raise ValidationError(f'Change Set #{i} must be a mapping.')
        cid = cs.get('id')
        if not cid: raise ValidationError(f'Change Set #{i} is missing `id`.')
        if cid in seen: raise ValidationError(f'Duplicate Change Set ID: {cid}')
        seen.add(cid)
        if not cs.get('spec'): raise ValidationError(f'{cid}: missing `spec`.')
        for field in ('requirements','acceptance_criteria','tasks','files','evidence'):
            if not isinstance(cs.get(field), list) or not cs[field]: raise ValidationError(f'{cid}: `{field}` must be a non-empty list.')
        for fe in cs['files']:
            if not isinstance(fe, dict) or not fe.get('path'): raise ValidationError(f'{cid}: each file entry must have `path`.')
            rs = fe.get('ranges')
            if not isinstance(rs, list) or not rs: raise ValidationError(f"{cid}: {fe.get('path')} requires `ranges`.")
            for r in rs:
                if not isinstance(r, dict) or 'start' not in r or 'end' not in r: raise ValidationError(f'{cid}: every range requires start/end.')
                s, e = r['start'], r['end']
                if not isinstance(s,int) or not isinstance(e,int) or s < 1 or e < s: raise ValidationError(f'{cid}: invalid line range {s}-{e}.')
    return cslist

def coverage_map(cslist: List[dict]) -> Dict[str, Set[int]]:
    cov: Dict[str, Set[int]] = {}
    for cs in cslist:
        for fe in cs['files']:
            dest = cov.setdefault(fe['path'], set())
            for r in fe['ranges']: dest.update(range(r['start'], r['end']+1))
    return cov

def validate_coverage(changes, cov, config):
    missing: List[Tuple[str,int]] = []
    for path, lines in sorted(changes.items()):
        if not is_protected(path, config): continue
        covered = cov.get(path, set())
        missing.extend((path, n) for n in sorted(lines) if n not in covered)
    if missing:
        preview = '\n'.join(f'  - {p}:{n}' for p,n in missing[:100])
        extra = f"\n  ... and {len(missing)-100} more" if len(missing) > 100 else ''
        raise ValidationError('SDD traceability coverage failure.\nUncovered protected changed lines:\n' + preview + extra)

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--base'); args = ap.parse_args()
    try:
        config = load_yaml(ROOT/'.sdd/config.yml')
        data = load_yaml(ROOT/config.get('traceability_file','.sdd/traceability.yml'))
        cslist = validate_shape(data); cov = coverage_map(cslist)
        if args.base: validate_coverage(changed_added_lines(args.base), cov, config)
        print('SDD validation: PASS')
        if not args.base: print('Note: no --base supplied; structural checks only.')
        return 0
    except ValidationError as e:
        print(f'SDD validation: FAIL\n{e}', file=sys.stderr); return 1

if __name__ == '__main__': raise SystemExit(main())
