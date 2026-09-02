#!/usr/bin/env python3
# Assemble Still Form copy inventory md from copy-audit/*.json
import json, os, sys

WORK = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(os.path.dirname(WORK), 'COPY_INVENTORY.md')

ORDER = [
    'home-base', 'lang-1', 'lang-2', 'lang-2b', 'lang-3',
    'shop', 'auth', 'mypage', 'policy', 'components-shop', 'components-brand',
]

def load(area, suffix=''):
    p = os.path.join(WORK, f'{area}{suffix}.json')
    if not os.path.exists(p):
        return None
    return json.load(open(p))

def esc(s):
    return str(s or '').replace('|', '\\|').replace('\n', ' ⏎ ')

def flatten(obj):
    """Recursively flatten nested {'area','notes','entries'} wrappers."""
    if obj is None:
        return None
    out_entries = []
    notes = []
    def walk(o):
        if isinstance(o, dict) and 'entries' in o:
            if o.get('notes'):
                notes.append(str(o['notes']))
            for e in o['entries']:
                walk(e)
        elif isinstance(o, list):
            for e in o:
                walk(e)
        else:
            out_entries.append(o)
    walk(obj)
    flat = dict(obj) if isinstance(obj, dict) else {}
    flat['entries'] = out_entries
    flat['notes'] = ' / '.join(notes) if notes else flat.get('notes', '')
    return flat

areas = []
for a in ORDER:
    v = load(a, '.verified') or load(a)
    if v is None:
        print(f'MISSING: {a}', file=sys.stderr)
        continue
    v = flatten(v)
    v['area'] = a
    areas.append(v)

total = sum(len(a.get('entries', [])) for a in areas)
flagged = [(a, e) for a in areas for e in a.get('entries', []) if e.get('flag')]

lines = []
lines.append('# Still Form 템플릿 카피 전수 조사 (COPY INVENTORY)')
lines.append('')
lines.append('> 대상: `templates/_bundled/superbify-commerce_minimal` (Still Form)')
lines.append('> 조사 범위: lang/ko·en.json 전체, layouts/** 전체, src/components 하드코딩, fixtures/데모 콘텐츠, template.json, config/business-info.json')
lines.append(f'> 수집 항목 총 {total}건, 어색 카피 flag {len(flagged)}건')
lines.append('')
lines.append('## 어색 카피 flag 요약')
lines.append('')
lines.append('| # | 영역 | 위치 | 카피 (ko) | 문제 |')
lines.append('|---|------|------|-----------|------|')
for i, (a, e) in enumerate(flagged, 1):
    loc = esc(e.get('location', ''))
    loc = loc.replace('templates/_bundled/superbify-commerce_minimal/', '')
    lines.append(f"| {i} | {a['area']} | {loc} | {esc(e.get('text_ko'))} | {esc(e.get('flag'))} |")
lines.append('')
lines.append('## 페이지별 카피 인벤토리')
lines.append('')
for a in areas:
    entries = a.get('entries', [])
    lines.append(f"### {a['area']} ({len(entries)}항목)")
    if a.get('notes'):
        lines.append('')
        lines.append(esc(a['notes']))
    lines.append('')
    lines.append('| 페이지 | 키/위치 | 종류 | ko | en | flag |')
    lines.append('|--------|---------|------|----|----|------|')
    # group rows by page for readability, keep insertion order of pages
    seen = []
    for e in entries:
        p = e.get('page') or '—'
        if p not in seen:
            seen.append(p)
    for p in seen:
        for e in entries:
            if (e.get('page') or '—') != p:
                continue
            key = esc(e.get('key') or e.get('location', ''))
            lines.append(f"| {esc(p)} | {key} | {esc(e.get('kind'))} | {esc(e.get('text_ko'))} | {esc(e.get('text_en'))} | {esc(e.get('flag'))} |")
    lines.append('')

open(OUT, 'w').write('\n'.join(lines))
print(f'wrote {OUT}: {total} entries, {len(flagged)} flagged, areas={len(areas)}')