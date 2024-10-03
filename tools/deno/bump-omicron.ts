#! /usr/bin/env -S deno run --allow-run=gh,git --allow-net --allow-read --allow-write --allow-env

/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import * as flags from 'https://deno.land/std@0.159.0/flags/mod.ts'
import * as path from 'https://deno.land/std@0.159.0/path/mod.ts'
import $ from 'https://deno.land/x/dax@0.39.2/mod.ts'

const HELP = `
Update tools/console_version in ../omicron with current console commit
hash and tarball hash and create PR in Omicron with that change.

Requirements:
  - GitHub CLI installed
  - Omicron is a sibling dir to console

Usage:
  ./tools/deno/bump-omicron.ts [options]

Options:
  -d, --dry-run        Dry run, showing changes without creating PR
  -h, --help           Show this help message
  -m, --message <msg>  Add message to PR title: 'Bump web console (<msg>)'
`

const OMICRON_DIR = '../omicron'
const VERSION_FILE = path.join(OMICRON_DIR, 'tools/console_version')

const GH_MISSING = 'GitHub CLI not found. Please install it and try again.'
const VERSION_FILE_MISSING = `Omicron console version file at '${VERSION_FILE}' not found. This script assumes Omicron is cloned in a sibling directory next to Console.`

/**
 * These lines get printed in an Omicron PR, so any references to commits or
 * issues need to be qualified.
 */
function linkifyGitLog(line: string): string {
  const sha = line.slice(2, 10)
  let rest = line.slice(11)

  // if the test ends with '(#123)',  make the number the whole text, otherwise
  // it's redundant when it renders in the PR
  const endsWithPr = rest.match(/\(#\d+\)$/)
  if (endsWithPr) {
    rest = endsWithPr[0].replace(/[()]/g, '')
  }

  rest = rest.replace(/#\d+/g, (s) => 'oxidecomputer/console' + s)

  const shaLink = `[${sha}](https://github.com/oxidecomputer/console/commit/${sha})`

  return `* ${shaLink} ${rest}`
}

// script starts here

const args = flags.parse(Deno.args, {
  alias: { dryRun: ['d', 'dry-run'], h: 'help', m: 'message' },
  boolean: ['dryRun', 'help'],
  string: ['message'],
})

if (args.help) {
  console.log(HELP)
  Deno.exit()
}

const newCommit = await $`git rev-parse HEAD`.text()

const shaUrl = `https://dl.oxide.computer/releases/console/${newCommit}.sha256.txt`
const shaResp = await fetch(shaUrl)

if (!shaResp.ok) {
  const workflowId =
    await $`gh run list -L 1 -w 'Upload assets to dl.oxide.computer' --json databaseId --jq '.[0].databaseId'`.text()
  console.error(
    `
Failed to fetch console tarball SHA. Either the current commit is not on origin/main or the asset upload job is still running.

Status: ${shaResp.status}
URL: ${shaUrl}
Body: ${await shaResp.text()}

Running 'gh run watch ${workflowId}' to watch the current upload action.
`
  )
  await $`gh run watch ${workflowId}`
  Deno.exit(1)
}

const newSha2 = (await shaResp.text()).trim()
const newVersionFile = `COMMIT="${newCommit}"\nSHA2="${newSha2}"\n`

const oldVersionFile = await Deno.readTextFile(VERSION_FILE).catch(() => {
  throw Error(VERSION_FILE_MISSING)
})

const oldCommit = /COMMIT="?([a-f0-9]+)"?/.exec(oldVersionFile)?.[1]
if (!oldCommit) throw Error('Could not parse existing version file')

if (oldCommit === newCommit) {
  console.log('Nothing to update: Omicron already has the current commit pinned')
  Deno.exit()
}

const commitRange = `${oldCommit.slice(0, 8)}...${newCommit.slice(0, 8)}`

const commits = await $`git log --graph --oneline ${commitRange}`.text()
// commits are console commits, so they won't auto-link in omicron
const commitsMarkdown = commits.split('\n').map(linkifyGitLog).join('\n')

const changesLine = `https://github.com/oxidecomputer/console/compare/${commitRange}`

const branchName = 'bump-console-' + newCommit.slice(0, 8)
const prTitle = 'Bump web console' + (args.message ? ` (${args.message})` : '')
const prBody = `${changesLine}\n\n${commitsMarkdown}`

// markdown links make the inline preview unreadable, so leave them out
const prBodyPreview = `${changesLine}\n\n${commits}`

console.log(`
New contents of <omicron>/tools/console_version:

${newVersionFile}

Branch:    ${branchName}
PR title:  ${prTitle}

--------
PR body
--------
  
${prBodyPreview}`)

if (args.dryRun || !confirm('\nMake Omicron PR with these changes?')) {
  Deno.exit()
}

if (!$.commandExistsSync('gh')) throw Error(GH_MISSING)

await Deno.writeTextFile(VERSION_FILE, newVersionFile)
console.log('Updated ', VERSION_FILE)

const consoleDir = Deno.cwd()

// cd to omicron, pull main, create new branch, commit changes, push, PR it, go back to
// main, delete branch
Deno.chdir(OMICRON_DIR)
await $`git checkout main`
await $`git pull`
await $`git checkout -b ${branchName}`
console.log('Created branch', branchName)

await $`git add tools/console_version`
await $`git commit -m ${prTitle} -m ${prBody}`
await $`git push --set-upstream origin ${branchName}`
console.log('Committed changes and pushed')

// create PR
const prUrl = await $`gh pr create --title ${prTitle} --body ${prBody}`.text()
console.log('PR created:', prUrl)

// set it to auto merge
const prNum = prUrl.match(/\d+$/)![0]
await $`gh pr merge ${prNum} --auto --squash`
console.log('PR set to auto-merge when CI passes')

await $`git checkout main`
await $`git branch -D ${branchName}`
console.log('Checked out omicron main, deleted branch', branchName)

// bump omicron tag in console to current commit
Deno.chdir(consoleDir)
console.log('Bumping omicron tag in console')
await $`git tag -f -a omicron -m 'pinned commit on omicron main'`
await $`git push -f origin tag omicron`
