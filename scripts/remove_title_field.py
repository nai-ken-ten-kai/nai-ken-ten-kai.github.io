#!/usr/bin/env python3
import json
import os

src = 'spaces_new.json' if os.path.exists('spaces_new.json') else 'spaces.json'
with open(src, 'r', encoding='utf-8') as f:
    data = json.load(f)

for item in data:
    if 'title' in item:
        del item['title']
    # Optionally, remove 'title_ja' as well if not needed
    if 'title_ja' in item:
        del item['title_ja']

with open('spaces_new.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
with open('spaces.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print('Removed title and title_ja fields from spaces_new.json and spaces.json')
