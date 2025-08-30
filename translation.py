import json
from googletrans import Translator

# Load your spaces.json
with open("spaces.json", "r") as f:
    spaces = json.load(f)

translator = Translator()

for space in spaces:
    # Translate title and description to Japanese
    title_en = space.get("title", "")
    desc_en = space.get("description", "")
    try:
        title_ja = translator.translate(title_en, src="en", dest="ja").text
        desc_ja = translator.translate(desc_en, src="en", dest="ja").text
    except Exception as e:
        print(f"Translation error: {e}")
        title_ja = title_en
        desc_ja = desc_en
    space["title_ja"] = title_ja
    space["description_ja"] = desc_ja

# Save to a new file
with open("spaces_ja.json", "w", encoding="utf-8") as f:
    json.dump(spaces, f, ensure_ascii=False, indent=2)

print("Done! Output written to spaces_ja.json")