#!/bin/bash
set -e
set -o pipefail

VERSION="$(cat OMICRON_VERSION)"
cd ../omicron

if ! git diff --quiet
then
  echo "Omicron repo not clean. Stash any changes and return it to a clean state."
  exit 1
fi

git checkout $VERSION
