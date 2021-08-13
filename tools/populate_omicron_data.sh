#!/bin/bash

set -o errexit
set -o pipefail
set -o xtrace

# generally you don't want to run this manually. it's meant to be used by
# start_api.sh. if you do run it manually, note that it's meant to be run
# from inside the omicron repo and it assumes nexus and sled agent are running

./tools/oxapi_demo project_create_demo prod-online
./tools/oxapi_demo project_create_demo release-infrastructure 
./tools/oxapi_demo project_create_demo rendering
./tools/oxapi_demo project_create_demo test-infrastructure
./tools/oxapi_demo project_create_demo oxide-demo

./tools/oxapi_demo instance_create_demo prod-online db1
./tools/oxapi_demo instance_create_demo prod-online db2

./tools/oxapi_demo disk_create_demo prod-online nginx
./tools/oxapi_demo disk_create_demo prod-online grafana
./tools/oxapi_demo disk_create_demo prod-online grafana-state
./tools/oxapi_demo disk_create_demo prod-online vault

./tools/oxapi_demo instance_attach_disk prod-online db1 nginx
./tools/oxapi_demo instance_attach_disk prod-online db1 grafana
./tools/oxapi_demo instance_attach_disk prod-online db1 grafana-state
./tools/oxapi_demo instance_attach_disk prod-online db1 vault

echo -e "\n==== API DATA POPULATED ====\n"