#!/usr/bin/env python3
"""
Export spaces_timeline.json with timeline events for ten.html.
This includes:
1. Original space images (with taken_at timestamps)
2. Update events when spaces are modified (new photos after instructions)

Timeline events are sorted chronologically and include:
- space_id
- type ('original' or 'update') 
- images with taken_at timestamps
- author info
- action text
"""
import json, os
from datetime import datetime

ROOT = os.path.dirname(os.path.dirname(__file__))
SP_NEW = os.path.join(ROOT, 'spaces_new.json')
OUT = os.path.join(ROOT, 'spaces_timeline.json')

def export_timeline(spaces=None):
    if spaces is None:
        with open(SP_NEW, 'r', encoding='utf-8') as f:
            spaces = json.load(f)
    
    timeline_events = []
    
    for space in spaces:
        space_id = space.get('id')
        
        # Add original image as timeline event if it has taken_at
        original_images = space.get('images', [])
        if original_images and original_images[0].get('taken_at'):
            timeline_events.append({
                'space_id': space_id,
                'type': 'original',
                'images': [original_images[0]],
                'taken_at': original_images[0]['taken_at'],
                'author': space.get('created_by', 'Original'),
                'text': 'Original state',
                'action': 'original'
            })
        
        # Add update events from published updates
        updates = space.get('updates', [])
        for update in updates:
            # Only include updates that have images and timestamps
            if (update.get('images') and 
                len(update['images']) > 0 and 
                update.get('created_at')):
                
                # Find primary image or use first image
                primary_img = None
                supplementary_imgs = []
                
                for img in update['images']:
                    if img.get('role') == 'primary':
                        primary_img = img
                    else:
                        supplementary_imgs.append(img)
                
                if not primary_img and update['images']:
                    primary_img = update['images'][0]
                    supplementary_imgs = update['images'][1:]
                
                if primary_img:
                    # Use primary image's taken_at (EXIF time) instead of upload time
                    image_taken_at = primary_img.get('taken_at', update['created_at'])
                    timeline_event = {
                        'space_id': space_id,
                        'type': 'update',
                        'images': [primary_img] + supplementary_imgs,
                        'taken_at': image_taken_at,
                        'author': update.get('author', 'Unknown'),
                        'text': update.get('text', ''),
                        'action': update.get('action', 'update'),
                        'status': update.get('status', 'draft')
                    }
                    timeline_events.append(timeline_event)
    
    # Sort by taken_at timestamp
    timeline_events.sort(key=lambda x: x.get('taken_at', ''))
    
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(timeline_events, f, ensure_ascii=False, indent=2)
    
    print(f"Exported {len(timeline_events)} timeline events to {OUT}")
    return timeline_events

if __name__ == "__main__":
    export_timeline()
