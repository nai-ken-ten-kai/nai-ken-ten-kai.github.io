#!/usr/bin/env python3
"""Local admin web UI for adding updates to spaces_new.json.

Run:
  python3 scripts/admin.py

Open http://127.0.0.1:5000 in your browser. The app is local-only and will write to
`spaces_new.json` (and a compatibility `spaces.json`). It creates a timestamped backup
before overwriting. By default it does NOT git commit; pass --commit to enable commit.
"""
from flask import Flask, render_template, request, jsonify, send_from_directory
import os, json, shutil, argparse
from datetime import datetime
from werkzeug.utils import secure_filename
try:
    from PIL import Image
    from PIL.ExifTags import TAGS
except Exception:
    Image = None

ROOT = os.path.dirname(os.path.dirname(__file__))
IMG_DIR = os.path.join(ROOT, 'img')
SP_NEW = os.path.join(ROOT, 'spaces_new.json')
SP = os.path.join(ROOT, 'spaces.json')

app = Flask(__name__, template_folder=os.path.join(os.path.dirname(__file__), 'templates'), static_folder=os.path.join(os.path.dirname(__file__), 'static'))

def read_spaces():
    path = SP_NEW if os.path.exists(SP_NEW) else SP
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def backup_spaces():
    if os.path.exists(SP_NEW):
        bak = SP_NEW + '.bak.' + datetime.utcnow().strftime('%Y%m%d%H%M%S')
        shutil.copy2(SP_NEW, bak)

def write_both(data):
    backup_spaces()
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
                return v.replace(':', '-', 2)
    except Exception:
        return None

@app.route('/')
def index():
    spaces = read_spaces()
    return render_template('admin.html', spaces=spaces)

@app.route('/static/<path:p>')
def static_file(p):
    return send_from_directory(os.path.join(os.path.dirname(__file__), 'static'), p)

@app.route('/save', methods=['POST'])
def save():
    # form fields
    title_id = request.form.get('title_id') or ''
    author = request.form.get('author') or 'Unknown'
    text = request.form.get('text') or None
    status = request.form.get('status') or 'draft'
    related = request.form.get('related') or ''
    related_ids = [int(x) for x in related.split(',') if x.strip().isdigit()]
    create_new = request.form.get('create_new') == '1'
    no_append = request.form.get('no_append') == '1'

    files = request.files.getlist('files')
    if not files:
        return jsonify({'ok': False, 'error': 'No files uploaded'})

    # determine folder name
    slug = secure_filename(request.form.get('slug') or ('upload-' + datetime.utcnow().strftime('%Y%m%d%H%M%S')))
    spaces = read_spaces()

    if create_new or not title_id:
        maxid = max((int(s.get('id', 0)) for s in spaces), default=0)
        new_id = maxid + 1
        folder = f"{new_id}-{slug}"
        space = {'id': new_id, 'images': [], 'created_by': author, 'created_at': datetime.utcnow().isoformat(), 'status': status, 'updates': []}
        spaces.append(space)
        title_id = str(new_id)
    else:
        folder = f"{title_id}-{slug}"

    target_dir = os.path.join(IMG_DIR, folder)
    os.makedirs(target_dir, exist_ok=True)

    saved = []
    for f in files:
        filename = secure_filename(f.filename)
        path = os.path.join(target_dir, filename)
        f.save(path)
        rel = os.path.relpath(path, ROOT).replace('\\', '/')
        saved.append({'src': rel, 'taken_at': exif_taken(path)})

    # build update object; client should indicate primary filename
    primary = request.form.get('primary')
    ordered = []
    name_map = {os.path.basename(s['src']): s for s in saved}
    if primary and primary in name_map:
        o = dict(name_map.pop(primary)); o['role'] = 'primary'; ordered.append(o)
    for k, v in name_map.items():
        vv = dict(v); vv.setdefault('role', 'supplementary'); ordered.append(vv)

    upd = {'author': author, 'text': text, 'action': request.form.get('action'), 'images': ordered, 'created_at': datetime.utcnow().isoformat(), 'status': status, 'related': related_ids}

    # attach to space
    target = None
    for s in spaces:
        if str(s.get('id')) == str(title_id):
            target = s
            break
    if not target:
        return jsonify({'ok': False, 'error': 'target id not found after creation: ' + str(title_id)})

    # apply changes or dry-run preview
    dry_run = request.form.get('dry_run') == 'on' or request.form.get('dry_run') == '1'

    # produce preview object
    preview_spaces = json.loads(json.dumps(spaces))
    target_preview = None
    for s in preview_spaces:
        if str(s.get('id')) == str(title_id):
            target_preview = s
            break

    if dry_run:
        # attach but do not write
        if target_preview is not None:
            target_preview.setdefault('updates', []).append(upd)
            if not no_append:
                target_preview.setdefault('images', []).extend(saved)
        return jsonify({'ok': True, 'preview': target_preview, 'dry_run': True})

    target.setdefault('updates', []).append(upd)
    if not no_append:
        target.setdefault('images', []).extend(saved)
    target['modified_by'] = author
    target['modified_at'] = datetime.utcnow().isoformat()
    target['status'] = status

    write_both(spaces)

    # optional git commit
    do_commit = request.form.get('commit') == '1'
    commit_msg = request.form.get('commit_msg') or f"Add update to {title_id} by {author}"
    commit_result = None
    if do_commit:
        try:
            import subprocess
            subprocess.check_call(['git', 'add', SP_NEW, SP])
            subprocess.check_call(['git', 'commit', '-m', commit_msg])
            commit_result = 'committed'
        except Exception as e:
            commit_result = f'git failed: {e}'

    return jsonify({'ok': True, 'id': title_id, 'folder': folder, 'commit': commit_result})


