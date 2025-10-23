#!/bin/bash
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, you can obtain one at https://mozilla.org/MPL/2.0/.
#
# Copyright Oxide Computer Company

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

REV=${1:-main}

COMMIT=$(git rev-parse "$REV")
WORKTREE_DIR=$(mktemp -d -t visual-baseline-XXXXXX)

cleanup() {
  git worktree remove "$WORKTREE_DIR" --force 2>/dev/null || true
  rm -rf "$WORKTREE_DIR"
}
trap cleanup EXIT INT TERM

echo "Creating worktree at $REV ($COMMIT)..."
git worktree add --detach "$WORKTREE_DIR" "$COMMIT" --quiet

echo "Copying test files..."
mkdir -p "$WORKTREE_DIR/test/visual"
cp test/visual/regression.e2e.ts "$WORKTREE_DIR/test/visual/"
cp playwright.visual.config.ts "$WORKTREE_DIR/"

cd "$WORKTREE_DIR"
echo "Installing dependencies..."
npm ci

echo "Generating baseline snapshots..."
npx playwright test --config=playwright.visual.config.ts --update-snapshots

echo "Copying snapshots back..."
cp -r test/visual/regression.e2e.ts-snapshots "$PROJECT_ROOT/test/visual/"

COUNT=$(find "$PROJECT_ROOT/test/visual" -name "*.png" | wc -l | tr -d ' ')
echo "✓ Generated $COUNT baseline snapshot(s)"
