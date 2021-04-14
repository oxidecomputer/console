#!/bin/bash

set -e # exit if anything fails

# assumes omicron is in the same dir as as the console repo 
# and it has been built with `cargo build`
API_VERSION=$(awk '/API_VERSION/ {print $2}' .github/workflows/packer.yaml)

cd ../omicron
git fetch --all
git checkout "$API_VERSION"
cd ../console

../omicron/target/debug/nexus ../omicron/examples/config.toml --openapi > omicron.json

# prereq: brew install openapi-generator

# couldn't get it to pipe directly with /dev/stdin. it really wants a filename
openapi-generator generate -i omicron.json -o libs/api/__generated__ -g typescript-fetch \
  --additional-properties=typescriptThreePlus=true
rm omicron.json
yarn format > /dev/null 2>&1

cat > libs/api/__generated__/OMICRON_VERSION <<EOF
# generated file. do not update manually. see docs/update-pinned-api.md
$API_VERSION
EOF