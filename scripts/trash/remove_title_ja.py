#!/usr/bin/env python3
import json
import os
src = "spaces_new.json" if os.path.exists("spaces_new.json") else "spaces.json"
with open(src, "r", encoding="utf-8") as f:
    spaces = json.load(f)

for space in spaces:
    if "title_ja" in space:
        del space["title_ja"]

with open("spaces_new.json", "w", encoding="utf-8") as f:
    json.dump(spaces, f, ensure_ascii=False, indent=2)
with open("spaces.json", "w", encoding="utf-8") as f:
    json.dump(spaces, f, ensure_ascii=False, indent=2)

print("All 'title_ja' fields removed from spaces_new.json and spaces.json.")
