#!/bin/bash

set -o errexit # exit if anything fails
set -o pipefail
set -o xtrace

# assumes omicron is in the same dir as as the console repo 
# and it has been built with `cargo build`
API_VERSION=$(awk '/API_VERSION/ {print $2}' .github/workflows/packer.yaml)
GEN_DIR='libs/api/__generated__'
DOCS_DIR='app/docs'
CODEMOD_DIR="codemods"

cd ../omicron
git fetch --all
git checkout "$API_VERSION"

cp openapi/nexus.json ../console/$DOCS_DIR/nexus-openapi.json

cd ../console
rm -rf "$GEN_DIR/apis"
rm -rf "$GEN_DIR/models"

# prereq: brew install openapi-generator
openapi-generator generate -i $DOCS_DIR/nexus-openapi.json \
  -o $GEN_DIR \
  -g typescript-fetch \
  -p typescriptThreePlus=true

for file in $CODEMOD_DIR/*.api.js; do
    npx jscodeshift -t $file --extensions=ts,tsx --parser=tsx './libs/api'
done

yarn fmt --loglevel error

cat > $GEN_DIR/OMICRON_VERSION <<EOF
# generated file. do not update manually. see docs/update-pinned-api.md
$API_VERSION
EOF
