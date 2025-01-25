#! /usr/bin/env -S deno run --allow-run=gh,git,mktemp --allow-net --allow-read --allow-write --allow-env

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
import { existsSync } from 'jsr:@std/fs@1.0'

const HELP = `
Update tools/console_version in ../omicron to the specified console
commit and create PR in Omicron with that change. We use a git worktree
to avoid touching your Omicron clone.

Requirements:
  - GitHub CLI installed
  - Omicron is a sibling dir to console

Usage:
  ./tools/deno/bump-omicron.ts [commit-ish=main] [options]

Options:
  -d, --dry-run        Dry run, showing changes without creating PR
  -h, --help           Show this help message
  -m, --message <msg>  Add message to PR title: 'Bump web console (<msg>)'
`

const OMICRON_DIR = path.resolve('../omicron')
const GH_MISSING = 'GitHub CLI not found. Please install it and try again.'

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

async function makeOmicronWorktree() {
  const tmpDir = await $`mktemp -d`.text()
  await $`git worktree add ${tmpDir} origin/main`.cwd(OMICRON_DIR).quiet('stdout')

  return {
    dir: tmpDir,
    [Symbol.asyncDispose]: async function () {
      console.log('Cleaning up worktree')
      await $`git worktree remove ${tmpDir}`.cwd(OMICRON_DIR).quiet('stdout')
    },
  }
}

async function fetchTarballSha(commit: string) {
  const shaUrl = `https://dl.oxide.computer/releases/console/${commit}.sha256.txt`
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
    return Deno.exit(1)
  }

  return (await shaResp.text()).trim()
}

async function getOldCommit() {
  const oldVersionFile = await $`git show origin/main:tools/console_version`
    .cwd(OMICRON_DIR)
    .text()

  const oldCommit = /COMMIT="?([a-f0-9]+)"?/.exec(oldVersionFile)?.[1]
  if (!oldCommit) throw new Error('Could not parse existing version file')
  return oldCommit
}

async function makeOmicronPR(
  consoleCommit: string,
  prTitle: string,
  changesLink: string,
  commits: string
) {
  const branchName = 'bump-console-' + consoleCommit.slice(0, 8)

  {
    // create git worktree for latest main in temp dir. `using` ensures this gets
    // cleaned up at the end of the block
    await using worktree = await makeOmicronWorktree()

    const newSha2 = await fetchTarballSha(consoleCommit)
    const newVersionFile = `COMMIT="${consoleCommit}"\nSHA2="${newSha2}"\n`

    const versionFileAbsPath = path.resolve(worktree.dir, 'tools/console_version')
    await Deno.writeTextFile(versionFileAbsPath, newVersionFile)
    console.info('Updated ', versionFileAbsPath)

    // cd to omicron, pull main, create new branch, commit changes, push, PR it, go back to
    // main, delete branch
    Deno.chdir(worktree.dir)
    await $`git checkout -b ${branchName}`
    console.info('Created branch', branchName)

    await $`git add tools/console_version`

    // commits are console commits, so they won't auto-link in omicron
    const commitsMarkdown = commits.split('\n').map(linkifyGitLog).join('\n')
    const prBody = `${changesLink}\n\n${commitsMarkdown}`
    await $`git commit -m ${prTitle} -m ${prBody}`

    await $`git push --set-upstream origin ${branchName}`
    console.info('Committed changes and pushed')

    // create PR
    const prUrl = await $`gh pr create --title ${prTitle} --body ${prBody}`.text()
    console.info('PR created:', prUrl)

    // set it to auto merge
    const prNum = prUrl.match(/\d+$/)![0]
    await $`gh pr merge ${prNum} --auto --squash`
    console.info('PR set to auto-merge when CI passes')
  }

  // worktree has been cleaned up, so branch delete is allowed
  await $`git branch -D ${branchName}`.cwd(OMICRON_DIR)
}

// wrapped in a function so we can do early returns rather than early
// Deno.exits, which mess up the worktree cleanup
async function run(commitIsh: string, dryRun: boolean, messageArg: string | undefined) {
  await $`git fetch`.cwd(OMICRON_DIR)

  const oldConsoleCommit = await getOldCommit()
  const newConsoleCommit = await $`git rev-parse ${commitIsh}`.text()

  if (oldConsoleCommit === newConsoleCommit) {
    console.info(`Nothing to update: Omicron already has ${newConsoleCommit} pinned`)
    return
  }

  const commitRange = `${oldConsoleCommit.slice(0, 8)}...${newConsoleCommit.slice(0, 8)}`
  const commits = await $`git log --graph --oneline ${commitRange}`.text()
  const changesLink = `https://github.com/oxidecomputer/console/compare/${commitRange}`

  console.info(`\n${changesLink}\n\n${commits}\n`)

  if (dryRun) return

  const message =
    messageArg ||
    (await $.prompt({ message: 'Description? (enter to skip)', noClear: true }))
  const prTitle = 'Bump web console' + (message ? ` (${message})` : '')
  console.info(`\nPR title: ${prTitle}\n`)

  const go = await $.confirm({ message: 'Make Omicron PR?', noClear: true })
  if (!go) return

  if (!$.commandExistsSync('gh')) throw new Error(GH_MISSING)

  const consoleDir = Deno.cwd() // save it so we can change back

  await makeOmicronPR(newConsoleCommit, prTitle, changesLink, commits)

  // bump omicron tag in console to current commit
  Deno.chdir(consoleDir)
  console.info('Bumping omicron tag in console')
  await $`git tag -f -a omicron -m 'pinned commit on omicron main' ${commitIsh}`
  await $`git push -f origin tag omicron`
}

// script starts here

const args = flags.parse(Deno.args, {
  alias: { dryRun: ['d', 'dry-run'], h: 'help', m: 'message' },
  boolean: ['dryRun', 'help'],
  string: ['message'],
})

if (args.help) {
  console.info(HELP)
  Deno.exit()
}

if (!existsSync(OMICRON_DIR)) {
  throw new Error(`Omicron repo not found at ${OMICRON_DIR}`)
}

const commitIsh = args._[0]?.toString() || 'main'
await run(commitIsh, args.dryRun, args.message)
