import json
from datetime import datetime

def convert_images_to_objects(input_path, output_path):
    with open(input_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    for space in data:
        new_images = []
        for img in space.get('images', []):
            if isinstance(img, dict):
                new_images.append(img)
            else:
                # Try to extract timestamp from filename, else use None
                # Example: img/0001_20250831T1430.jpg
                ts = None
                name = img.split('/')[-1]
                if '_' in name:
                    try:
                        ts_part = name.split('_')[1].split('.')[0]
                        ts = datetime.strptime(ts_part, '%Y%m%dT%H%M').isoformat()
                    except Exception:
                        ts = None
                new_images.append({"src": img, "taken_at": ts})
        space['images'] = new_images
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

if __name__ == '__main__':
    import sys
    if len(sys.argv) != 3:
        print('Usage: python convert_images_to_objects.py spaces.json spaces_new.json')
    else:
        convert_images_to_objects(sys.argv[1], sys.argv[2])
