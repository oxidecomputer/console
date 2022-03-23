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

export OXIDE_HOST='localhost:8888'  # used by oxide command line
export OXIDE_TOKEN="oxide-spoof-001de000-05e4-4000-8000-000000004007"

/usr/local/bin/populate_omicron_data.sh

set +x
