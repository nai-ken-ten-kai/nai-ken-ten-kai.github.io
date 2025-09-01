Backups folder

This directory collects timestamped backup files that were previously left in the repository root.

Conventions:
- Files are moved here when they match the pattern: `*.bak.*` (for example `spaces_new.json.bak.20250901043034`).
- Keep only a small number of backups per base file; use `scripts/cleanup_backups.sh` to move and optionally prune older backups.

How to run the cleanup script:

```bash
# Move all root-level backups into backups/ and keep the last 5 backups per base file
./scripts/cleanup_backups.sh 5
```

If you prefer backups retained elsewhere (e.g., a dedicated branch or external storage), move them accordingly.
