#!/bin/bash
set -e
set -o pipefail
set -x

# Install tailscale at machine start, there is something they are saving on the
# host that makes everything think its the same machine.
sudo apt update
sudo apt install -y --no-install-recommends \
	tailscale

# Start tailscale.
export TAILSCALE_MACHINE_KEY=$(cat /etc/tailscale/machine_key | tr -d '[:space:]')
tailscale up --authkey=${TAILSCALE_MACHINE_KEY}
sleep 5

# Get the IP of the instance.
# This _should_ be the first column.
export TAILSCALE_IP=$(tailscale status --active | grep console-git-BRANCH_NAME | awk '{print $1}')

# Let's make sure cloudflare knows the right IP for this instance.
export CLOUDFLARE_EMAIL=$(cat /etc/cloudflare/email | tr -d '[:space:]')
export CLOUDFLARE_TOKEN=$(cat /etc/cloudflare/token | tr -d '[:space:]')

# Create the A record for the domain.
docker run --rm \
	--name=cfcert \
	-e CLOUDFLARE_EMAIL \
	-e CLOUDFLARE_TOKEN \
	ghcr.io/oxidecomputer/cio:cfcert \
		cfcert console-git-BRANCH_NAME.internal.oxide.computer ${TAILSCALE_IP}

# Run the console.
docker pull ghcr.io/oxidecomputer/console:BRANCH_NAME
docker run -d \
	--restart=always \
	--name=console \
	--net host \
	-v "/etc/cloudflare:/etc/cloudflare:ro" \
	-v "/etc/nginx/ssl-params.conf:/etc/nginx/ssl-params.conf:ro" \
	-v "/etc/nginx/conf.d:/etc/nginx/conf.d:ro" \
	ghcr.io/oxidecomputer/console:BRANCH_NAME

export OXIDE_HOST='http://0.0.0.0:8888'  # used by oxide command line
export OXIDE_TOKEN="oxide-spoof-001de000-05e4-4000-8000-000000004007"

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

echo "\n==== API DATA POPULATED ====\n"

set +x
