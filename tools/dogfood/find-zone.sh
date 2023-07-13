#! /usr/bin/env bash

# Figure out which gimlets have a zone with the given name

set -e
set -o pipefail

if [ -z "$1" ]; then
  echo "Usage: $0 <zone to grep for (e.g., nexus, oximeter)>"
  exit 1
fi

ssh jeeves <<SSH_EOF
  pilot tp login any # enter switch zone
  pilot host exec -c "zoneadm list | grep $1 || true" 0-31
  exit
SSH_EOF
