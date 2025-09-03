#!/usr/bin/env python3
"""
Simplified Admin System for nai-ken-ten-kai
Three main functions:
1. Create new space
2. Mark space as taken  
3. Mark space as updated
"""
from flask import Flask, render_template_string, request, jsonify, send_from_directory
import os, json, shutil, argparse, subprocess
from datetime import datetime
from werkzeug.utils import secure_filename

# Paths
ROOT = os.path.dirname(os.path.dirname(__file__))
IMG_DIR = os.path.join(ROOT, 'img')
BACKUP_DIR = os.path.join(ROOT, 'backups')
SP_NEW = os.path.join(ROOT, 'spaces_new.json')

# Ensure directories exist
os.makedirs(BACKUP_DIR, exist_ok=True)
os.makedirs(IMG_DIR, exist_ok=True)

app = Flask(__name__)

# HTML Template embedded in Python
ADMIN_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Admin System - nai-ken-ten-kai</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: white; padding: 24px; border-radius: 8px; margin-bottom: 24px; text-align: center; }
        .actions { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .action-card { background: white; padding: 24px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .action-card h3 { margin-top: 0; color: #007acc; }
        .btn { padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 500; text-decoration: none; display: inline-block; text-align: center; }
        .btn-primary { background: #007acc; color: white; }
        .btn-success { background: #28a745; color: white; }
        .btn-warning { background: #ffc107; color: #212529; }
        .btn:hover { opacity: 0.9; }
        .spaces-grid { background: white; padding: 24px; border-radius: 8px; }
        .space-item { border: 1px solid #ddd; padding: 16px; margin: 8px 0; border-radius: 4px; display: flex; align-items: center; justify-content: between; }
        .space-item.available { border-left: 4px solid #28a745; }
        .space-item.taken { border-left: 4px solid #ffc107; }
        .space-item.published { border-left: 4px solid #007acc; }
        .space-info { flex: 1; }
        .space-actions { display: flex; gap: 8px; }
        .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .status.available { background: #d4edda; color: #155724; }
        .status.taken { background: #fff3cd; color: #856404; }
        .status.published { background: #cce7ff; color: #004085; }
        .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; }
        .modal-content { background: white; margin: 5% auto; padding: 20px; width: 90%; max-width: 500px; border-radius: 8px; }
        .form-group { margin-bottom: 16px; }
        .form-group label { display: block; margin-bottom: 4px; font-weight: 500; }
        .form-group input, .form-group textarea, .form-group select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
        .form-group textarea { min-height: 80px; }
        .form-actions { display: flex; gap: 12px; margin-top: 20px; }
        .close { float: right; font-size: 24px; font-weight: bold; cursor: pointer; }
        .close:hover { color: red; }
        #result { margin-top: 20px; padding: 12px; border-radius: 4px; display: none; }
        #result.success { background: #d4edda; color: #155724; }
        #result.error { background: #f8d7da; color: #721c24; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏠 Admin System - nai-ken-ten-kai</h1>
            <p>Manage spaces: Create, Mark as Taken, Update</p>
        </div>

        <div class="actions">
            <div class="action-card">
                <h3>➕ Create New Space</h3>
                <p>Add a new space with original photos</p>
                <button class="btn btn-primary" onclick="openModal('createModal')">Create Space</button>
            </div>
            <div class="action-card">
                <h3>🎨 Mark as Taken</h3>
                <p>Assign space to artist with instructions</p>
                <button class="btn btn-warning" onclick="openModal('takenModal')">Mark Taken</button>
            </div>
            <div class="action-card">
                <h3>📸 Add Update</h3>
                <p>Upload final artwork photos</p>
                <button class="btn btn-success" onclick="openModal('updateModal')">Add Update</button>
            </div>
        </div>

        <div class="spaces-grid">
            <h2>Spaces ({{ spaces|length }})</h2>
            {% for space in spaces %}
            <div class="space-item {{ space.status or 'available' }}">
                <div class="space-info">
                    <strong>Space {{ space.id }}</strong>
                    <span class="status {{ space.status or 'available' }}">{{ space.status or 'available' }}</span>
                    <p>{{ space.description or 'No description' }}</p>
                    {% if space.taken_by %}
                    <small>Taken by: {{ space.taken_by }}</small>
                    {% endif %}
                </div>
                <div class="space-actions">
                    {% if space.status == 'available' %}
                    <button class="btn btn-warning" onclick="markTaken({{ space.id }})">Mark Taken</button>
                    {% elif space.status == 'taken' %}
                    <button class="btn btn-success" onclick="addUpdate({{ space.id }})">Add Update</button>
                    {% endif %}
                </div>
            </div>
            {% endfor %}
        </div>
    </div>

    <!-- Create Space Modal -->
    <div id="createModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeModal('createModal')">&times;</span>
            <h3>Create New Space</h3>
            <form id="createForm" enctype="multipart/form-data">
                <div class="form-group">
                    <label>Description:</label>
                    <textarea name="description" required></textarea>
                </div>
                <div class="form-group">
                    <label>Original Photos:</label>
                    <input type="file" name="files" multiple accept="image/*" required>
                </div>
                <div class="form-group">
                    <label>Created by:</label>
                    <input type="text" name="created_by" value="Admin" required>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Create Space</button>
                    <button type="button" class="btn" onclick="closeModal('createModal')">Cancel</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Mark Taken Modal -->
    <div id="takenModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeModal('takenModal')">&times;</span>
            <h3>Mark Space as Taken</h3>
            <form id="takenForm" enctype="multipart/form-data">
                <div class="form-group">
                    <label>Space ID:</label>
                    <input type="number" name="space_id" required>
                </div>
                <div class="form-group">
                    <label>Artist Name:</label>
                    <input type="text" name="artist_name" required>
                </div>
                <div class="form-group">
                    <label>Instructions:</label>
                    <textarea name="instructions"></textarea>
                </div>
                <div class="form-group">
                    <label>Instruction Images (optional):</label>
                    <input type="file" name="instruction_files" multiple accept="image/*">
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-warning">Mark as Taken</button>
                    <button type="button" class="btn" onclick="closeModal('takenModal')">Cancel</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Add Update Modal -->
    <div id="updateModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeModal('updateModal')">&times;</span>
            <h3>Add Update to Space</h3>
            <form id="updateForm" enctype="multipart/form-data">
                <div class="form-group">
                    <label>Space ID:</label>
                    <input type="number" name="space_id" required>
                </div>
                <div class="form-group">
                    <label>Artist Name:</label>
                    <input type="text" name="artist_name" required>
                </div>
                <div class="form-group">
                    <label>Update Description:</label>
                    <textarea name="update_text"></textarea>
                </div>
                <div class="form-group">
                    <label>Final Photos:</label>
                    <input type="file" name="final_files" multiple accept="image/*" required>
                </div>
                <div class="form-group">
                    <label>Status:</label>
                    <select name="status">
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-success">Add Update</button>
                    <button type="button" class="btn" onclick="closeModal('updateModal')">Cancel</button>
                </div>
            </form>
        </div>
    </div>

    <div id="result"></div>

    <script>
        function openModal(modalId) {
            document.getElementById(modalId).style.display = 'block';
        }

        function closeModal(modalId) {
            document.getElementById(modalId).style.display = 'none';
        }

        function markTaken(spaceId) {
            document.querySelector('#takenForm input[name="space_id"]').value = spaceId;
            openModal('takenModal');
        }

        function addUpdate(spaceId) {
            document.querySelector('#updateForm input[name="space_id"]').value = spaceId;
            openModal('updateModal');
        }

        function showResult(message, type) {
            const result = document.getElementById('result');
            result.textContent = message;
            result.className = type;
            result.style.display = 'block';
            setTimeout(() => {
                result.style.display = 'none';
            }, 5000);
        }

        // Form submissions
        document.getElementById('createForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            try {
                const response = await fetch('/create_space', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                if (result.ok) {
                    showResult(`Space ${result.id} created successfully!`, 'success');
                    closeModal('createModal');
                    location.reload();
                } else {
                    showResult(`Error: ${result.error}`, 'error');
                }
            } catch (error) {
                showResult(`Error: ${error.message}`, 'error');
            }
        });

        document.getElementById('takenForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            try {
                const response = await fetch('/mark_taken', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                if (result.ok) {
                    showResult(`Space ${formData.get('space_id')} marked as taken!`, 'success');
                    closeModal('takenModal');
                    location.reload();
                } else {
                    showResult(`Error: ${result.error}`, 'error');
                }
            } catch (error) {
                showResult(`Error: ${error.message}`, 'error');
            }
        });

        document.getElementById('updateForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            try {
                const response = await fetch('/add_update', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                if (result.ok) {
                    showResult(`Update added to space ${formData.get('space_id')}!`, 'success');
                    closeModal('updateModal');
                    location.reload();
                } else {
                    showResult(`Error: ${result.error}`, 'error');
                }
            } catch (error) {
                showResult(`Error: ${error.message}`, 'error');
            }
        });

        // Close modal when clicking outside
        window.onclick = function(event) {
            if (event.target.classList.contains('modal')) {
                event.target.style.display = 'none';
            }
        }
    </script>
</body>
</html>
"""

def read_spaces():
    """Read spaces from JSON file"""
    try:
        with open(SP_NEW, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return []
    except json.JSONDecodeError:
        return []

def backup_and_write_spaces(spaces):
    """Backup existing file and write new data"""
    # Create backup
    if os.path.exists(SP_NEW):
        backup_name = f'spaces_new.json.bak.{datetime.utcnow().strftime("%Y%m%d%H%M%S")}'
        backup_path = os.path.join(BACKUP_DIR, backup_name)
        shutil.copy2(SP_NEW, backup_path)
    
    # Write new data
    with open(SP_NEW, 'w', encoding='utf-8') as f:
        json.dump(spaces, f, ensure_ascii=False, indent=2)
    
    # Update optimized and timeline files
    try:
        # Run export scripts directly
        os.system(f'cd "{ROOT}" && python3 scripts/export_optimized.py')
        os.system(f'cd "{ROOT}" && python3 scripts/export_timeline.py')
        print("✅ Updated optimized and timeline files")
    except Exception as e:
        print(f"⚠️  Warning: Could not update export files: {e}")

def get_exif_taken_at(img_path):
    """Extract EXIF timestamp from image file"""
    import subprocess
    try:
        result = subprocess.run([
            'exiftool',
            '-CreateDate',
            '-DateTimeOriginal',
            img_path
        ], capture_output=True, text=True, check=True)
        lines = result.stdout.splitlines()
        date_value = None
        for line in lines:
            if 'Date/Time Original' in line or 'Create Date' in line:
                # exiftool output: 'Create Date                     : 2025:08:21 09:21:34'
                parts = line.split(':', 1)
                if len(parts) == 2:
                    date_str = parts[1].strip()
                    # Convert 'YYYY:MM:DD HH:MM:SS' to ISO 8601 'YYYY-MM-DDTHH:MM:SS'
                    try:
                        dt = datetime.strptime(date_str, '%Y:%m:%d %H:%M:%S')
                        return dt.isoformat()
                    except Exception:
                        # If parsing fails, try alternative format
                        date_value = date_str.replace(' ', 'T').replace(':', '-', 2)
                    break
        return date_value
    except Exception as e:
        print(f"Error extracting EXIF from {img_path}: {e}")
        return None

def save_uploaded_files(files, folder_name):
    """Save uploaded files and return file info"""
    folder_path = os.path.join(IMG_DIR, folder_name)
    os.makedirs(folder_path, exist_ok=True)
    
    saved_files = []
    for file in files:
        if file.filename:
            filename = secure_filename(file.filename)
            file_path = os.path.join(folder_path, filename)
            file.save(file_path)
            
            rel_path = os.path.relpath(file_path, ROOT).replace('\\', '/')
            
            # Try to extract EXIF timestamp, fallback to upload time
            exif_timestamp = get_exif_taken_at(file_path)
            taken_at = exif_timestamp if exif_timestamp else datetime.utcnow().isoformat()
            
            saved_files.append({
                'src': rel_path,
                'taken_at': taken_at
            })
    
    return saved_files

@app.route('/')
def index():
    """Main admin page"""
    spaces = read_spaces()
    return render_template_string(ADMIN_TEMPLATE, spaces=spaces)

@app.route('/create_space', methods=['POST'])
def create_space():
    """Create a new space"""
    try:
        description = request.form.get('description', '')
        created_by = request.form.get('created_by', 'Admin')
        files = request.files.getlist('files')
        
        if not files or not any(f.filename for f in files):
            return jsonify({'ok': False, 'error': 'No files uploaded'})
        
        spaces = read_spaces()
        
        # Get next ID
        max_id = max((s.get('id', 0) for s in spaces), default=0)
        new_id = max_id + 1
        
        # Save files
        folder_name = f"{new_id}-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        saved_files = save_uploaded_files(files, folder_name)
        
        # Create new space
        new_space = {
            'id': new_id,
            'description': description,
            'images': saved_files,
            'created_by': created_by,
            'created_at': datetime.utcnow().isoformat(),
            'status': 'available',
            'updates': []
        }
        
        spaces.append(new_space)
        backup_and_write_spaces(spaces)
        
        return jsonify({'ok': True, 'id': new_id})
        
    except Exception as e:
        return jsonify({'ok': False, 'error': str(e)})

@app.route('/mark_taken', methods=['POST'])
def mark_taken():
    """Mark a space as taken"""
    try:
        space_id = int(request.form.get('space_id'))
        artist_name = request.form.get('artist_name', '')
        instructions = request.form.get('instructions', '')
        instruction_files = request.files.getlist('instruction_files')
        
        spaces = read_spaces()
        
        # Find the space
        space = None
        for s in spaces:
            if s.get('id') == space_id:
                space = s
                break
        
        if not space:
            return jsonify({'ok': False, 'error': f'Space {space_id} not found'})
        
        # Save instruction files if any
        instruction_images = []
        if instruction_files and any(f.filename for f in instruction_files):
            folder_name = f"instruction-{space_id}-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
            instruction_images = save_uploaded_files(instruction_files, folder_name)
        
        # Update space
        space['status'] = 'taken'
        space['taken_by'] = artist_name
        space['taken_at'] = datetime.utcnow().isoformat()
        space['instruction_text'] = instructions
        space['instruction_images'] = instruction_images
        
        backup_and_write_spaces(spaces)
        
        return jsonify({'ok': True})
        
    except Exception as e:
        return jsonify({'ok': False, 'error': str(e)})

@app.route('/add_update', methods=['POST'])
def add_update():
    """Add an update to a space"""
    try:
        space_id = int(request.form.get('space_id'))
        artist_name = request.form.get('artist_name', '')
        update_text = request.form.get('update_text', '')
        status = request.form.get('status', 'draft')
        final_files = request.files.getlist('final_files')
        
        if not final_files or not any(f.filename for f in final_files):
            return jsonify({'ok': False, 'error': 'No files uploaded'})
        
        spaces = read_spaces()
        
        # Find the space
        space = None
        for s in spaces:
            if s.get('id') == space_id:
                space = s
                break
        
        if not space:
            return jsonify({'ok': False, 'error': f'Space {space_id} not found'})
        
        # Save final files
        folder_name = f"update-{space_id}-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        saved_files = save_uploaded_files(final_files, folder_name)
        
        # Add primary role to first image
        if saved_files:
            saved_files[0]['role'] = 'primary'
            for img in saved_files[1:]:
                img['role'] = 'supplementary'
        
        # Create update
        update = {
            'author': artist_name,
            'text': update_text,
            'action': 'update',
            'images': saved_files,
            'created_at': datetime.utcnow().isoformat(),
            'status': status
        }
        
        # Add update to space
        if 'updates' not in space:
            space['updates'] = []
        space['updates'].append(update)
        
        # Update space status if published
        if status == 'published':
            space['status'] = 'published'
        
        space['modified_by'] = artist_name
        space['modified_at'] = datetime.utcnow().isoformat()
        
        backup_and_write_spaces(spaces)
        
        return jsonify({'ok': True})
        
    except Exception as e:
        return jsonify({'ok': False, 'error': str(e)})

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--host', default='127.0.0.1')
    parser.add_argument('--port', type=int, default=5000)
    args = parser.parse_args()
    
    print(f"🚀 Starting Admin System on http://{args.host}:{args.port}")
    print("📁 Data will be saved to:", SP_NEW)
    print("🖼️  Images will be saved to:", IMG_DIR)
    
    app.run(host=args.host, port=args.port, debug=True)

if __name__ == '__main__':
    main()
