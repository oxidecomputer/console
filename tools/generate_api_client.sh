#!/bin/bash

set -e # exit if anything fails

# assumes omicron is in the same dir as as the console repo 
# and it has been built with `cargo build`
API_VERSION=$(awk '/API_VERSION/ {print $2}' .github/workflows/packer.yaml)
GEN_DIR='libs/api/__generated__'

cd ../omicron
git fetch --all
git checkout "$API_VERSION"
cd ../console

../omicron/target/debug/nexus ../omicron/omicron-nexus/examples/config.toml --openapi \
  > $GEN_DIR/nexus-openapi.json

# prereq: brew install openapi-generator

openapi-generator generate -i $GEN_DIR/nexus-openapi.json \
  -o $GEN_DIR \
  -g typescript-fetch \
  --additional-properties=typescriptThreePlus=true
yarn fmt > /dev/null 2>&1

cat > $GEN_DIR/OMICRON_VERSION <<EOF
# generated file. do not update manually. see docs/update-pinned-api.md
$API_VERSION
EOF