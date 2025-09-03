from flask import abort
def optimize_image(path, max_size=1080, quality=80):
    if Image is None:
        return
    try:
        img = Image.open(path)
        img = img.convert('RGB')
        # Resize to fit max_size on long edge
        w, h = img.size
        if max(w, h) > max_size:
            if w > h:
                new_w = max_size
                new_h = int(h * max_size / w)
            else:
                new_h = max_size
                new_w = int(w * max_size / h)
            img = img.resize((new_w, new_h), Image.LANCZOS)
        img.save(path, 'JPEG', quality=quality, optimize=True)
    except Exception as e:
        print(f'Image optimization failed: {e}')
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
BACKUP_DIR = os.path.join(ROOT, 'backups')
os.makedirs(BACKUP_DIR, exist_ok=True)
SP_NEW = os.path.join(ROOT, 'spaces_new.json')

app = Flask(__name__, template_folder=os.path.join(os.path.dirname(__file__), 'templates'), static_folder=os.path.join(os.path.dirname(__file__), 'static'))

def read_spaces():
    path = SP_NEW if os.path.exists(SP_NEW) else SP
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def backup_spaces():
    if os.path.exists(SP_NEW):
        bak = os.path.join(BACKUP_DIR, 'spaces_new.json.bak.' + datetime.utcnow().strftime('%Y%m%d%H%M%S'))
        shutil.copy2(SP_NEW, bak)
        # Keep only the latest 3 backups
        baks = sorted([f for f in os.listdir(BACKUP_DIR) if f.startswith('spaces_new.json.bak.')])
        for old in baks[:-3]:
            try:
                os.remove(os.path.join(BACKUP_DIR, old))
            except Exception:
                pass

