#!/bin/bash
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, you can obtain one at https://mozilla.org/MPL/2.0/.
#  
# Copyright Oxide Computer Company

set -o errexit # exit if anything fails
set -o pipefail
set -o xtrace

OMICRON_SHA=$(head -n 1 OMICRON_VERSION)
GEN_DIR="$PWD/app/api/__generated__"

SPEC_BASE="https://raw.githubusercontent.com/oxidecomputer/omicron/$OMICRON_SHA/openapi/nexus"

HEADER=$(cat <<'EOF'
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

EOF)

LATEST_SPEC=$(curl "$SPEC_BASE/nexus-latest.json")

# use versions of these packages specified in dev deps
npm run openapi-gen-ts -- "$SPEC_BASE/$LATEST_SPEC" $GEN_DIR --features msw

for f in Api.ts msw-handlers.ts validate.ts; do
  (printf '%s\n\n' "$HEADER"; cat "$GEN_DIR/$f") > "$GEN_DIR/$f.tmp"
  mv "$GEN_DIR/$f.tmp" "$GEN_DIR/$f"
done

npm run prettier -- --write --log-level error "$GEN_DIR"

cat > $GEN_DIR/OMICRON_VERSION <<EOF
# generated file. do not update manually. see docs/update-pinned-api.md
$OMICRON_SHA
EOF
