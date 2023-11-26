#! /usr/bin/env bash

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, you can obtain one at https://mozilla.org/MPL/2.0/.
#
# Copyright Oxide Computer Company

function genForCommit() {
  COMMIT=$1
  TMP_DIR="/tmp/api-diff/$COMMIT"
  rm -rf $TMP_DIR
  mkdir -p $TMP_DIR
  npm run --silent --prefix ../oxide.ts gen-from $COMMIT $TMP_DIR
  npx prettier --write --log-level error $TMP_DIR
}

if ! command -v gh &> /dev/null; then
  echo "Error: gh is not installed." >&2
  exit 1
fi

PR_NUM=$(
  gh pr list -R oxidecomputer/omicron --limit 100 --json number,title,updatedAt,author \
    --template '{{range .}}{{tablerow .number .title .author.name (timeago .updatedAt)}}{{end}}' |
   fzf --height 25% --reverse |
   cut -f1 -d ' '
)

if ! [[ "$PR_NUM" =~ ^[0-9]+$ ]]; then
  echo "Error picking PR. Expected number, got $PR_NUM" >&2
  exit 1
fi

PR_JSON=$(gh api graphql -f query="{ 
  repository(owner: \"oxidecomputer\", name: \"omicron\") { 
    pullRequest(number: $PR_NUM) { 
      baseRefOid
      headRefOid
    }
  }
}" | jq -r '.data.repository.pullRequest')

BASE=$(echo $PR_JSON | jq -r '.baseRefOid')
genForCommit $BASE

HEAD=$(echo $PR_JSON | jq -r '.headRefOid')
genForCommit $HEAD

# git difftool is a trick to diff with whatever you have git set to use
git --no-pager difftool "/tmp/api-diff/$BASE/Api.ts" "/tmp/api-diff/$HEAD/Api.ts" || true
