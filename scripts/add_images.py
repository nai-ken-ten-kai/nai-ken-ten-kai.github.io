#!/usr/bin/env python3
"""Add images or a new series to spaces_new.json.

Usage examples:
  python scripts/add_images.py --dir img/newset --author "Y. Sato" --title-id 0 --status draft
  python scripts/add_images.py --dir img/newset --author "Y. Sato" --new --status published

If --new is supplied, a new space object is created with a generated id (max+1).
Otherwise, --title-id specifies the existing space id to which images are appended (images array).

The script will look for image files in the specified dir (relative to repo root), extract simple EXIF DateTimeOriginal if available, and create image objects {src, taken_at}.
Updates `spaces_new.json` and writes a compatibility copy to `spaces.json`.
"""
import argparse
import json
import os
from datetime import datetime
from glob import glob
try:
    from PIL import Image
    from PIL.ExifTags import TAGS
except Exception:
    Image = None

ROOT = os.path.dirname(os.path.dirname(__file__))
SP_NEW = os.path.join(ROOT, 'spaces_new.json')
SP = os.path.join(ROOT, 'spaces.json')

def read_json():
    path = SP_NEW if os.path.exists(SP_NEW) else SP
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def write_both(data):
    with open(SP_NEW, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    with open(SP, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def exif_taken(path):
    if Image is None:
        return None
    try:
        img = Image.open(path)
        info = img._getexif() or {}
        for k, v in info.items():
            name = TAGS.get(k, k)
            if name == 'DateTimeOriginal':
                # format 'YYYY:MM:DD HH:MM:SS'
                return v.replace(':', '-', 2)
    except Exception:
        return None

def make_image_obj(root_dir, filepath):
    rel = os.path.relpath(filepath, ROOT)
    taken = exif_taken(filepath)
    return {'src': rel.replace('\\', '/'), 'taken_at': taken}

def find_images(directory):
    p = os.path.join(ROOT, directory)
    if not os.path.isdir(p):
        raise SystemExit('Directory not found: ' + directory)
    exts = ('*.jpg', '*.jpeg', '*.png', '*.webp', '*.tif', '*.tiff')
    files = []
    for e in exts:
        files.extend(sorted(glob(os.path.join(p, e))))
    return files

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--dir', required=True, help='Directory under repo containing images')
    ap.add_argument('--author', required=True)
    ap.add_argument('--new', action='store_true', help='Create a new space')
    ap.add_argument('--title-id', type=int, help='Existing space id to append images to')
    ap.add_argument('--status', default='draft')
    ap.add_argument('--no-append-to-images', action='store_true', help='Do not append images to the top-level images array; only create an updates entry')
    args = ap.parse_args()

    images = find_images(args.dir)
    if not images:
        raise SystemExit('No images found in ' + args.dir)

    objs = [make_image_obj(args.dir, p) for p in images]

    # try to read per-folder meta.json for richer update metadata
    meta_path = os.path.join(ROOT, args.dir, 'meta.json')
    meta = {}
    if os.path.exists(meta_path):
        try:
            with open(meta_path, 'r', encoding='utf-8') as mf:
                meta = json.load(mf)
        except Exception as e:
            print('Warning: failed to parse meta.json:', e)

    data = read_json()
    if args.new:
        maxid = max((int(s.get('id', 0)) for s in data), default=0)
        newid = maxid + 1
        # create a new space and also register this folder as an initial update
        space = {
            'id': newid,
            'images': objs if not args.no_append_to_images else [],
            'created_by': meta.get('author', args.author),
            'created_at': datetime.utcnow().isoformat(),
            'status': meta.get('status', args.status),
            'updates': []
        }
        # build update object from meta + images
        upd = {
            'author': meta.get('author', args.author),
            'text': meta.get('text'),
            'action': meta.get('action'),
            'images': [],
            'created_at': datetime.utcnow().isoformat(),
            'status': meta.get('status', args.status),
            'related': meta.get('related', [])
        }
        # attach image objects with optional roles/captions
        name_map = {os.path.basename(i['src']): i for i in objs}
        primary = meta.get('primary')
        supp = meta.get('supplementary', [])
        ordered = []
        if primary and primary in name_map:
            o = dict(name_map.pop(primary))
            o['role'] = 'primary'
            ordered.append(o)
        for sname in supp:
            if sname in name_map:
                o = dict(name_map.pop(sname))
                o['role'] = 'supplementary'
                ordered.append(o)
        # remaining images
        for o in name_map.values():
            oo = dict(o)
            oo.setdefault('role', 'supplementary')
            ordered.append(oo)
        upd['images'] = ordered
        space['updates'].append(upd)
        data.append(space)
        print('Created new space id', newid)
    else:
        if args.title_id is None:
            raise SystemExit('--title-id is required when not using --new')
        found = False
        for s in data:
            if int(s.get('id', -1)) == args.title_id:
                # prepare update object
                upd = {
                    'author': meta.get('author', args.author),
                    'text': meta.get('text'),
                    'action': meta.get('action'),
                    'images': [],
                    'created_at': datetime.utcnow().isoformat(),
                    'status': meta.get('status', args.status),
                    'related': meta.get('related', [])
                }
                # map by basename
                name_map = {os.path.basename(i['src']): i for i in objs}
                primary = meta.get('primary')
                supp = meta.get('supplementary', [])
                ordered = []
                if primary and primary in name_map:
                    o = dict(name_map.pop(primary))
                    o['role'] = 'primary'
                    ordered.append(o)
                for sname in supp:
                    if sname in name_map:
                        o = dict(name_map.pop(sname))
                        o['role'] = 'supplementary'
                        ordered.append(o)
                for o in name_map.values():
                    oo = dict(o)
                    oo.setdefault('role', 'supplementary')
                    ordered.append(oo)
                upd['images'] = ordered

                # append to space updates
                s_updates = s.get('updates') or []
                s_updates.append(upd)
                s['updates'] = s_updates

                # optionally append to top-level images array for compatibility
                if not args.no_append_to_images:
                    s_images = s.get('images') or []
                    s_images.extend(objs)
                    s['images'] = s_images

                s.setdefault('modified_by', meta.get('author', args.author))
                s['modified_at'] = datetime.utcnow().isoformat()
                s['status'] = meta.get('status', args.status)
                found = True
                break
        if not found:
            raise SystemExit('title-id not found: ' + str(args.title_id))

    write_both(data)
    print('Wrote updates to', SP_NEW)

if __name__ == '__main__':
    main()
