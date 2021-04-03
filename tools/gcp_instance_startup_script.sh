#!/bin/bash
set -e
set -o pipefail

# Start tailscale.
export TAILSCALE_MACHINE_KEY=$(cat /etc/tailscale/machine_key | tr -d '[:space:]')
tailscale up --authkey=${TAILSCALE_MACHINE_KEY}

# Run the console.
docker run -d \
	--restart=always \
	--name=console \
	-p 0.0.0.0:80 \
	--entrypoint=sled_agent \
	ghcr.io/oxidecomputer/console:BRANCH_NAME
