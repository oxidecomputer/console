#!/bin/bash
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, you can obtain one at https://mozilla.org/MPL/2.0/.
#  
# Copyright Oxide Computer Company

set -o errexit # exit if anything fails
set -o pipefail
set -o xtrace

# script assumes oxide.ts is cloned under the same parent dir as console and
# you've run `npm install` over there

OMICRON_SHA=$(head -n 1 OMICRON_VERSION)
GEN_DIR="$PWD/app/api/__generated__"

SPEC_URL="https://raw.githubusercontent.com/oxidecomputer/omicron/$OMICRON_SHA/openapi/nexus.json"

npx tsx ../oxide.ts/generator/index.ts $SPEC_URL $GEN_DIR
npx prettier --write --log-level error "$GEN_DIR"

# hack until we start pulling this from npm. we don't want this file
rm "$GEN_DIR/type-test.ts"

cat > $GEN_DIR/OMICRON_VERSION <<EOF
# generated file. do not update manually. see docs/update-pinned-api.md
$OMICRON_SHA
EOF
