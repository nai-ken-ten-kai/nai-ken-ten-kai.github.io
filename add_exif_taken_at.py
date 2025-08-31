
import json
import os
import subprocess
from datetime import datetime


def get_exif_taken_at(img_path):
    # Use exiftool to extract Create Date or Date/Time Original
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
                        date_value = dt.isoformat()
                    except Exception:
                        date_value = date_str.replace(' ', 'T').replace(':', '-', 2)
                    break
        if date_value:
            return date_value
        else:
            print(f"No EXIF date found for {img_path}")
            return None
    except Exception as e:
        print(f"Error running exiftool on {img_path}: {e}")
        return None

def update_json_with_exif(json_path, img_base_dir=None):
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    for space in data:
        for img in space.get('images', []):
            if isinstance(img, dict) and (not img.get('taken_at') or img['taken_at'] is None):
                img_path = img['src']
                if img_base_dir and not os.path.isabs(img_path):
                    if not img_path.startswith(img_base_dir + os.sep):
                        img_path = os.path.join(img_base_dir, img_path)
                if os.path.exists(img_path):
                    taken_at = get_exif_taken_at(img_path)
                    if taken_at:
                        img['taken_at'] = taken_at
                        print(f"Updated {img_path} with taken_at: {taken_at}")
                else:
                    print(f"Image not found: {img_path}")
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

if __name__ == '__main__':
    import sys
    if len(sys.argv) not in (2, 3):
        print('Usage: python add_exif_taken_at.py spaces_new.json [img_base_dir]')
    else:
        json_path = sys.argv[1]
        img_base_dir = sys.argv[2] if len(sys.argv) == 3 else None
        update_json_with_exif(json_path, img_base_dir)
