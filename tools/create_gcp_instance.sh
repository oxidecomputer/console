#!/bin/bash
set -e
set -o pipefail

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

export ZONE="us-central1-a"
export INSTANCE_TYPE="n2-standard-2"
export INSTANCE_NAME="console-git-${BRANCH_NAME}"

echo "Deleting old instance if it already exists."
gcloud compute instances delete "$INSTANCE_NAME" --quiet \
	--zone=$ZONE || true

echo " Creating instance: ${INSTANCE_NAME}"

# Retry command twice just in case there is a random failure.
for i in 1 2; do gcloud compute instances create "$INSTANCE_NAME" \
	--description="Machine automatically generated from branch ${BRANCH_NAME} of the oxidecomputer/console git repo." \
	--hostname="${INSTANCE_NAME}.internal.oxide.computer" \
	--zone=$ZONE \
	--image=packer-1618611165 \
	--maintenance-policy=TERMINATE \
	--restart-on-failure \
	--machine-type=$INSTANCE_TYPE \
	--boot-disk-size=200GB \
	--boot-disk-auto-delete \
	--metadata-from-file startup-script=${DIR}/gcp_instance_startup_script.sh \
	--quiet \
	&& break || sleep 5; done
