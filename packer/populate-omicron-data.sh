#!/bin/bash

sudo npm install -g json

oxapi_demo project_create_demo prod-online
oxapi_demo project_create_demo release-infrastructure
oxapi_demo project_create_demo rendering
oxapi_demo project_create_demo test-infrastructure
oxapi_demo project_create_demo oxide-demo

oxapi_demo instance_create_demo prod-online db1
oxapi_demo instance_create_demo prod-online db2

oxapi_demo disk_create_demo prod-online nginx
oxapi_demo disk_create_demo prod-online grafana
oxapi_demo disk_create_demo prod-online grafana-state
oxapi_demo disk_create_demo prod-online vault

oxapi_demo instance_attach_disk prod-online db1 nginx
oxapi_demo instance_attach_disk prod-online db1 grafana
oxapi_demo instance_attach_disk prod-online db1 grafana-state
oxapi_demo instance_attach_disk prod-online db1 vault

echo "\n==== API DATA POPULATED ====\n"
