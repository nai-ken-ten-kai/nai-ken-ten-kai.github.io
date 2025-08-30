import json

# Load database.json (list of {"images": ["img/xxxx.jpg"]})
with open('database.json', 'r') as f:
    db = json.load(f)

spaces = []
for idx, entry in enumerate(db, 1):
    img = entry["images"][0]
    spaces.append({
        "id": idx,
        "title": f"Space {idx}",
        "description": f"Description for Space {idx}.",
        "images": [img],
        "status": "available",
        "location": "inside",
        "element": ["ground"],
        "style": ["minimal"]
    })

with open('spaces.json', 'w') as f:
    json.dump(spaces, f, ensure_ascii=False, indent=2)

print(f"Wrote {len(spaces)} spaces to spaces.json")
