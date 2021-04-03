#!/bin/bash
set -e
set -o pipefail

export ZONE="us-central1-a"
export INSTANCE_TYPE="n1-standard-8"
export GIT_BRANCH="$(git symbolic-ref HEAD 2>/dev/null)"
export BRANCH_NAME=${GIT_BRANCH#refs/heads/}
export INSTANCE_NAME="console-git-${BRANCH_NAME}"

echo "Deleting old instance if it already exists."
gcloud compute instances delete "$INSTANCE_NAME" --quiet || true

echo " Creating instance: ${INSTANCE_NAME}"

gcloud compute instances create "$INSTANCE_NAME" \
	--description="Machine automatically generated from branch ${BRANCH_NAME} of the oxidecomputer/console git repo." \
	--hostname="${INSTANCE_NAME}.internal.oxide.computer" \
	--zone=$ZONE \
	--image=packer-1617415373 \
	--maintenance-policy=TERMINATE \
	--restart-on-failure \
	--machine-type=$INSTANCE_TYPE \
	--boot-disk-size=20GB \
	--boot-disk-auto-delete \
	--metadata-from-file startup-script=./gcp_instance_startup_script.sh
	--quiet
