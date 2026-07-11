#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

REPO_NAME="megafon-cpo-architecture-canvas"
GITHUB_USER="bbenicore-web"

if ! command -v gh >/dev/null 2>&1; then
	echo "GitHub CLI (gh) не установлен."
	echo "Установите: https://cli.github.com"
	exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
	echo "Войдите в GitHub CLI:"
	gh auth login --git-protocol ssh --hostname github.com
fi

if git remote get-url origin >/dev/null 2>&1; then
	git remote set-url origin "git@github.com:${GITHUB_USER}/${REPO_NAME}.git"
else
	git remote add origin "git@github.com:${GITHUB_USER}/${REPO_NAME}.git"
fi

gh repo create "${GITHUB_USER}/${REPO_NAME}" \
	--public \
	--source=. \
	--remote=origin \
	--push \
	--description "Interactive MegaFon CPO architecture Cursor Canvas"

echo
echo "Готово: https://github.com/${GITHUB_USER}/${REPO_NAME}"
