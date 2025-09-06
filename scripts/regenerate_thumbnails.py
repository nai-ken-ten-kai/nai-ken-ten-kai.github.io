#!/usr/bin/env python3
"""
Thumbnail Maintenance Script for nai-ken-ten-kai
Regenerates thumbnails for all images in the img/ directory
"""

import os
import sys
from PIL import Image

# Add the scripts directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'scripts'))

def generate_thumbnail(image_path, thumbnail_path):
    """Generate a thumbnail for the given image"""
    try:
        with Image.open(image_path) as img:
            # Calculate new size (25% of original)
            width, height = img.size
            new_size = (int(width * 0.25), int(height * 0.25))

            # Resize image
            thumbnail = img.resize(new_size, Image.Resampling.LANCZOS)

            # Save thumbnail
            thumbnail.save(thumbnail_path, 'JPEG', quality=85)
            return True
    except Exception as e:
        print(f"Error generating thumbnail for {image_path}: {e}")
        return False

def regenerate_all_thumbnails():
    """Regenerate all thumbnails"""
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    img_dir = os.path.join(root_dir, 'img')
    thumbnail_dir = os.path.join(img_dir, 'thumbnails')

    # Ensure thumbnail directory exists
    os.makedirs(thumbnail_dir, exist_ok=True)

    print("🔄 Regenerating all thumbnails...")
    count = 0

    # Process all JPG files in img directory (excluding update folders)
    for filename in os.listdir(img_dir):
        if filename.endswith('.jpg') and not filename.startswith('update-'):
            image_path = os.path.join(img_dir, filename)
            thumbnail_path = os.path.join(thumbnail_dir, filename)

            if generate_thumbnail(image_path, thumbnail_path):
                count += 1
                print(f"  ✅ Generated thumbnail for {filename}")

    print(f"📸 Regenerated {count} thumbnails")

if __name__ == '__main__':
    regenerate_all_thumbnails()
