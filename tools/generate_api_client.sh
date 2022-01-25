#!/bin/bash

set -o errexit # exit if anything fails
set -o pipefail
set -o xtrace

API_VERSION=$(awk '/API_VERSION/ {print $2}' .github/workflows/packer.yaml)
GEN_DIR='libs/api/__generated__'

# assumes omicron is in the same dir as as the console repo 
git -C '../omicron' fetch --all
git -C '../omicron' checkout "$API_VERSION"

cp ../omicron/tools/oxapi_demo packer/oxapi_demo

# copy nexus config with some minor modifications...
cat ../omicron/nexus/examples/config.toml |
  sed 's/127.0.0.1:12220/0.0.0.0:8888/' |
  sed 's/127.0.0.1:12221/0.0.0.0:12221/' |
  sed 's/127.0.0.1:32221/0.0.0.0:26257/' > packer/omicron.toml 

yarn swagger-typescript-api -p ../omicron/openapi/nexus.json -o $GEN_DIR --union-enums --extract-request-params

sed -i '' 's/organizationName/orgName/g' "$GEN_DIR/Api.ts"
yarn fmt --loglevel error "$GEN_DIR"

cat > $GEN_DIR/OMICRON_VERSION <<EOF
# generated file. do not update manually. see docs/update-pinned-api.md
$API_VERSION
EOF
