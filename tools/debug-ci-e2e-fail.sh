#!/usr/bin/env bash

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, you can obtain one at https://mozilla.org/MPL/2.0/.
#  
# Copyright Oxide Computer Company

set -e
set -o pipefail

DIR="ci-e2e-traces"

# Get the ID of the last github actions run if there was one
BRANCH=$(git rev-parse --abbrev-ref HEAD)
RUN_ID=$(gh run list -b "$BRANCH" -w CI -L 1 --json databaseId --jq '.[0].databaseId')

if [ -z "$RUN_ID" ]; then
  echo "No action runs found for this branch"
  exit 0
fi

if [ -e "$DIR/.run" ] && [ "$RUN_ID" == "$(cat $DIR/.run)" ]; then
    : # Do nothing, the test results are already up to date
else
    rm -rf $DIR
    echo "Attempting to download test failure traces for current branch..."
    gh run download $RUN_ID --dir $DIR
    echo $RUN_ID > $DIR/.run
fi


echo "Choose a test trace to view"
select trace in $(find $DIR -name "trace.zip"); do
    npx playwright show-trace $trace
    exit 0
done
