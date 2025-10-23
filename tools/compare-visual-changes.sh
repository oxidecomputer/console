#!/bin/bash
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, you can obtain one at https://mozilla.org/MPL/2.0/.
#
# Copyright Oxide Computer Company

set -euo pipefail

if [[ ! -d test/visual/regression.e2e.ts-snapshots ]]; then
  echo "Error: No baseline snapshots found"
  echo "Generate baseline first: npm run visual:baseline"
  exit 1
fi

npx playwright test --config=playwright.visual.config.ts "$@"
