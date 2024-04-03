#! /usr/bin/env bash
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, you can obtain one at https://mozilla.org/MPL/2.0/.
#  
# Copyright Oxide Computer Company


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
#
# If you want to do more than one, use a loop
#
#    for gimlet in gc8 gc12 gc21; do
#      .scp-assets.sh $gimlet 99173b920969e95d9d025d0038b8ffdb4c46c0ec
#    done

GIMLET="$1"
COMMIT="$2"

# kinda silly but we have to find the zone name, then we use the log file name to infer the nexus dir
LOG_FILE=$(ssh $GIMLET 'NEXUS_ZONE=$(pfexec svcs -H -o ZONE -Z nexus); LOG_FILE=$(pfexec svcs -z $NEXUS_ZONE -L svc:/oxide/nexus:default); echo $LOG_FILE')
NEXUS_DIR="$(echo $LOG_FILE | sed 's/\/svc\/log.*//')/nexus"

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
