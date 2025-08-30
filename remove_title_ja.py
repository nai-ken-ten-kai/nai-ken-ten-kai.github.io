import json

with open("spaces.json", "r", encoding="utf-8") as f:
    spaces = json.load(f)

for space in spaces:
    if "title_ja" in space:
        del space["title_ja"]

with open("spaces.json", "w", encoding="utf-8") as f:
    json.dump(spaces, f, ensure_ascii=False, indent=2)

print("All 'title_ja' fields removed from spaces.json.")