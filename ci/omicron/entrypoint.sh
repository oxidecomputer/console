#!/bin/bash
set -e
set -o pipefail

# This is disgusting and we should probably use two containers
# long term but YOLO.
nexus /etc/omicron/config.toml &
sled_agent $(uuidgen) 0.0.0.0:1234 127.0.0.1:12221
