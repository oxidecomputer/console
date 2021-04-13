#!/bin/bash
set -e
set -o pipefail

sudo docker run --rm \
	--name=bootstrp_db \
	--hostname=nexus \
	--net host \
	-v "/etc/omicron/config.toml:/etc/omicron/config.toml:ro"  \
	--entrypoint=omicron_dev \
	ghcr.io/oxidecomputer/omicron:"$API_VERSION" \
		db-populate --database-url "postgresql://root@0.0.0.0:8080/omicron?sslmode=disable"
# Run nexus.
sudo docker run -d \
	--restart=always \
	--name=nexus \
	--hostname=nexus \
	--net host \
	-v "/etc/omicron/config.toml:/etc/omicron/config.toml:ro"  \
	--entrypoint=nexus \
	ghcr.io/oxidecomputer/omicron:"$API_VERSION" \
		/etc/omicron/config.toml

# Run the sled agent.
sudo docker run -d \
	--restart=always \
	--name=sled-agent \
	--hostname=sled-agent \
	--net host \
	--entrypoint=sled_agent \
	ghcr.io/oxidecomputer/omicron:"$API_VERSION" \
		$(uuidgen) 0.0.0.0:12345 0.0.0.0:12221