def write_both(data):
    backup_spaces()
    with open(SP_NEW, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    # Also write spaces_optimized.json for frontend
    try:
        from scripts.export_optimized import export_optimized
        export_optimized(data)
    except Exception as e:
        print(f"[WARN] Could not update spaces_optimized.json: {e}")
    # Also write spaces_timeline.json for timeline gallery
    try:
        from scripts.export_timeline import export_timeline
        export_timeline(data)
    except Exception as e:
        print(f"[WARN] Could not update spaces_timeline.json: {e}")

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
    try:
        spaces = read_spaces()
        print(f"DEBUG: Loaded {len(spaces)} spaces")
        return render_template('admin.html', spaces=spaces)
    except Exception as e:
        print(f"ERROR in index route: {e}")
        import traceback
        traceback.print_exc()
        return f"<h1>Error</h1><p>{str(e)}</p><pre>{traceback.format_exc()}</pre>"

@app.route('/template')
def template():
    try:
        spaces = read_spaces()
        return render_template('admin.html', spaces=spaces)
    except Exception as e:
        return f"<h1>Template Error</h1><p>{str(e)}</p>"

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


@app.route('/mark_multiple', methods=['POST'])
def mark_multiple():
    space_ids = request.form.get('space_ids', '').strip()
    taken_by = request.form.get('taken_by') or 'Unknown'
    note = request.form.get('taken_note') or None
    instruction_text = request.form.get('instruction_text') or None

    if not space_ids:
        return jsonify({'ok': False, 'error': 'space_ids required'})

    # Parse space IDs (comma-separated)
    try:
        ids = [int(x.strip()) for x in space_ids.split(',') if x.strip()]
    except ValueError:
        return jsonify({'ok': False, 'error': 'Invalid space ID format'})

    if not ids:
        return jsonify({'ok': False, 'error': 'No valid space IDs provided'})

    spaces = read_spaces()
    marked_spaces = []
    errors = []

    # Handle instruction images if provided
    instruction_images = []
    instruction_files = request.files.getlist('instruction_files')
    if instruction_files:
        # Create instruction folder
        instruction_folder = f"instruction-{taken_by.replace(' ', '_')}-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        target_dir = os.path.join(IMG_DIR, instruction_folder)
        os.makedirs(target_dir, exist_ok=True)

        for f in instruction_files:
            if f.filename:
                filename = secure_filename(f.filename)
                path = os.path.join(target_dir, filename)
                f.save(path)
                optimize_image(path)
                rel = os.path.relpath(path, ROOT).replace('\\', '/')
                instruction_images.append({'src': rel, 'taken_at': exif_taken(path)})

    for space_id in ids:
        target = None
        for s in spaces:
            if s.get('id') == space_id:
                target = s
                break

        if not target:
            errors.append(f'Space {space_id} not found')
            continue

        # Track taken info per artist
        if 'taken_artists' not in target:
            target['taken_artists'] = []

        # Check if this artist already marked this space
        existing_artist = None
        for artist in target['taken_artists']:
            if artist.get('name') == taken_by:
                existing_artist = artist
                break

        # If already marked by this artist, only append new data if provided
        if existing_artist:
            appended = False
            if note:
                existing_artist.setdefault('notes', []).append(note)
                appended = True
            if instruction_text:
                existing_artist.setdefault('instructions', []).append(instruction_text)
                appended = True
            if instruction_images:
                existing_artist.setdefault('instruction_images', []).extend(instruction_images)
                appended = True
            # Always append update if new data
            if (instruction_text or instruction_images):
                upd = {
                    'author': taken_by,
                    'text': instruction_text,
                    'action': 'instruction',
                    'images': [{'src': img['src'], 'role': 'instruction', 'taken_at': img['taken_at']} for img in instruction_images],
                    'created_at': datetime.utcnow().isoformat(),
                    'status': 'instruction',
                    'related': []
                }
                target.setdefault('updates', []).append(upd)
                appended = True
            if appended:
                marked_spaces.append(space_id)
            # If no new data, skip
            continue

        # If marked by a different artist, warn (frontend should handle confirmation)
        if target['taken_artists']:
            errors.append(f"Space {space_id} already taken by another artist. If you want to add a second artist, please confirm and resubmit.")
            continue

        # New artist marking this space
        artist_entry = {
            'name': taken_by,
            'taken_at': datetime.utcnow().isoformat(),
            'notes': [note] if note else [],
            'instructions': [instruction_text] if instruction_text else [],
            'instruction_images': instruction_images if instruction_images else []
        }
        target['taken_artists'].append(artist_entry)
        target['status'] = 'taken'
        # For backward compatibility, keep these fields for the most recent artist
        target['taken_by'] = taken_by
        target['taken_at'] = artist_entry['taken_at']
        if note:
            target['taken_note'] = note
        if instruction_text:
            target['instruction_text'] = instruction_text
        if instruction_images:
            target['instruction_images'] = instruction_images

        # Create instruction update for timeline
        if instruction_text or instruction_images:
            upd = {
                'author': taken_by,
                'text': instruction_text,
                'action': 'instruction',
                'images': [{'src': img['src'], 'role': 'instruction', 'taken_at': img['taken_at']} for img in instruction_images],
                'created_at': datetime.utcnow().isoformat(),
                'status': 'instruction',
                'related': []
            }
            target.setdefault('updates', []).append(upd)

        marked_spaces.append(space_id)

    if marked_spaces:
        write_both(spaces)

    return jsonify({
        'ok': True,
        'marked': marked_spaces,
        'errors': errors,
        'instruction_images': len(instruction_images) if instruction_images else 0
    })


@app.route('/publish_update', methods=['POST'])
def publish_update():
    space_id = request.form.get('space_id')
    author = request.form.get('author') or 'Unknown'
    update_text = request.form.get('update_text') or None

    if not space_id:
        return jsonify({'ok': False, 'error': 'space_id required'})

    spaces = read_spaces()
    target = None
    for s in spaces:
        if str(s.get('id')) == str(space_id):
            target = s
            break

    if not target:
        return jsonify({'ok': False, 'error': 'space not found'})

    # Handle published update images
    update_files = request.files.getlist('update_files')
    if not update_files or not any(f.filename for f in update_files):
        return jsonify({'ok': False, 'error': 'No update images provided'})

    # Create update folder
    update_folder = f"{space_id}-update-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    target_dir = os.path.join(IMG_DIR, update_folder)
    os.makedirs(target_dir, exist_ok=True)

    saved_images = []
    for f in update_files:
        if f.filename:
            filename = secure_filename(f.filename)
            path = os.path.join(target_dir, filename)
            f.save(path)
            optimize_image(path)
            rel = os.path.relpath(path, ROOT).replace('\\', '/')
            saved_images.append({'src': rel, 'taken_at': exif_taken(path), 'role': 'update'})
# API endpoint for minimal space info
@app.route('/api/space/<int:space_id>')
def api_space(space_id):
    spaces = read_spaces()
    for s in spaces:
        if int(s.get('id')) == space_id:
            # Compose minimal info
            out = {
                'id': s.get('id'),
                'description': s.get('description', {}),
                'status': s.get('status'),
                'artist': [],
                'original_image': None,
                'final_image': None
            }
            # Original image: first in images[]
            imgs = s.get('images', [])
            if imgs:
                out['original_image'] = imgs[0]
            # Final image: last published update image
            for upd in reversed(s.get('updates', [])):
                if upd.get('status') == 'published' and upd.get('images'):
                    out['final_image'] = upd['images'][-1]
                    break
            # Artists and their instructions/images
            for artist in s.get('taken_artists', []):
                out['artist'].append({
                    'name': artist.get('name'),
                    'taken_at': artist.get('taken_at'),
                    'instructions': artist.get('instructions', []),
                    'instruction_images': artist.get('instruction_images', [])
                })
            return jsonify(out)
    abort(404)

    # Create published update
    upd = {
        'author': author,
        'text': update_text,
        'action': 'published',
        'images': saved_images,
        'created_at': datetime.utcnow().isoformat(),
        'status': 'published',
        'related': []
    }

    target.setdefault('updates', []).append(upd)
    target['status'] = 'published'
    target['modified_by'] = author
    target['modified_at'] = datetime.utcnow().isoformat()

    # Add update images to the space's main images
    target.setdefault('images', []).extend(saved_images)

    write_both(spaces)
    return jsonify({'ok': True, 'id': space_id, 'images': len(saved_images)})


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
