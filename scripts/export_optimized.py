#!/usr/bin/env python3
"""
Export spaces_optimized.json with only the minimal info needed for the frontend.
- id
- description (all languages)
- original_image (first image)
- status
- artist: name, taken_at, instructions, instruction_images
- final_image (last published update image)
- All images must have taken_at
"""
import json, os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(__file__))
SP_NEW = os.path.join(ROOT, 'spaces_new.json')
OUT = os.path.join(ROOT, 'spaces_optimized.json')


def export_optimized(spaces=None):
    """Export optimized spaces data for frontend use"""
    if spaces is None:
        with open(SP_NEW, 'r', encoding='utf-8') as f:
            spaces = json.load(f)
    result = []
    for s in spaces:
        entry = {
            'id': s.get('id'),
            'description': s.get('description', {}),
            'status': s.get('status'),
            'artist': [],
            'original_image': None
        }
        imgs = s.get('images', [])
        if imgs:
            entry['original_image'] = imgs[0]
        # Build artist list with instructions, instruction_images, and final_image
        for artist in s.get('taken_artists', []):
            artist_entry = {
                'name': artist.get('name'),
                'taken_at': artist.get('taken_at'),
                'instructions': artist.get('instructions', []),
                'instruction_images': artist.get('instruction_images', []),
                'final_image': None
            }
            # Find the final image for this artist (last published update by this artist)
            for upd in reversed(s.get('updates', [])):
                if upd.get('status') == 'published' and upd.get('author') == artist.get('name') and upd.get('images'):
                    artist_entry['final_image'] = upd['images'][-1]
                    break
            entry['artist'].append(artist_entry)
        result.append(entry)
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    print(f"Exported {len(result)} spaces to {OUT}")
    return result

if __name__ == "__main__":
    export_optimized()
