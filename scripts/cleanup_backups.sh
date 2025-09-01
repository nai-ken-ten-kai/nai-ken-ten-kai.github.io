#!/usr/bin/env bash
# Simple cleanup helper: move timestamped .bak files into backups/ and keep only the last N per prefix.
# Usage: ./scripts/cleanup_backups.sh [keep-count]
KEEP=${1:-5}
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT" || exit 1
mkdir -p backups
# Move any root-level *.bak.* files into backups
shopt -s nullglob
for f in *.bak.*; do
  echo "Moving $f -> backups/"
  git mv "$f" backups/ 2>/dev/null || mv "$f" backups/
done
# Optionally prune older backups per base filename
for base in $(ls backups | sed -n 's/\(.*\)\.bak\..*/\1/p' | sort -u); do
  files=( $(ls -1t backups/${base}.bak.* 2>/dev/null) )
  if [ ${#files[@]} -gt $KEEP ]; then
    echo "Pruning ${#files[@]} -> keeping $KEEP for base $base"
    for idx in "${files[@]:$KEEP}"; do
      echo "Removing $idx"
      rm -f "backups/$(basename "$idx")"
    done
  fi
done

echo "Done. Backups moved to backups/"
