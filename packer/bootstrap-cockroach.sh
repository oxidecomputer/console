#!/bin/bash
set -e
set -o pipefail

# Start the first node.
sudo docker run -d \
	--restart=always \
	--name=cockroachdb \
	--hostname=cockroachdb \
	-p 0.0.0.0:26257:26257 \
	-p 0.0.0.0:8080:8080  \
	-v "/etc/cockroach/roach1/data:/cockroach/cockroach-data"  \
	cockroachdb/cockroach start-single-node \
		--insecure

echo "Waiting for CockroachDB to start..."
sleep 5
