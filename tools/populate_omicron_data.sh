#!/bin/bash

set -o errexit
set -o pipefail
set -o xtrace

# generally you don't want to run this manually. it's meant to be used by
# start_api.sh. if you do run it manually, note that it's meant to be run
# from inside the omicron repo and it assumes nexus and sled agent are running

# The CLI manual is here: https://docs.oxide.computer/cli/manual

oxide org create maze-war \
	-D "The Maze War organization."
oxide org create enron \
	-D "The Enron organization."
oxide org create theranos \
	-D "The Theranos organization."

# Create projects

oxide project create prod-online \
	-D "The production online project." \
	-o maze-war
oxide project create release-infrastructure \
	-D "The release infrastructure project." \
	-o maze-war
oxide project create rendering \
	-D "The rendering project." \
	-o maze-war
oxide project create test-infrastructure \
	-D "The test infrastructure project." \
	-o maze-war

# Create instances in project prod-online

oxide instance create d1 \
	-D "The first production database instance." \
	-o maze-war \
	-p prod-online \
	--hostname "db1.maze-war.com" \
	--ncpus 1 \
	--memory 8
oxide instance create d2 \
	-D "The second production database instance." \
	-o maze-war \
	-p prod-online \
	--hostname "db2.maze-war.com" \
	--ncpus 1 \
	--memory 8

# Create disks in prod-online

oxide disk create nginx \
	-D "The nginx disk." \
	-o maze-war \
	-p prod-online \
	--size 10 \
	--snapshot-id 00000000-0000-
            0000-0000-000000000000
oxide disk create grafana \
	-D "The grafana disk." \
	-o maze-war \
	-p prod-online \
	--size 10 \
	--snapshot-id 00000000-0000-
			0000-0000-000000000000
oxide disk create grafana-state \
	-D "The grafana state disk." \
	-o maze-war \
	-p prod-online \
	--size 10 \
	--snapshot-id 00000000-0000-
			0000-0000-000000000000
oxide disk create vault \
	-D "The vault disk." \
	-o maze-war \
	-p prod-online \
	--size 10 \
	--snapshot-id 00000000-0000-
			0000-0000-000000000000

# Attach disks to instance db1

oxide disk attach nginx db1 \
	-o maze-war
	-p prod-online
oxide disk attach grafana db1 \
	-o maze-war
	-p prod-online
oxide disk attach grafana-state db1 \
	-o maze-war
	-p prod-online
oxide disk attach vault db1 \
	-o maze-war
	-p prod-online

# Create some disks in prod-online to leave unattached

oxide disk create vol1 \
	-D "The vol1 disk." \
	-o maze-war \
	-p prod-online \
	--size 10 \
	--snapshot-id 00000000-0000-
			0000-0000-000000000000
oxide disk create vol2 \
	-D "The vol2 disk." \
	-o maze-war \
	-p prod-online \
	--size 10 \
	--snapshot-id 00000000-0000-
			0000-0000-000000000000

# Create VPCs in prod-online

oxide vpc create vpc1 \
	-D "The vpc1 VPC." \
	-o maze-war \
	-p prod-online \
	--dns-name vpc1.maze-war.com
oxide vpc create vpc2 \
	-D "The vpc2 VPC." \
	-o maze-war \
	-p prod-online \
	--dns-name vpc2.maze-war.com

echo -e "\n==== API DATA POPULATED ====\n"
