#!/bin/bash

set -o errexit # exit if anything fails
set -o pipefail
set -o xtrace

API_VERSION=$(awk '/API_VERSION/ {print $2}' .github/workflows/packer.yaml)
GEN_DIR='libs/api/__generated__'
SPEC_FILE='app/docs/nexus-openapi.json'
CODEMOD_DIR="codemods"

# assumes omicron is in the same dir as as the console repo 
git -C '../omicron' fetch --all
git -C '../omicron' checkout "$API_VERSION"

cp ../omicron/openapi/nexus.json $SPEC_FILE
cp ../omicron/tools/oxapi_demo packer/oxapi_demo

rm -rf "$GEN_DIR/apis" "$GEN_DIR/models"

# prereq: brew install openapi-generator
openapi-generator generate -i $SPEC_FILE \
  -o $GEN_DIR \
  -g typescript-fetch \
  -p typescriptThreePlus=true

for file in $CODEMOD_DIR/*.api.js; do
    yarn jscodeshift -t $file --extensions=ts,tsx --parser=tsx './libs/api'
done

yarn fmt --loglevel error

cat > $GEN_DIR/OMICRON_VERSION <<EOF
# generated file. do not update manually. see docs/update-pinned-api.md
$API_VERSION
EOF
