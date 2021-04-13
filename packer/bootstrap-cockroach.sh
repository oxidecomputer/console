#!/bin/bash
set -e
set -o pipefail

# Create the network.
sudo docker network create -d bridge roachnet

# Start the first node.
sudo docker run -d \
	--restart=always \
	--name=roach1 \
	--hostname=roach1 \
	--net=roachnet \
	-p 0.0.0.0:26257:26257 \
	-p 0.0.0.0:8080:8080  \
	-v "/etc/cockroach/roach1/data:/cockroach/cockroach-data"  \
	cockroachdb/cockroach start \
		--insecure \
		--join=roach1,roach2,roach3

# Start the second node.
sudo docker run -d \
	--restart=always \
	--name=roach2 \
	--hostname=roach2 \
	--net=roachnet \
	-v "/etc/cockroach/roach2/data:/cockroach/cockroach-data"  \
	cockroachdb/cockroach start \
		--insecure \
		--join=roach1,roach2,roach3

# Start the third node.
sudo docker run -d \
	--restart=always \
	--name=roach3 \
	--hostname=roach3 \
	--net=roachnet \
	-v "/etc/cockroach/roach3/data:/cockroach/cockroach-data"  \
	cockroachdb/cockroach start \
		--insecure \
		--join=roach1,roach2,roach3

# Initialize the cluser.
sudo docker exec roach1 ./cockroach init --insecure
