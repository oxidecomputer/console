#!/bin/bash
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, you can obtain one at https://mozilla.org/MPL/2.0/.
#  
# Copyright Oxide Computer Company

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
