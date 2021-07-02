#!/bin/bash

set -e # exit if anything fails

# assumes omicron is in the same dir as as the console repo 
# and it has been built with `cargo build`
API_VERSION=$(awk '/API_VERSION/ {print $2}' .github/workflows/packer.yaml)
GEN_DIR='libs/api/__generated__'
DOCS_DIR='apps/web-console/docs'

cd ../omicron
git fetch --all
git checkout "$API_VERSION"

cargo run --bin=nexus -- omicron-nexus/examples/config.toml --openapi \
  > ../console/$DOCS_DIR/nexus-openapi.json

cd ../console

# prereq: brew install openapi-generator
openapi-generator generate -i $DOCS_DIR/nexus-openapi.json \
  -o $GEN_DIR \
  -g typescript-fetch \
  --additional-properties=typescriptThreePlus=true
yarn fmt > /dev/null 2>&1

cat > $GEN_DIR/OMICRON_VERSION <<EOF
# generated file. do not update manually. see docs/update-pinned-api.md
$API_VERSION
EOF