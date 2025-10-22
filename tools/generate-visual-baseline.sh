#!/bin/bash
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, you can obtain one at https://mozilla.org/MPL/2.0/.
#
# Copyright Oxide Computer Company

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

print_usage() {
  echo "Usage: $0"
  echo ""
  echo "Generate baseline visual snapshots from origin/main for comparison."
  echo "Automatically cherry-picks test/visual/regression.e2e.ts to main."
  echo ""
  echo "Example:"
  echo "  $0"
}

if [[ "$1" == "-h" ]]; then
  print_usage
  exit 0
fi

cd "$PROJECT_ROOT"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo -e "${RED}Error: Not in a git repository${NC}"
  exit 1
fi

# Fetch latest main
echo "Fetching latest from origin..."
git fetch origin main --quiet

RESOLVED_COMMIT=$(git rev-parse origin/main)
echo -e "${GREEN}Generating baseline from origin/main: $RESOLVED_COMMIT${NC}"

# Store current branch for restoration
CURRENT_REF=$(git symbolic-ref -q HEAD || git rev-parse HEAD)

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
  echo -e "${YELLOW}Warning: You have uncommitted changes. They will be preserved.${NC}"
  read -p "Continue? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
  fi
fi

# Stash changes
echo "Stashing current changes..."
git stash push -u -m "visual-baseline-temp-stash-$(date +%s)" > /dev/null || true

# Checkout main
echo "Checking out origin/main..."
git checkout -q "$RESOLVED_COMMIT"

# Cherry-pick visual regression test
TEST_FILE="test/visual/regression.e2e.ts"
CONFIG_FILE="playwright.visual.config.ts"
if git show "$CURRENT_REF:$TEST_FILE" > /dev/null 2>&1; then
  echo "Cherry-picking visual regression test..."
  git checkout "$CURRENT_REF" -- "$TEST_FILE" 2>/dev/null || true
  if git show "$CURRENT_REF:$CONFIG_FILE" > /dev/null 2>&1; then
    git checkout "$CURRENT_REF" -- "$CONFIG_FILE" 2>/dev/null || true
  else
    echo -e "${RED}Error: $CONFIG_FILE not found in current branch${NC}"
    exit 1
  fi
else
  echo -e "${RED}Error: $TEST_FILE not found in current branch${NC}"
  exit 1
fi

# Cleanup function
cleanup() {
  local exit_code=$?
  echo ""
  echo "Restoring repository state..."

  # Checkout original branch
  if [[ "$CURRENT_REF" == refs/heads/* ]]; then
    BRANCH_NAME="${CURRENT_REF#refs/heads/}"
    git checkout -q "$BRANCH_NAME"
  else
    git checkout -q "$CURRENT_REF"
  fi

  # Reinstall dependencies
  echo "Reinstalling dependencies..."
  rm -rf node_modules
  npm ci > /dev/null 2>&1 || echo -e "${YELLOW}Warning: Failed to reinstall dependencies${NC}"

  # Restore stashed changes
  STASH_NAME=$(git stash list | grep "visual-baseline-temp-stash" | head -1 | cut -d: -f1 || echo "")
  if [[ -n "$STASH_NAME" ]]; then
    echo "Restoring stashed changes..."
    git stash pop "$STASH_NAME" > /dev/null 2>&1 || true
  fi

  if [[ $exit_code -eq 0 ]]; then
    SNAPSHOT_COUNT=$(find test/visual -type f -name "*.png" 2>/dev/null | wc -l | tr -d ' ')
    echo ""
    echo -e "${GREEN}✓ Generated $SNAPSHOT_COUNT baseline snapshot(s)${NC}"
  else
    echo ""
    echo -e "${RED}✗ Baseline generation failed${NC}"
  fi

  exit $exit_code
}

trap cleanup EXIT INT TERM

# Install dependencies
echo "Installing dependencies..."
rm -rf node_modules
npm ci

# Generate snapshots
echo ""
echo "Generating baseline snapshots (this may take several minutes)..."
npx playwright test --config="$CONFIG_FILE" --project=chrome --update-snapshots
