#!/bin/bash

set -o errexit # exit if anything fails
set -o pipefail
set -o xtrace

# script assumes omicron and oxide.ts are cloned under the same parent dir as
# console and have run `npm install` inside oxide.ts/generator

OMICRON_SHA=$(cat OMICRON_VERSION)
GEN_DIR='libs/api/__generated__'

git -C '../omicron' fetch --all
git -C '../omicron' checkout "$OMICRON_SHA"

# path to spec needs to be absolute
cd ../omicron
SPEC_FILE="$(pwd)/openapi/nexus.json"
cd -

# this will be less horrific when the package is published? or maybe not
npm run --silent --prefix ../oxide.ts/generator gen-from "$SPEC_FILE" > "$GEN_DIR/Api.ts"
yarn prettier --write --loglevel error "$GEN_DIR"

cat > $GEN_DIR/OMICRON_VERSION <<EOF
# generated file. do not update manually. see docs/update-pinned-api.md
$OMICRON_SHA
EOF
