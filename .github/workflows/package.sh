#!/usr/bin/env bash
set -euxo pipefail

npm run build
# Gzip individual files (keep originals)
ls build/client/assets/*.{js,css,map} | xargs gzip --keep
# add console_version file
echo "${SHA}" > build/client/VERSION
# add API_VERSION file
cp app/api/__generated__/API_VERSION build/client/API_VERSION

mkdir -p releases/console
# Make <sha>.tar.gz
tar czf releases/console/"${SHA}".tar.gz --directory=build/client .
# Write sha256sum to file
sha256sum releases/console/"${SHA}".tar.gz | awk '{print $1}' > releases/console/"${SHA}".sha256.txt
