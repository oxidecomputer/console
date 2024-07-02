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
# 1. SCP tarball to gimlet
# 2. Over SSH:
#    a. Extract tarball to tmp dir next to static dir
#    b. Delete tarball
#    c. Rename tmp dir to static dir
#
# Usage:
#
# The primary intended usage is to use tools/deno/deploy-dogfood.ts, which first
# uses find-zone.sh to find the nexus gimlets and then downloads the tarball
# and calls this script on each one. To use this script directly, do what that
# script does.


STATIC_DIR="static"
TMP_DIR="static-tmp"

GIMLET="$1"
TARBALL_FILE="$2"

# kinda silly but we have to find the zone name, then we use the log file name to infer the nexus dir
LOG_FILE=$(ssh $GIMLET 'NEXUS_ZONE=$(pfexec svcs -H -o ZONE -Z nexus); LOG_FILE=$(pfexec svcs -z $NEXUS_ZONE -L svc:/oxide/nexus:default); echo $LOG_FILE')
NEXUS_DIR="$(echo $LOG_FILE | sed 's/\/svc\/log.*//')/nexus"

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
