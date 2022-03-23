#!/bin/bash
set -e
set -o pipefail

# To start let's update and upgrade everything.
sudo apt update
sudo apt upgrade -y

# Install docker and tailscale.
curl -sSL https://download.docker.com/linux/debian/gpg | sudo apt-key add -
curl -sSL https://pkgs.tailscale.com/stable/debian/buster.gpg | sudo apt-key add -
sudo apt install -y --no-install-recommends \
	apt-transport-https \
	ca-certificates \
	software-properties-common \
	uuid-runtime

curl -sSL https://pkgs.tailscale.com/stable/debian/buster.list | sudo tee /etc/apt/sources.list.d/tailscale.list
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/debian $(lsb_release -cs) stable"
sudo apt update
sudo apt install -y --no-install-recommends \
	docker-ce \
	docker-ce-cli \
	containerd.io \

# Install node.
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo bash -
sudo apt install -y --no-install-recommends \
	nodejs

# Install yarn.
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt update
sudo apt install -y --no-install-recommends \
	yarn

# Update systemd to include our service files.
sudo mv /tmp/iptables-routing.service /etc/systemd/system/iptables-routing.service
sudo systemctl daemon-reload
sudo systemctl enable iptables-routing.service
sudo systemctl start iptables-routing.service

# Move the omicron config to a decent spot.
sudo mkdir -p /etc/omicron
sudo mv /tmp/omicron.toml /etc/omicron/config.toml

# Move the nginx configs to the right directory.
sudo mv /tmp/nginx /etc/nginx

# Download the latest Oxide command line.
# FROM: https://github.com/oxidecomputer/cli/releases

export OXIDE_CLI_SHA256="440869bce30b390d027a7d613f08e7c1cccf1d731f9d41c2d1d34274d2507324"
# Download and check the sha256sum.
$ curl -fSL "https://dl.oxide.computer/releases/cli/v0.1.0-pre.7/oxide-x86_64-unknown-linux-musl" -o "/usr/local/bin/oxide" \
	&& echo "${OXIDE_CLI_SHA256}  /usr/local/bin/oxide" | sha256sum -c - \
	&& chmod a+x "/usr/local/bin/oxide"

# Login to the GitHub container registry.
sudo docker login ghcr.io -u jessfraz -p "$GITHUB_TOKEN"

# Pre-pull the base docker images we need.
sudo docker pull ghcr.io/oxidecomputer/cio:cfcert
sudo docker pull ghcr.io/oxidecomputer/console:packer

# This is for the oxapi script.
sudo npm install -g json

# Set the tailscale machine key
sudo mkdir -p /etc/tailscale
echo "${TAILSCALE_MACHINE_KEY}" | sudo tee /etc/tailscale/machine_key

# Set the cloudflare variables
sudo mkdir -p /etc/cloudflare
echo "${CLOUDFLARE_EMAIL}" | sudo tee /etc/cloudflare/email
echo "${CLOUDFLARE_TOKEN}" | sudo tee /etc/cloudflare/token
echo "${SSL_CERT}" | sudo tee /etc/cloudflare/certificate
echo "${SSL_KEY}" | sudo tee /etc/cloudflare/private_key

# Clean up
sudo apt autoremove -y
sudo apt clean -y
