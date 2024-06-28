# Updating the pinned API version

## Instructions

1. Update [`OMICRON_VERSION`](/OMICRON_VERSION) with new Omicron commit hash
1. Update the generated API client by running `npm run gen-api`. This will automatically check out the omicron commit specified as `API_VERSION`. If you forget this step, a safety test in `app/api` will fail.
1. Fix any type errors introduced by changes to the generated code
1. Commit and push to a branch

## Available omicron versions

**We should only be pinning omicron `main` commits in console `main`.** Occasionally, in an in-progress console PR, we may want to _temporarily_ pin to a commit from an as-yet-unmerged API branch. But such a PR should **not** be merged into console `main` until the omicron PR is merged and the pinned version in console updated accordingly.

While you can technically pin an omicron branch name instead of a commit, that's probably not a good idea, because even if that branch gets updated, your console branch won't. It is always better to pin the commit hash corresponding to an omicron branch and then update it when that branch gets more commits.
