In order to do deploy previews easily and behind the VPN we first bake a VM
image, we will reuse as the base image for each VM.

## Pre-baked image

On the image is the following:
- Tailscale is installed
- Docker is installed
- Cockroach DB already started
- The API server already started and pre-populated with some data
- Docker images are pulled for cfcert (built in the cio repo): This is for
  routing cloudflare after the VM is launch. We pre-pull the image since then
  running it when the VM is launched takes less time.
- SSL cert wildcard for *.internal.oxide.computer (URL syntax is documented in
  https://119.rfd.oxide.computer)

Packer is the tool used for building the image.

## VM launched

When the VM is launched you can find what is done on startup in
tools/gcp_instance_startup_script.sh.

Essentially, we run `tailscale up` and get the Tailscale IP for the VM.
We use that IP to route DNS through Cloudflare.

Then we pull and run the docker image that was built for the branch.

## Ports on the VM

Cockroach DB: 0.0.0.0:8080
API Server: 0.0.0.0:8888
React App: 0.0.0.0:80,443

TODO:
- Set up the right env vars so the App actually talks to the API.
- When nexus requires cockroach actually hook that up to the cockroach URL we have
- cleanup old images
- cleanup tailscale old machine names
