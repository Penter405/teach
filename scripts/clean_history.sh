#!/usr/bin/env bash
# Rewrite git history so every commit keeps only the compiled bundles that
# its own docs/index.html references. Everything else under docs/assets
# (docs/assets/old/*, stale index-*.js/css) is removed from that commit.
#
# Run from Git Bash in the repo root:   bash scripts/clean_history.sh
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Error: working tree is not clean. Commit or stash your changes first." >&2
  exit 1
fi

# Make sure every branch on origin also exists locally, so all of them get
# cleaned and force-pushed (otherwise remote-only branches keep the old files).
git fetch origin --prune
git for-each-ref --format="%(refname:strip=3)" refs/remotes/origin/ | while read -r b; do
  [[ "$b" == "HEAD" ]] && continue
  git show-ref --verify --quiet "refs/heads/$b" || git branch --track "$b" "origin/$b"
done

# Back up every branch under refs/backup/ (not rewritten, not pushed).
stamp=$(date +%Y%m%d-%H%M%S)
git for-each-ref --format="%(refname:short)" refs/heads/ | while read -r b; do
  git update-ref "refs/backup/$stamp/$b" "refs/heads/$b"
done
echo "Backups saved under refs/backup/$stamp/"

export FILTER_BRANCH_SQUELCH_WARNING=1
git filter-branch -f --prune-empty --index-filter '
  keep=$(git show :docs/index.html 2>/dev/null \
         | grep -oE "assets/[^\"'"'"' >)]+\.(js|css)" \
         | sed "s#^#docs/#" || true)
  git ls-files -- docs/assets \
    | grep -E "\.(js|css)$" \
    | grep -vxF -e "${keep:-__none__}" \
    | xargs -r git rm --cached -q --ignore-unmatch --
' --tag-name-filter cat -- --branches --tags

# Drop the backup refs filter-branch keeps and compact the repo.
git for-each-ref --format="%(refname)" refs/original/ | xargs -r -n1 git update-ref -d
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo
echo "Done. Backups are still under refs/backup/$stamp/ (they keep the old files on this PC)."
echo "After verifying, delete them and compact:"
echo "  git for-each-ref --format=\"%(refname)\" refs/backup/ | xargs -n1 git update-ref -d"
echo "  git gc --prune=now --aggressive"
echo
echo "Force push:"
echo "  git push --force --all origin"
echo "  git push --force --tags origin"
