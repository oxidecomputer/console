#!/bin/bash
set -e
set -o pipefail

# Start tailscale.
export TAILSCALE_MACHINE_KEY=$(cat /etc/tailscale/machine_key | tr -d '[:space:]')
tailscale up --authkey=${TAILSCALE_MACHINE_KEY}

# Get the IP of the instance.
# This _should_ be the second column.
export TAILSCALE_IP=$(tailscale status | grep console-git-BRANCH_NAME | awk '{print $2}')

# Run the console.
docker run -d \
	--restart=always \
	--name=console \
	-p 0.0.0.0:80:80 \
	--entrypoint=sled_agent \
	ghcr.io/oxidecomputer/console:BRANCH_NAME

# Let's make sure cloudflare knows the right IP for this instance.
