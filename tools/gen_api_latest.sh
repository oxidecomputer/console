#!/usr/bin/env bash
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, you can obtain one at https://mozilla.org/MPL/2.0/.
#
# Copyright Oxide Computer Company

# Like `npm run gen-api`, but first pins OMICRON_VERSION to the latest omicron
# main commit (or the commit at an optional ref passed as the first argument).
# See docs/update-pinned-api.md.

set -o errexit
set -o pipefail

REF="${1:-main}"

OLD_SHA=$(head -n 1 OMICRON_VERSION)
NEW_SHA=$(curl --fail --silent --show-error \
  "https://api.github.com/repos/oxidecomputer/omicron/commits/$REF" | jq -r '.sha')

if [[ ! "$NEW_SHA" =~ ^[0-9a-f]{40}$ ]]; then
  echo "Could not resolve omicron ref '$REF' to a commit hash" >&2
  exit 1
fi

if [[ "$NEW_SHA" == "$OLD_SHA" ]]; then
  echo "OMICRON_VERSION already at $NEW_SHA"
else
  echo "Updating OMICRON_VERSION: $OLD_SHA -> $NEW_SHA"
  echo "$NEW_SHA" > OMICRON_VERSION
fi

npm run gen-api
