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
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

print_usage() {
  echo "Usage: $0 [--ui] [--update]"
  echo ""
  echo "Compare current visual state against baseline snapshots."
  echo "Runs test/visual/regression.e2e.ts"
  echo ""
  echo "Options:"
  echo "  --ui       Open Playwright UI mode"
  echo "  --update   Update baseline snapshots"
  echo ""
  echo "Examples:"
  echo "  $0         Compare against baseline"
  echo "  $0 --ui    Inspect differences in UI mode"
}

# Parse arguments
UI_MODE=false
UPDATE_MODE=false

for arg in "$@"; do
  case $arg in
    --ui)
      UI_MODE=true
      ;;
    --update)
      UPDATE_MODE=true
      ;;
    -h|--help)
      print_usage
      exit 0
      ;;
    *)
      echo -e "${RED}Error: Unknown option '$arg'${NC}"
      print_usage
      exit 1
      ;;
  esac
done

cd "$PROJECT_ROOT"

# Install dependencies if needed
if [[ ! -d "node_modules" ]]; then
  echo "Installing dependencies..."
  npm ci
  echo ""
fi

# Check if baseline snapshots exist
SNAPSHOT_COUNT=$(find test/visual -type f -name "*.png" 2>/dev/null | wc -l | tr -d ' ')
if [[ "$SNAPSHOT_COUNT" -eq 0 ]]; then
  echo -e "${RED}Error: No baseline snapshots found${NC}"
  echo ""
  echo "Generate baseline first:"
  echo "  npm run visual:baseline -- --main"
  exit 1
fi

echo -e "${BLUE}Found $SNAPSHOT_COUNT baseline snapshot(s)${NC}"

# Build command
CMD="npx playwright test --config=playwright.visual.config.ts"

if [[ "$UI_MODE" == true ]]; then
  CMD="$CMD --ui"
fi

if [[ "$UPDATE_MODE" == true ]]; then
  echo -e "${YELLOW}Updating baseline snapshots...${NC}"
  CMD="$CMD --update-snapshots"
fi

echo "Running visual regression tests..."
echo ""

# Run tests
set +e
$CMD
EXIT_CODE=$?
set -e

echo ""
if [[ $EXIT_CODE -eq 0 ]]; then
  echo -e "${GREEN}✓ All visual tests passed${NC}"
else
  if [[ "$UI_MODE" == false ]]; then
    echo -e "${RED}✗ Visual differences detected${NC}"
    echo ""
    echo "To inspect differences:"
    echo "  npm run visual:compare -- --ui"
  fi
fi

exit $EXIT_CODE
