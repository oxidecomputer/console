#!/bin/bash

# Requirements/assumptions:
#
# - GitHub CLI
# - Omicron is a sibling dir to console

set -o errexit
set -o pipefail

if ! command -v gh &> /dev/null; then
  echo "Error: GitHub CLI not found. This script needs it to create a PR. Please install it and try again."
  exit
fi

if [ ! -d "../omicron" ]; then
  echo "Error: This script assumes omicron shares a parent directory with console."
  exit
fi

# note that this will fail unless the current console commit has a release on
# dl.oxide.computer, i.e., it is a commit on main that has been pushed to GH.
CONSOLE_VERSION=$(git rev-parse HEAD)
SHA2=$(curl --fail-with-body https://dl.oxide.computer/releases/console/$CONSOLE_VERSION.sha256.txt)

cd ../omicron
git checkout main
git pull
git checkout -b bump-console

cat <<EOF > tools/console_version
COMMIT="$CONSOLE_VERSION"
SHA2="$SHA2"
EOF

git add --all
git commit -m "Bump console to latest main"
gh pr create --fill --web