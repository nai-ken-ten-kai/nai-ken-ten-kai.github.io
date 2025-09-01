#!/usr/bin/env python3
"""Mark a space as taken.

Usage:
  python scripts/mark_taken.py <id> --by "Name" [--date ISO_DATETIME] [--note "reason/contact"]

This updates `spaces_new.json` (canonical) and writes a compatibility copy to `spaces.json`.
"""
import json
import os
import sys
from datetime import datetime

ROOT = os.path.dirname(os.path.dirname(__file__))
SP_NEW = os.path.join(ROOT, 'spaces_new.json')
SP = os.path.join(ROOT, 'spaces.json')

def load(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def write_both(data):
    with open(SP_NEW, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    with open(SP, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def usage():
    print(__doc__)

def main(argv):
    if len(argv) < 2:
        usage(); sys.exit(1)
    id_ = str(argv[1])
    # simple arg parsing
    by = None; date = None; note = None
    i = 2
    while i < len(argv):
        a = argv[i]
        if a == '--by' and i+1 < len(argv):
            by = argv[i+1]; i += 2
        elif a == '--date' and i+1 < len(argv):
            date = argv[i+1]; i += 2
        elif a == '--note' and i+1 < len(argv):
            note = argv[i+1]; i += 2
        else:
            print('Unknown or incomplete arg', a); usage(); sys.exit(1)

    if not by:
        print('Missing --by argument (who took it)'); usage(); sys.exit(1)

    if date is None:
        date = datetime.utcnow().isoformat()

    data = load(SP_NEW if os.path.exists(SP_NEW) else SP)
    found = False
    for space in data:
        if str(space.get('id')) == id_:
            space['status'] = 'taken'
            space['taken_by'] = by
            space['taken_at'] = date
            if note:
                space['taken_note'] = note
            found = True
            break

    if not found:
        print('ID not found in data:', id_); sys.exit(1)

    write_both(data)
    print('Marked id', id_, 'as taken by', by)

if __name__ == '__main__':
    main(sys.argv)
