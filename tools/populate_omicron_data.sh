#!/bin/bash
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, you can obtain one at https://mozilla.org/MPL/2.0/.
#  
# Copyright Oxide Computer Company


set -o errexit
set -o pipefail
set -o xtrace

# generally you don't want to run this manually. it's meant to be used by
# start_api.sh. if you do run it manually, note that it's meant to be run
# from inside the omicron repo and it assumes nexus and sled agent are running

# The CLI manual is here: https://docs.oxide.computer/cli

oxide ip-pool range add --pool default \
  --first "172.20.15.227" \
  --last "172.20.15.239"

GiB=1073741824

# Create projects

oxide project create --name prod-online \
  --description "The production online project."
oxide project create --name release-infrastructure \
  --description "The release infrastructure project."
oxide project create --name rendering \
  --description "The rendering project."
oxide project create --name test-infrastructure \
  --description "The test infrastructure project."

oxide api '/v1/images?project=prod-online' --method POST --input - <<EOF
  {
    "name": "alpine",
    "description": "boot from propolis zone blob!",
    "block_size": 512,
    "os": "alpine",
    "version": "1.0.0",
    "source": {
      "type": "you_can_boot_anything_as_long_as_its_alpine"
    }
  }
EOF

# Create instances in project prod-online

oxide instance create --name db1 \
  --description "The first production database instance." \
  --project prod-online \
  --hostname "db1.maze-war.com" \
  --ncpus 1 \
  --memory $GiB
oxide instance create --name db2 \
  --description "The second production database instance." \
  --project prod-online \
  --hostname "db2.maze-war.com" \
  --ncpus 1 \
  --memory $GiB

# Create disks in prod-online

# TODO: disk create doesn't work because of source arg

# oxide disk create --name nginx \
#   --description "The nginx disk." \
#   --project prod-online \
#   --size $GiB \
#   --disk-source blank=512
# oxide disk create --name grafana \
#   --description "The grafana disk." \
#   --project prod-online \
#   --size $GiB \
#   --disk-source blank=512
# oxide disk create --name grafana-state \
#   --description "The grafana state disk." \
#   --project prod-online \
#   --size $GiB \
#   --disk-source blank=512
# oxide disk create --name vault \
#   --description "The vault disk." \
#   --project prod-online \
#   --size $GiB \
#   --disk-source blank=512

# Stop instance so we can attach disks to it
oxide instance stop --instance db1 --project prod-online

# Attach disks to instance db1

# oxide instance disk attach --project prod-online --instance db1 --disk nginx
# oxide instance disk attach --project prod-online --instance db1 --disk grafana
# oxide instance disk attach --project prod-online --instance db1 --disk grafana-state
# oxide instance disk attach --project prod-online --instance db1 --disk vault

oxide instance start --instance db1 --project prod-online

# Create some disks in prod-online to leave unattached

# TODO: disk create doesn't work because of source arg

# oxide disk create --name vol1 \
#   --description "The vol1 disk." \
#   --project prod-online \
#   --size $GiB \
#   --disk-source blank=512
# oxide disk create --name vol2 \
#   --description "The vol2 disk." \
#   --project prod-online \
#   --size $GiB \
#   --disk-source blank=512

# Create VPCs in prod-online

oxide vpc create --name vpc1 \
  --description "The vpc1 VPC." \
  --project prod-online \
  --dns-name vpc1
oxide vpc create --name vpc2 \
  --description "The vpc2 VPC." \
  --project prod-online \
  --dns-name vpc2

echo -e "\n==== API DATA POPULATED ====\n"
