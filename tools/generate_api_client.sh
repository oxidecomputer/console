#!/bin/bash

set -o errexit # exit if anything fails
set -o pipefail
set -o xtrace

# script assumes omicron and oxide.ts are cloned under the same parent dir as
# console and have run `npm install` inside oxide.ts/generator

OMICRON_SHA=$(awk '/API_VERSION/ {print $2}' .github/workflows/packer.yaml)
GEN_DIR='libs/api/__generated__'

git -C '../omicron' fetch --all
git -C '../omicron' checkout "$OMICRON_SHA"

cp ../omicron/tools/oxapi_demo packer/oxapi_demo

# copy nexus config with some minor modifications...
cat ../omicron/nexus/examples/config.toml |
  sed 's/127.0.0.1:12220/0.0.0.0:8888/' |
  sed 's/127.0.0.1:12221/0.0.0.0:12221/' |
  sed 's/127.0.0.1:32221/0.0.0.0:26257/' > packer/omicron.toml 

# path to spec needs to be absolute
cd ../omicron
SPEC_FILE="$(pwd)/openapi/nexus.json"
cd -

# this will be less horrific when the package is published? or maybe not
npm run --silent --prefix ../oxide.ts/generator gen-from "$SPEC_FILE" > "$GEN_DIR/Api.ts"
yarn fmt --loglevel error "$GEN_DIR"

cat > $GEN_DIR/OMICRON_VERSION <<EOF
# generated file. do not update manually. see docs/update-pinned-api.md
$OMICRON_SHA
EOF
