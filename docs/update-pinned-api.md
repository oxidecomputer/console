# Updating the pinned API version

Currently this is a two-commit process. Eventually we will improve this.

1. Update the omicron commit hash [here](https://github.com/oxidecomputer/console/blob/c90ac1660273dbee2a2fe5456fc8318057444a13/.github/workflows/packer.yaml#L49) and push to a PR
2. Wait for `Packer` Github action to complete
3. Get the packer image ID from the `Get image information step` (looks like `packer-123456789`)

   <img width="864" alt="Screen Shot 2021-04-12 at 3 43 43 PM" src="https://user-images.githubusercontent.com/3612203/114452058-007cfe00-9ba6-11eb-9664-7ca466f1a280.png">

4. Update packer image ID [here](https://github.com/oxidecomputer/console/blob/d046263cbfbb80b08757e432a8fcd980b8facbe3/tools/create_gcp_instance.sh#L23) and push

The deployed version will now be based on the new packer image.

The list of available omicron images is available [here](https://github.com/orgs/oxidecomputer/packages/container/omicron/versions). That link is probably not accessible to everyone, but it basically contains an image corresponding to every commit on omicron `main` as well as the latest commit on every branch with a PR. You can use a branch name instead of a commit, but that's probably not a good idea, because even if that branch gets updated, your console branch won't until something triggers a new packer build. Better to pin the commit hash corresponding to an omicron branch and then update it again when that branch gets more commits.

## Updating the generated client

When you update the API version, you must also update the generated API client with `./tools/generate_api_client.sh`. That script will automatically check out the omicron commit specified as API_VERSION in the packer config. If you do not update the generated API client, a safety test in `libs/api` will fail.
