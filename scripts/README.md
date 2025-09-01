# scripts/

This folder contains utility scripts used to build and maintain the site's JSON data files.

Canonical data file
- `spaces_new.json` is treated as the canonical data source by the frontend.
- Scripts write `spaces_new.json` and also produce a compatibility copy `spaces.json` for older pages or manual workflows.

Quick scripts
- `mark_taken.py <id> --by "Name" [--date ISO] [--note "..."]` — mark a space as taken (safe update with both JSONs written).
- `add_images.py --dir img/newset --author "A Name" [--new | --title-id ID] [--status draft|published]` — add images as a new space or append to an existing space. The script will try to extract EXIF DateTimeOriginal for taken_at when Pillow is available.

Recommended workflow
1. Add new images under `img/<folder>`.
2. Run `python scripts/add_images.py --dir img/<folder> --author "Name" --new --status draft`.
3. Optionally run description/categorization scripts (if available) to add captions/tags.
4. When a space is taken, run `python scripts/mark_taken.py <id> --by "Taker Name"`.

Notes
- These scripts operate on local files and write JSON in-place. They create compatibility copies but do not commit or push to git. For production, consider wrapping them in a git commit step or a lightweight admin UI.
- If Pillow is not installed, EXIF extraction is skipped; install Pillow in your Python env to enable it: `pip install pillow`.
