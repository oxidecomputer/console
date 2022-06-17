#!/bin/bash

set -o errexit
set -o pipefail

if ! command -v gh &> /dev/null; then
  echo "GitHub CLI not found. This script needs it to create a PR. Please install it and try again."
  exit
fi

# only works with console main because those are the only published releases
git checkout main
git pull

CONSOLE_VERSION=$(git rev-parse HEAD)
SHA2=$(curl https://dl.oxide.computer/releases/console/$CONSOLE_VERSION.sha256.txt)

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