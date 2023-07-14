#! /usr/bin/env bash

set -e
set -o pipefail

# What this does:
#
# 1. Download console tarball (restricts this to use on commits pushed to console main)
# 2. SCP tarball to gimlet
# 3. Over SSH:
#    a. Extract tarball to tmp dir next to static dir
#    b. Delete tarball
#    c. Rename tmp dir to static dir
#
# Usage:
#
# First use `find-zone.sh nexus` to find the gimlets running nexus, then run this
#
#   ./scp-assets.sh gc21 1234567890abcdef1234567890abcdef12345678

GIMLET="$1"
COMMIT="$2"

NEXUS_DIR="/zone/oxz_nexus/root/var/nexus"
STATIC_DIR="static"
TMP_DIR="static-tmp"
TARBALL_URL="https://dl.oxide.computer/releases/console/$COMMIT.tar.gz"
TARBALL_FILE="/tmp/console.tar.gz"

echo 'downloading console tarball...'
curl --silent --show-error --fail --location --output $TARBALL_FILE $TARBALL_URL
echo 'done. now scping it to the gimlet...'

scp -r $TARBALL_FILE "$GIMLET:$NEXUS_DIR/"

ssh $GIMLET <<SSH_EOF
  cd $NEXUS_DIR
  mkdir -p $TMP_DIR
  tar xzf console.tar.gz -C $TMP_DIR
  rm console.tar.gz
  rm -rf static
  mv static-tmp static
  exit
SSH_EOF
