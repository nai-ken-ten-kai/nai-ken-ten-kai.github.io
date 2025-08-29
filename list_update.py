import os
import json

img_dir = "img/"
output_json = "database.json"

# List all image files (adjust extensions as needed)
images = sorted([f for f in os.listdir(img_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))])

# Each image as a separate cell (adjust grouping logic if needed)
data = [{"images": [os.path.join(img_dir, img)]} for img in images]

with open(output_json, "w") as f:
    json.dump(data, f, indent=2)

print(f"database.json updated with {len(images)} images.")