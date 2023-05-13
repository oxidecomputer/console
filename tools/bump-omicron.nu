#!/usr/bin/env nu

const OMICRON_DIR = "../omicron"
let VERSION_FILE = ($OMICRON_DIR | path join "tools/console_version")

const GH_MISSING = "GitHub CLI not found. Please install it and try again."
let VERSION_FILE_MISSING = $"File \"($VERSION_FILE)\" not found. This script assumes Omicron is cloned in a sibling directory next to Console."

alias short = str substring 0..8

alias get-upload-assets-workflow-id = gh run list -L 1 -w 'Upload assets to dl.oxide.computer' --json databaseId --jq '.[0].databaseId'

def get_new_sha [new_commit: string] {
  let sha_url = $"https://dl.oxide.computer/releases/console/($new_commit).sha25.txt"
  try { 
    return (http get $sha_url | str trim)
  } catch {|e|
    let workflow_id = (gh run list -L 1 -w 'Upload assets to dl.oxide.computer' --json databaseId --jq '.[0].databaseId')
    print $"
Failed to fetch console tarball SHA. Either the current console commit has not been pushed to main or the asset upload job is still running. Error: 

($e.debug)

Run this to watch the latest asset upload action.

  gh run watch ($workflow_id)
"
    exit 1
  }
}

# TODO: make this say something other than "main" in the help command

# Update tools/console_version in ../omicron with current console commit
# hash and tarball hash and create PR in Omicron with that change.
#
# Requirements:
#   - GitHub CLI installed
#   - Omicron is a sibling dir to console
def main [
  --dry-run (-d): bool # Dry run, showing changes without creating PR
  --message (-m): string = '' # Add message to PR title: "Bump web console (<msg>)"
] {
  try { open $VERSION_FILE | ignore } catch { print $VERSION_FILE_MISSING; exit 1 }
  let old_commit = (open $VERSION_FILE | parse "COMMIT=\"{commit}\"\nSHA2=\"{sha2}\"\n" | get commit | first) 

  let new_commit = 4beb73a46cd65cc9b05d8b99de65d4c818325ddf # (git rev-parse head)
  let new_sha = (get_new_sha $new_commit)

  let new_version_file = $"COMMIT=\"($new_commit)\"\nSHA2=\"($new_sha)\"\n"

  if $old_commit == $new_commit {
    print "Nothing to update: Omicron already has the current commit pinned"
    exit
  }
  
  let commit_range = $"($old_commit | short)...($new_commit | short)"
  
  let branch_name = $"bump-console-($new_commit | short)"
  let paren = if $message != '' { $" \(($message)\)" } else { "" }
  let pr_title = $"Bump web console($paren)"
  let pr_body = $"Changes: https://github.com/oxidecomputer/console/compare/($commit_range)"
  
  print $"New contents of <omicron>/tools/console_version:

($new_version_file)
Branch:   ($branch_name)
PR title: ($pr_title)
PR body:  ($pr_body)

Console commits since current pinned version:
"
  git log --graph --oneline --color=always $"($commit_range)"
  
  if ($dry_run) { exit }
  
  let inp = (input "\nMake Omicron PR with these changes? (Y/n) " | str downcase)
  if $inp != "y" and $inp != "" { exit }
  
  # make sure GitHub CLI is installed
  try { gh | ignore } catch { print $GH_MISSING; exit 1 }
  
  $new_version_file | save -f $VERSION_FILE
  print $"Updated ($VERSION_FILE) with new commit and SHA2"
  
  cd $OMICRON_DIR
  git checkout main
  git pull
  git checkout -b $branch_name
  # print $"Created branch ($branch_name)"
  
  git add --all
  git commit -m $pr_title -m $pr_body
  git push --set-upstream origin $branch_name
  print "Committed changes and pushed"
  
  let pr_url = (gh pr create --title $pr_title --body $pr_body)
  print $"PR create: ($pr_url)"
  
  let pr_num = ($pr_url | parse -r '(\d+)$' | first).capture0
  gh pr merge $pr_num --auto --squash
  print "PR set to auto-merge when CI passes"
  
  git checkout main
  git branch -D $branch_name
  print $"Checked out omicron main, deleted branch ($branch_name)"
}
