#!/usr/bin/env python3
"""
sync_spaces_new_to_spaces.py

Copy/merge entries from spaces_new.json into spaces.json by id.
Creates a timestamped backup of spaces.json before writing.

Usage:
  python3 sync_spaces_new_to_spaces.py [id1 id2 ...]

If no ids are supplied, entries for all ids present in spaces_new.json are synced.
"""
import json
import os
import sys
import time
import shutil

ROOT = os.path.dirname(__file__)
SPACES = os.path.join(ROOT, '..', 'spaces.json')
SPACES_NEW = os.path.join(ROOT, '..', 'spaces_new.json')

def load(path):
    if not os.path.exists(path):
        return []
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def main():
    if not os.path.exists(SPACES_NEW):
        print('ERROR: spaces_new.json not found at', SPACES_NEW)
        sys.exit(1)

    spaces = load(SPACES)
    spaces_new = load(SPACES_NEW)

    spaces_map = {str(s['id']): s for s in spaces}
    spaces_new_map = {str(s['id']): s for s in spaces_new}

    # choose ids to sync
    if len(sys.argv) > 1:
        ids_to_sync = [str(a) for a in sys.argv[1:]]
    else:
        ids_to_sync = list(spaces_new_map.keys())

    if os.path.exists(SPACES):
        bak = SPACES + '.bak.' + time.strftime('%Y%m%d%H%M%S')
        shutil.copy2(SPACES, bak)
        print('Backup created:', bak)

    for id_ in ids_to_sync:
        if id_ in spaces_new_map:
            spaces_map[id_] = spaces_new_map[id_]
            print('Synced id', id_)
        else:
            print('WARN: id', id_, 'not found in spaces_new.json')

    # write back (sorted numeric ids first)
    def sort_key(k):
        return int(k) if k.isdigit() else k

    out_list = [spaces_map[k] for k in sorted(spaces_map.keys(), key=sort_key)]
    with open(SPACES, 'w', encoding='utf-8') as f:
        json.dump(out_list, f, ensure_ascii=False, indent=2)

    print('Wrote', len(out_list), 'spaces to', SPACES)

if __name__ == '__main__':
    main()
