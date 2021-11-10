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

export OXAPI_URL='http://0.0.0.0:8888'  # used by oxapi_demo

# Populate API data.
# After we turn on cockroach and get rid of the in-memory store this can
# be moved to part of the packer build to save time.
oxapi_demo organization_create_demo maze-war
oxapi_demo organization_create_demo enron
oxapi_demo organization_create_demo theranos 

oxapi_demo project_create_demo maze-war prod-online
oxapi_demo project_create_demo maze-war release-infrastructure 
oxapi_demo project_create_demo maze-war rendering
oxapi_demo project_create_demo maze-war test-infrastructure
oxapi_demo project_create_demo maze-war oxide-demo

oxapi_demo instance_create_demo maze-war prod-online db1
oxapi_demo instance_create_demo maze-war prod-online db2

oxapi_demo disk_create_demo maze-war prod-online nginx
oxapi_demo disk_create_demo maze-war prod-online grafana
oxapi_demo disk_create_demo maze-war prod-online grafana-state
oxapi_demo disk_create_demo maze-war prod-online vault

# leave unattached
oxapi_demo disk_create_demo maze-war prod-online vol1
oxapi_demo disk_create_demo maze-war prod-online vol2

oxapi_demo instance_attach_disk maze-war prod-online db1 nginx
oxapi_demo instance_attach_disk maze-war prod-online db1 grafana
oxapi_demo instance_attach_disk maze-war prod-online db1 grafana-state
oxapi_demo instance_attach_disk maze-war prod-online db1 vault

echo "\n==== API DATA POPULATED ====\n"

set +x
