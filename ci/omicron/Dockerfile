FROM ghcr.io/oxidecomputer/omicron:add-dockerfile-and-github-action

RUN apt-get update && apt-get install -y \
	uuid-runtime \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

COPY ci/omicron/config.toml /etc/omicron/config.toml
COPY ci/omicron/entrypoint.sh /usr/local/bin/entrypoint.sh

CMD ["entrypoint.sh"]
