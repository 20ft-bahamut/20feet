#!/usr/bin/env python3
"""Apply copy remediation edits to lang/{ko,en}.json with before/after logging.

Usage: python3 apply.py batch1.json
batch file: JSON array of {id, key (dot path under superbify), ko, en, action, problem}
  - ko/en null = delete key (dead key) or leave unchanged (only one locale touched)
  - if key missing and ko/en set = add new key
Logs every change to copy-before-after-data.jsonl in this dir.
"""
import json, sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
TPL = '/home/bahamut/20feet/templates/_bundled/superbify-commerce_minimal'
LOG = os.path.join(HERE, 'copy-before-after-data.jsonl')

def load():
    return (json.load(open(f'{TPL}/lang/ko.json')), json.load(open(f'{TPL}/lang/en.json')))

def save(ko, en):
    for f, d in (('ko', ko), ('en', en)):
        with open(f'{TPL}/lang/{f}.json', 'w') as fh:
            fh.write(json.dumps(d, indent=4, ensure_ascii=False) + '\n')

def get(d, path):
    cur = d['superbify']
    for p in path.split('.'):
        if not isinstance(cur, dict) or p not in cur:
            return None, None
        cur = cur[p]
    return cur, True

def setv(d, path, val):
    cur = d['superbify']
    parts = path.split('.')
    for p in parts[:-1]:
        cur = cur.setdefault(p, {})
    if val is None:
        cur.pop(parts[-1], None)
    else:
        cur[parts[-1]] = val

def main():
    batch = json.load(open(sys.argv[1]))
    ko, en = load()
    log = []
    for item in batch:
        path = item['key']
        old_ko, _ = get(ko, path)
        old_en, _ = get(en, path)
        new_ko, new_en = item.get('ko', '__KEEP__'), item.get('en', '__KEEP__')
        entry = {'id': item['id'], 'key': path, 'page': item.get('page', ''),
                 'source': item.get('source', 'lang/ko.json + lang/en.json'),
                 'problem': item.get('problem', ''), 'action': item.get('action', 'REWRITE')}
        if new_ko != '__KEEP__':
            entry['before_ko'] = old_ko; entry['after_ko'] = new_ko
            setv(ko, path, new_ko)
        else:
            entry['before_ko'] = old_ko; entry['after_ko'] = old_ko
        if new_en != '__KEEP__':
            entry['before_en'] = old_en; entry['after_en'] = new_en
            setv(en, path, new_en)
        else:
            entry['before_en'] = old_en; entry['after_en'] = old_en
        log.append(entry)
    save(ko, en)
    with open(LOG, 'a') as fh:
        for e in log:
            fh.write(json.dumps(e, ensure_ascii=False) + '\n')
    print(f'applied {len(log)} changes')
    for e in log:
        print(f"  {e['id']:10s} {e['key']}")
        if e['before_ko'] != e['after_ko']:
            print(f'    ko: {e["before_ko"]!r} -> {e["after_ko"]!r}')
        if e['before_en'] != e['after_en']:
            print(f'    en: {e["before_en"]!r} -> {e["after_en"]!r}')

if __name__ == '__main__':
    main()