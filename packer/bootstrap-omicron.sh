#!/bin/bash
set -e
set -o pipefail

# Run nexus.
sudo docker run -d \
	--restart=always \
	--name=nexus \
	--hostname=nexus \
	-p 0.0.0.0:12221:12221 -p 0.0.0.0:8888:8888  \
	-v "/etc/omicron/config.toml:/etc/omicron/config.toml:ro"  \
	--entrypoint=nexus \
	ghcr.io/oxidecomputer/omicron:add-dockerfile-and-github-action \
		/etc/omicron/config.toml

# Run the sled agent.
sudo docker run -d \
	--restart=always \
	--name=sled-agent \
	--hostname=sled-agent \
	-p 0.0.0.0:12345:12345 \
	--entrypoint=sled_agent \
	ghcr.io/oxidecomputer/omicron:add-dockerfile-and-github-action \
		$(uuidgen) 0.0.0.0:12345 0.0.0.0:12221
