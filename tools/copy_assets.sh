#!/bin/bash

set -o errexit # exit if anything fails
set -o pipefail
set -o xtrace

API_URL=http://127.0.0.1:12220 yarn build
rm -rf ~/oxide/omicron/nexus/assets
cp -R dist/assets ~/oxide/omicron/nexus/assets
cp dist/index.html ~/oxide/omicron/nexus/assets