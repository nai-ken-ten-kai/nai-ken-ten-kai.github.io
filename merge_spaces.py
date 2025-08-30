import json

with open("spaces.json", "r", encoding="utf-8") as f:
    spaces_en = {str(item["id"]): item for item in json.load(f)}

with open("spaces_ja.json", "r", encoding="utf-8") as f:
    spaces_ja = {str(item["id"]): item for item in json.load(f)}

# Merge: keep all fields from spaces_en, add *_ja fields from spaces_ja
for id_, en in spaces_en.items():
    ja = spaces_ja.get(id_)
    if ja:
        for k, v in ja.items():
            if k.endswith("_ja") or k.startswith("clip_") or k == "has_hook":
                en[k] = v

# Write back to spaces.json
with open("spaces.json", "w", encoding="utf-8") as f:
    json.dump(list(spaces_en.values()), f, ensure_ascii=False, indent=2)

print("Merged! spaces.json now contains all English, Japanese, and AI fields, with statuses from your latest spaces.json.")
