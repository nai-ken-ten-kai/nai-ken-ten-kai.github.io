import json

with open('spaces.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for item in data:
    if 'title' in item:
        del item['title']
    # Optionally, remove 'title_ja' as well if not needed
    if 'title_ja' in item:
        del item['title_ja']

with open('spaces.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print('Removed title and title_ja fields from spaces.json')
