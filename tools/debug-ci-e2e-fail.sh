#!/bin/bash
set -e
set -o pipefail

# Get the ID of the last github actions run if there was one
RUN_ID=$(gh run list -b $(git rev-parse --abbrev-ref HEAD) -L 1 --json databaseId --jq .[0].databaseId)

if [ -z "$RUN_ID" ]; then
  echo "No action runs found for this branch"
  exit 0
fi

if [ -d "test-results" ] && [ -f "test-results/.run" ] && [ "$RUN_ID" == "$(cat test-results/.run)" ]; then
    : # Do nothing, the test results are already up to date
else
    rm -rf test-results
    echo "Attempting to download test failure traces for current branch..."
    gh run download $RUN_ID
    echo $RUN_ID > test-results/.run
fi


echo "Choose a test trace to view"
select test in $(ls test-results); do
    npx playwright show-trace test-results/$test/trace.zip
    exit 0
done