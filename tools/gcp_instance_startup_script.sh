#!/bin/bash
set -e
set -o pipefail

# Start tailscale.
export TAILSCALE_MACHINE_KEY=$(cat /etc/tailscale/machine_key | tr -d '[:space:]')
tailscale up --authkey=${TAILSCALE_MACHINE_KEY}

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
	-p 0.0.0.0:80:80 \
	-p 0.0.0.0:443:443 \
	-v "/etc/cloudflare:/etc/cloudflare:ro" \
	-v "/etc/nginx/ssl-params.conf:/etc/nginx/ssl-params.conf:ro" \
	-v "/etc/nginx/conf.d:/etc/nginx/conf.d:ro" \
	ghcr.io/oxidecomputer/console:BRANCH_NAME

