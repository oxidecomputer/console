# Updating the pinned API version

There are, in a way, two sources of truth for the omicron version pinned for deploy alongside the console, and they need to be kept in sync. Eventually we will make this process more automatic.

The primary source of truth, in the sense that it determines what is actually deployed, is the packer image ID in `tools/create_gcp/instance.sh`. Unless that is changed, the API version deployed will not change. But if you want to change the packer image, you have to get a new one to build by first changing the `API_VERSION` env var set in `.github/workflows/packer.yaml`.

## Instructions

1. Update the omicron commit hash in [`packer.yaml`](https://github.com/oxidecomputer/console/blob/c90ac1660273dbee2a2fe5456fc8318057444a13/.github/workflows/packer.yaml#L49) and push to a PR
2. Wait for `Packer` Github action to complete
3. Get packer image ID from `Get image information` step (looks like `packer-123456789`)

   <img width="864" alt="Screen Shot 2021-04-12 at 3 43 43 PM" src="https://user-images.githubusercontent.com/3612203/114452058-007cfe00-9ba6-11eb-9664-7ca466f1a280.png">

4. Update packer image ID in [`tools/create_gcp_instance.sh`](https://github.com/oxidecomputer/console/blob/d046263cbfbb80b08757e432a8fcd980b8facbe3/tools/create_gcp_instance.sh#L23) and push. The deployed version will now be based on the new packer image.
5. Update the generated API client by running `./tools/generate_api_client.sh`. This will automatically check out the omicron commit specified as `API_VERSION` in `packer.yaml`. If you forget this step, a safety test in `libs/api` will fail.

## Available omicron versions

The list of allowed omicron hashes (i.e., hashes for which there is a docker image for us to pull in) is available [here](https://github.com/orgs/oxidecomputer/packages/container/omicron/versions). That link is probably not accessible to everyone, but it basically contains an image corresponding to every commit on omicron `main` as well as the latest commit on every branch with a PR.

**We should only be pinning omicron `main` commits in console `main`.** Occasionally, in an in-progress console PR, we may want to _temporarily_ pin to a commit from an as-yet-unmerged API branch. But such a PR should **not** be merged into console `main` until the omicron PR is merged and the pinned version in console updated accordingly.

While you can technically pin an omicron branch name instead of a commit, that's probably not a good idea, because even if that branch gets updated, your console branch won't until something triggers a new packer build. It is always better to pin the commit hash corresponding to an omicron branch and then update it when that branch gets more commits.
