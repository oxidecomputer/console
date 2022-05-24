#!/bin/bash

set -o errexit # exit if anything fails
set -o pipefail
set -o xtrace

# script assumes omicron and oxide.ts are cloned under the same parent dir as
# console and have run `npm install` inside oxide.ts/generator

OMICRON_SHA=$(head -n 1 OMICRON_VERSION)
GEN_DIR='libs/api/__generated__'

# this will be less horrific when the package is published? or maybe not
npm run --silent --prefix ../oxide.ts/generator gen-from $OMICRON_SHA > "$GEN_DIR/Api.ts"
yarn prettier --write --loglevel error "$GEN_DIR"

cat > $GEN_DIR/OMICRON_VERSION <<EOF
# generated file. do not update manually. see docs/update-pinned-api.md
$OMICRON_SHA
EOF
