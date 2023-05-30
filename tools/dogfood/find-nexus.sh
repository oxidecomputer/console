#! /usr/bin/env bash

set -e
set -o pipefail

ssh jeeves <<SSH_EOF
  pilot tp login any # enter switch zone
  pilot host exec -c "zoneadm list | grep oxz_nexus || true" 0-31
  exit
SSH_EOF
