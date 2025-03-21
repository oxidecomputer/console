#!/usr/bin/env bash

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, you can obtain one at https://mozilla.org/MPL/2.0/.
#
# Copyright Oxide Computer Company

# Run this script on a branch to download the E2E failure traces from the
# latest run on that branch. Pass a commit (full hash, not abbreviated)
# to pull the traces for that commit
#
# Dependencies: fzf https://github.com/junegunn/fzf (brew install fzf)

set -e
set -o pipefail

DIR="ci-e2e-traces"
COMMIT=$(git rev-parse "$1")

# Get the ID of the last github actions run if there was one. If a commit
# is specified, use that, otherwise
if [ -n "$COMMIT" ]; then
  echo -e "Looking at latest run on commit $COMMIT"
  RUN_ID=$(gh run list --commit "$COMMIT" -w CI -L 1 --json databaseId --jq '.[0].databaseId')
  if [ -z "$RUN_ID" ]; then
    echo "No action runs found. Make sure to use full commit SHA."
    exit 0
  fi
else
  BRANCH=$(git rev-parse --abbrev-ref HEAD)
  echo -e "Looking at latest run on branch $BRANCH"
  RUN_ID=$(gh run list -b "$BRANCH" -w CI -L 1 --json databaseId --jq '.[0].databaseId')
  if [ -z "$RUN_ID" ]; then
    echo "No action runs found"
    exit 0
  fi
fi

if [ -e "$DIR/.run" ] && [ "$RUN_ID" == "$(cat $DIR/.run)" ]; then
  : # Do nothing, the test results are already up to date
else
  rm -rf $DIR
  echo "Downloading traces..."
  gh run download "$RUN_ID" --dir $DIR
  echo "$RUN_ID" >$DIR/.run
fi

echo "Choose a trace to view"

# ridiculous because bash is ridiculou, but column layout with filename split
# from rest helps a lot visually
filename=$(find $DIR -name "trace.zip" |
  sed 's/.*\/\(.*\)\/trace.zip/\1/' | # take noise out of picker
  awk -F ".e2e.ts-" '{printf "%-30s %s\n", $1".e2e.ts", "-"$2}' |
  column -t | # align in columns
  fzf --height 25% --reverse |
  gsed 's/ //g') # rejoin the halves
if [ -z "$filename" ]; then exit 0; fi

echo "Loading: $filename"

full_path=$(find $DIR -path "*/$filename"/trace.zip)
npx playwright show-trace "$full_path"
exit 0
