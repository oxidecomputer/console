#!/usr/bin/env bash

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, you can obtain one at https://mozilla.org/MPL/2.0/.
#  
# Copyright Oxide Computer Company

# Run this script on a branch to download the E2E failure traces from the
# latest run on that branch. Pass a commit (full hash, not abbreviated)
# to pull the traces for that commit.

set -e
set -o pipefail

DIR="ci-e2e-traces"

COMMIT=$1

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
    gh run download $RUN_ID --dir $DIR
    echo $RUN_ID > $DIR/.run
fi

# gnarly select and re-find is to take filepath noise out of the select list
echo "Choose a trace to view"
select trace in $(find $DIR -name "trace.zip" | sed 's/.*\/\(.*\)\/trace.zip/\1/'); do
    selected_trace=$(find $DIR -path "*/$trace"/trace.zip)
    npx playwright show-trace "$selected_trace"
    exit 0
done
