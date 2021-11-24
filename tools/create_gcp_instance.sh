#!/bin/bash
set -e
set -o pipefail

function retry {
  local retries=$1
  shift

  local count=0
  until "$@"; do
    exit=$?
    wait=$((2 ** $count))
    count=$(($count + 1))
    if [ $count -lt $retries ]; then
      echo "Retry $count/$retries exited $exit, retrying in $wait seconds..."
      sleep $wait
    else
      echo "Retry $count/$retries exited $exit, no more retries left."
      return $exit
    fi
  done
  return 0
}

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

export ZONE="us-central1-a"
export INSTANCE_TYPE="n2-standard-2"
export INSTANCE_NAME="console-git-${BRANCH_NAME}"

echo "Deleting old instance if it already exists."
gcloud compute instances delete "$INSTANCE_NAME" --quiet \
	--zone=$ZONE || true

echo " Creating instance: ${INSTANCE_NAME}"

sed -i "s/BRANCH_NAME/${BRANCH_NAME}/g" tools/gcp_instance_startup_script.sh

# Retry command twice just in case there is a random failure.
retry 2 gcloud compute instances create "$INSTANCE_NAME" \
	--description="Machine automatically generated from branch ${BRANCH_NAME} of the oxidecomputer/console git repo." \
	--hostname="${INSTANCE_NAME}.internal.oxide.computer" \
	--zone=$ZONE \
	--image=packer-1637789006 \
	--maintenance-policy=TERMINATE \
	--restart-on-failure \
	--machine-type=$INSTANCE_TYPE \
	--boot-disk-size=200GB \
	--boot-disk-auto-delete \
	--metadata-from-file startup-script=${DIR}/gcp_instance_startup_script.sh \
	--quiet
