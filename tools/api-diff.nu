#! /usr/bin/env nu

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, you can obtain one at https://mozilla.org/MPL/2.0/.
#
# Copyright Oxide Computer Company

def genForCommit [commit: string, force: bool] {
  let tmpDir = $"/tmp/api-diff/($commit)"

  # if the directory already exists and we haven't passed the force flag,
  # don't bother downloading and generating it again
  if (($tmpDir | path exists) and (not $force)) { return }

  rm -rf $tmpDir
  mkdir $tmpDir
  npm run --silent --prefix ../oxide.ts gen-from $commit $tmpDir
  npx prettier --write --log-level error $tmpDir
}

if (which gh | is-empty) {
  error make {msg: 'gh is not installed'}
}

def promptForPr [] {
  (gh pr list --repo oxidecomputer/omicron --limit 100 --json number,title,updatedAt,author 
    --template '{{range .}}{{tablerow .number .title .author.name (timeago .updatedAt)}}{{end}}' ) | 
    fzf --height 25% --reverse |
    cut -f1 -d ' '
}

# Visualize API changes for an Omicron PR by generating and diffing the TS
# client before and after the change
def main [
  prNum?: int  # If left out, interactive picker will be shown
  --force      # Download and generate even if output already present
] {
  let prNum = if ($prNum == null) {
    promptForPr
  } else {
    $prNum
  }

  let query = $"query={ 
    repository\(owner: \"oxidecomputer\", name: \"omicron\") { 
      pullRequest\(number: ($prNum)) { 
        baseRefOid
        headRefOid
      }
    }
  }"

  let pr = (gh api graphql -f $query | from json | get data.repository.pullRequest)

  let base = $pr | get baseRefOid
  genForCommit $base $force

  let head = $pr | get headRefOid
  genForCommit $head $force

  # git difftool is a trick to diff with whatever you have git set to use
  git --no-pager difftool $"/tmp/api-diff/($base)/Api.ts" $"/tmp/api-diff/($head)/Api.ts"
}
