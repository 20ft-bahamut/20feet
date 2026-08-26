#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-$PWD}"
cd "$ROOT"

if [[ ! -f AGENTS.md || ! -f artisan || ! -d templates ]]; then
  echo "ERROR: 20feet/G7 project root에서 실행해야 합니다." >&2
  exit 1
fi

STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP="_workspace/20ft/harness-backup-$STAMP"
mkdir -p "$BACKUP"

[[ -f CLAUDE.md ]] && cp -a CLAUDE.md "$BACKUP/CLAUDE.md"
[[ -d .claude ]] && cp -a .claude "$BACKUP/.claude"

echo "Backup: $BACKUP"

rm -rf .claude/hooks

cat > .claude/settings.json <<'JSON'
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./storage/logs/**)"
    ]
  }
}
JSON

echo "Source Guard hooks removed."
echo "Current settings.json:"
cat .claude/settings.json

echo
echo "Hook directory check:"
if [[ -d .claude/hooks ]]; then
  echo "ERROR: .claude/hooks still exists" >&2
  exit 1
else
  echo "OK: .claude/hooks does not exist"
fi
