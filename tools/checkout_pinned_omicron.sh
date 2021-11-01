#!/bin/bash
set -e
set -o pipefail

function get_api_version() {
  local version
  IFS=':'
  read -ra version <<< "$(grep API_VERSION .github/workflows/packer.yaml)"
  echo "${version[1]}" | xargs
  IFS=' '
}

VERSION="$(get_api_version)"
cd ../omicron

if ! git diff --quiet
then
  echo "Omicron repo not clean. Stash any changes and return it to a clean state."
  exit 1
fi

git checkout $VERSION