@app.route('/mark', methods=['POST'])
def mark():
    space_id = request.form.get('mark_id')
    taken_by = request.form.get('taken_by') or 'Unknown'
    note = request.form.get('taken_note') or None
    publish = request.form.get('mark_publish') == 'on' or request.form.get('mark_publish') == '1'
    f = request.files.get('taken_file')

    if not space_id:
        return jsonify({'ok': False, 'error': 'mark_id required'})

    spaces = read_spaces()
    target = None
    for s in spaces:
        if str(s.get('id')) == str(space_id):
            target = s
            break
    if not target:
        return jsonify({'ok': False, 'error': 'space id not found'})

    # optional replace main image
    if f:
        # save uploaded file and treat it as a new main image (prepend)
        folder = f"{space_id}-manual-update"
        target_dir = os.path.join(IMG_DIR, folder)
        os.makedirs(target_dir, exist_ok=True)
        filename = secure_filename(f.filename)
        path = os.path.join(target_dir, filename)
        f.save(path)
        rel = os.path.relpath(path, ROOT).replace('\\', '/')
        main_img = {'src': rel, 'taken_at': exif_taken(path)}
        imgs = target.get('images') or []
        # prepend new main image so original(s) remain after
        imgs.insert(0, main_img)
        target['images'] = imgs
        # also record this as an update for timeline/modal
        upd = {
            'author': taken_by,
            'text': note,
            'action': 'taken',
            'images': [dict(main_img, **{'role': 'primary'})],
            'created_at': datetime.utcnow().isoformat(),
            'status': 'taken',
            'related': []
        }
        target.setdefault('updates', []).append(upd)

    # mark as taken
    # Mark as taken (always) and record who/when
    target['status'] = 'taken'
    target['taken_by'] = taken_by
    target['taken_at'] = datetime.utcnow().isoformat()
    if note:
        target['taken_note'] = note

    # Optionally publish: set to 'published' only when the publish flag is set
    # and a new main image was provided. This keeps 'taken' as the base state
    # and uses 'published' to indicate a new main image / public update.
    if publish and f:
        target['status'] = 'published'

    write_both(spaces)
    return jsonify({'ok': True, 'id': space_id, 'published': publish})


@app.route('/revert', methods=['POST'])
def revert():
    space_id = request.form.get('revert_id')
    if not space_id:
        return jsonify({'ok': False, 'error': 'revert_id required'})
    spaces = read_spaces()
    target = None
    for s in spaces:
        if str(s.get('id')) == str(space_id):
            target = s
            break
    if not target:
        return jsonify({'ok': False, 'error': 'space id not found'})

    # check if there are updates to revert
    updates = target.get('updates') or []
    if not updates:
        return jsonify({'ok': False, 'error': 'no updates to revert'})

    # pop last update
    last_upd = updates.pop()
    target['updates'] = updates

    # remove last prepended image if it matches the update's primary
    imgs = target.get('images') or []
    if imgs and last_upd.get('images'):
        primary_src = None
        for im in last_upd['images']:
            if im.get('role') == 'primary':
                primary_src = im.get('src')
                break
        if primary_src and imgs[0].get('src') == primary_src:
            imgs.pop(0)
            target['images'] = imgs

    # optionally delete image file (if it exists and is in img/<id>-manual-update/)
    if primary_src and primary_src.startswith('img/'):
        try:
            os.remove(os.path.join(ROOT, primary_src))
        except OSError:
            pass  # ignore if file not found

    # reset status if no more updates
    if not updates:
        target['status'] = 'available'
        target.pop('taken_by', None)
        target.pop('taken_at', None)
        target.pop('taken_note', None)

    write_both(spaces)
    return jsonify({'ok': True, 'id': space_id, 'reverted': last_upd.get('created_at')})


@app.route('/mark_preview', methods=['POST'])
def mark_preview():
    space_id = request.form.get('mark_id')
    note = request.form.get('taken_note') or None
    f = request.files.get('taken_file')
    if not space_id:
        return jsonify({'ok': False, 'error': 'mark_id required'})
    spaces = read_spaces()
    target = None
    for s in spaces:
        if str(s.get('id')) == str(space_id):
            target = s
            break
    if not target:
        return jsonify({'ok': False, 'error': 'space id not found'})

    old_img = None
    if target.get('images') and len(target['images'])>0:
        img = target['images'][0]
        old_img = img if isinstance(img, dict) else {'src': img}

    new_img = None
    if f:
        filename = secure_filename(f.filename)
        # do not save; just return what would be saved
        rel = f"img/{space_id}-manual-update/{filename}"
        new_img = {'src': rel}

    return jsonify({'ok': True, 'old': old_img, 'new': new_img, 'note': note})

@app.route('/img/<path:filename>')
def serve_image(filename):
    """Serve image files from the img directory"""
    return send_from_directory(IMG_DIR, filename)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--host', default='127.0.0.1')
    ap.add_argument('--port', type=int, default=5000)
    ap.add_argument('--commit', action='store_true', help='Expose commit checkbox in the UI')
    args = ap.parse_args()
    # pass commit flag through config
    app.config['ALLOW_COMMIT'] = args.commit
    app.run(host=args.host, port=args.port)

if __name__ == '__main__':
    main()
