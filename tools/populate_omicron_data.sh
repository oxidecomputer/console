#!/bin/bash

set -o errexit
set -o pipefail
set -o xtrace

# generally you don't want to run this manually. it's meant to be used by
# start_api.sh. if you do run it manually, note that it's meant to be run
# from inside the omicron repo and it assumes nexus and sled agent are running

./tools/oxapi_demo organization_create_demo maze-war
./tools/oxapi_demo organization_create_demo enron
./tools/oxapi_demo organization_create_demo theranos

./tools/oxapi_demo project_create_demo maze-war prod-online
./tools/oxapi_demo project_create_demo maze-war release-infrastructure 
./tools/oxapi_demo project_create_demo maze-war rendering
./tools/oxapi_demo project_create_demo maze-war test-infrastructure
./tools/oxapi_demo project_create_demo maze-war oxide-demo

./tools/oxapi_demo instance_create_demo maze-war prod-online db1
./tools/oxapi_demo instance_create_demo maze-war prod-online db2

./tools/oxapi_demo disk_create_demo maze-war prod-online nginx
./tools/oxapi_demo disk_create_demo maze-war prod-online grafana
./tools/oxapi_demo disk_create_demo maze-war prod-online grafana-state
./tools/oxapi_demo disk_create_demo maze-war prod-online vault

# leave unattached
./tools/oxapi_demo disk_create_demo maze-war prod-online vol1
./tools/oxapi_demo disk_create_demo maze-war prod-online vol2

./tools/oxapi_demo instance_attach_disk maze-war prod-online db1 nginx
./tools/oxapi_demo instance_attach_disk maze-war prod-online db1 grafana
./tools/oxapi_demo instance_attach_disk maze-war prod-online db1 grafana-state
./tools/oxapi_demo instance_attach_disk maze-war prod-online db1 vault

echo -e "\n==== API DATA POPULATED ====\n"