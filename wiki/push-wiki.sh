#!/usr/bin/env bash
# GitLayer Wiki Deployment Script
# Automatically deploys local wiki documentation in wiki/ to the GitHub Wiki repository.

set -e

REPO_OWNER="theabhishekarmagi"
REPO_NAME="GitLayer"
WIKI_REMOTE="https://github.com/${REPO_OWNER}/${REPO_NAME}.wiki.git"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
WIKI_DIR="${SCRIPT_DIR}"

echo "========================================================"
echo "           GitLayer GitHub Wiki Deployment              "
echo "========================================================"
echo "Source Directory : ${WIKI_DIR}"
echo "Target Wiki Repo : ${WIKI_REMOTE}"
echo ""

# 1. Check if the remote GitHub wiki repository has been initialized
echo "[1/4] Checking GitHub Wiki repository status..."
if ! git ls-remote "${WIKI_REMOTE}" HEAD >/dev/null 2>&1; then
  echo ""
  echo "[WARNING] GitHub Wiki repository is NOT initialized yet on GitHub."
  echo ""
  echo "GitHub creates the .wiki.git repository lazily only after you create"
  echo "the first wiki page through the GitHub web interface."
  echo ""
  echo "Please follow these simple steps once:"
  echo "  1. Open: https://github.com/${REPO_OWNER}/${REPO_NAME}/wiki"
  echo "  2. Click the 'Create the first page' button."
  echo "  3. Click 'Save Page' (any placeholder content is fine)."
  echo "  4. Re-run this script: bash wiki/push-wiki.sh"
  echo ""
  exit 1
fi

echo "[OK] GitHub Wiki repository is initialized and accessible."

# 2. Clone the wiki repository into a temporary directory
TEMP_DIR="$(mktemp -d /tmp/gitlayer-wiki.XXXXXX)"
echo "[2/4] Cloning wiki repository to temporary directory..."
git clone "${WIKI_REMOTE}" "${TEMP_DIR}"

# 3. Copy markdown files to the cloned repo
echo "[3/4] Synchronizing wiki documentation files..."
for file in "${WIKI_DIR}"/*.md; do
  if [ -f "${file}" ]; then
    cp "${file}" "${TEMP_DIR}/"
    echo "  -> Copied $(basename "${file}")"
  fi
done

# 4. Commit and push
echo "[4/4] Pushing changes to GitHub Wiki..."
cd "${TEMP_DIR}"

# Detect default branch (master or main)
CURRENT_BRANCH="$(git branch --show-current 2>/dev/null || echo "master")"
if [ -z "${CURRENT_BRANCH}" ]; then
  CURRENT_BRANCH="master"
fi

git add -A
if git diff --staged --quiet; then
  echo "No changes detected. GitHub Wiki is already up-to-date."
else
  git commit -m "docs: deploy updated GitLayer documentation suite"
  git push origin "${CURRENT_BRANCH}"
  echo ""
  echo "========================================================"
  echo "[SUCCESS] All GitLayer wiki pages are live at:"
  echo "https://github.com/${REPO_OWNER}/${REPO_NAME}/wiki"
  echo "========================================================"
fi

# Cleanup
rm -rf "${TEMP_DIR}"
