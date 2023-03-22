#!/bin/bash

set -o errexit
set -o pipefail
set -o xtrace

# generally you don't want to run this manually. it's meant to be used by
# start_api.sh. if you do run it manually, note that it's meant to be run
# from inside the omicron repo and it assumes nexus and sled agent are running

# The CLI manual is here: https://docs.oxide.computer/cli/manual

./tools/populate/populate-alpine.sh

oxide api /system/ip-pools/default/ranges/add --method POST --input - <<EOF
{
  "first": "172.20.15.227",
  "last": "172.20.15.239"
}
EOF

GiB=1073741824

# Create projects

oxide project create prod-online \
  -D "The production online project."
oxide project create release-infrastructure \
  -D "The release infrastructure project."
oxide project create rendering \
  -D "The rendering project."
oxide project create test-infrastructure \
  -D "The test infrastructure project."

# Create instances in project prod-online

oxide instance create db1 \
  -D "The first production database instance." \
  -p prod-online \
  --hostname "db1.maze-war.com" \
  --ncpus 1 \
  --memory $GiB
oxide instance create db2 \
  -D "The second production database instance." \
  -p prod-online \
  --hostname "db2.maze-war.com" \
  --ncpus 1 \
  --memory $GiB

# Create disks in prod-online

oxide disk create nginx \
  -D "The nginx disk." \
  -p prod-online \
  --size $GiB \
  --disk-source blank=512
oxide disk create grafana \
  -D "The grafana disk." \
  -p prod-online \
  --size $GiB \
  --disk-source blank=512
oxide disk create grafana-state \
  -D "The grafana state disk." \
  -p prod-online \
  --size $GiB \
  --disk-source blank=512
oxide disk create vault \
  -D "The vault disk." \
  -p prod-online \
  --size $GiB \
  --disk-source blank=512

# Stop instance so we can attach disks to it
oxide instance stop db1 -p prod-online --confirm

# Attach disks to instance db1
oxide disk attach nginx db1 -p prod-online
oxide disk attach grafana db1 -p prod-online
oxide disk attach grafana-state db1 -p prod-online
oxide disk attach vault db1 -p prod-online

oxide instance start db1 -p prod-online

# Create some disks in prod-online to leave unattached

oxide disk create vol1 \
  -D "The vol1 disk." \
  -p prod-online \
  --size $GiB \
  --disk-source blank=512
oxide disk create vol2 \
  -D "The vol2 disk." \
  -p prod-online \
  --size $GiB \
  --disk-source blank=512

# Create VPCs in prod-online

oxide vpc create vpc1 \
  -D "The vpc1 VPC." \
  -p prod-online \
  --dns-name vpc1
oxide vpc create vpc2 \
  -D "The vpc2 VPC." \
  -p prod-online \
  --dns-name vpc2

echo -e "\n==== API DATA POPULATED ====\n"
