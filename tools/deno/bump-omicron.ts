#! /usr/bin/env -S deno run --allow-run --allow-net --allow-read --allow-write
import * as flags from 'https://deno.land/std@0.159.0/flags/mod.ts'
import * as path from 'https://deno.land/std@0.159.0/path/mod.ts'

const OMICRON_DIR = '../omicron'
const VERSION_FILE = path.join(OMICRON_DIR, 'tools/console_version')

const GH_MISSING = 'GitHub CLI not found. Please install it and try again.'
const VERSION_FILE_MISSING = `Omicron console version file at '${VERSION_FILE}' not found. This script assumes Omicron is cloned in a sibling directory next to Console.`

/** Run shell command, get output as string */
function run(cmd: string, args: string[]): string {
  const { success, stdout } = new Deno.Command(cmd, { args, stdout: 'piped' }).outputSync()

  if (!success) {
    throw Error(`Shell command '${cmd} ${args.join(' ')}' failed`)
  }

  return new TextDecoder().decode(stdout).trim()
}

function getUploadAssetsWorkflowId() {
  return run('gh', [
    'run',
    'list',
    '-L',
    '1',
    '-w',
    'Upload assets to dl.oxide.computer',
    '--json',
    'databaseId',
    '--jq',
    '.[0].databaseId',
  ])
}

// script starts here

const args = flags.parse(Deno.args, {
  alias: { dryRun: ['d', 'dry-run'], h: 'help', m: 'message' },
  boolean: ['dryRun', 'help'],
  string: ['message'],
})

if (args.help) {
  console.log(
    `
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
  )
  Deno.exit()
}

const newCommit = run('git', ['rev-parse', 'HEAD'])

const shaUrl = `https://dl.oxide.computer/releases/console/${newCommit}.sha256.txt`
const shaResp = await fetch(shaUrl)

if (!shaResp.ok) {
  console.error(
    `
Failed to fetch console tarball SHA. Either the current commit has not been pushed to origin/main or the CI job that uploads the assets is still running.

Run 'gh run watch ${getUploadAssetsWorkflowId()}' to watch the latest asset upload action.
`
  )
  console.error('URL:', shaUrl)
  console.error('Status:', shaResp.status)
  console.error('Body:', await shaResp.text())
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

const oldCommitShort = oldCommit.slice(0, 8)
const newCommitShort = newCommit.slice(0, 8)

const branchName = 'bump-console-' + newCommitShort
const prTitle = 'Bump web console' + (args.message ? ` (${args.message})` : '')
const prBody = `Changes: https://github.com/oxidecomputer/console/compare/${oldCommitShort}...${newCommitShort}`

if (args.dryRun) {
  console.log('New contents of <omicron>/tools/console_version:\n')
  console.log(newVersionFile)
  console.log('Branch:  ', branchName)
  console.log('PR title:', prTitle)
  console.log('PR body: ', prBody)
  console.log('\nConsole commits included:\n')
  console.log(
    run('git', [
      'log',
      '--graph',
      '--oneline',
      '--color=always',
      `${oldCommitShort}...${newCommitShort}`,
    ])
  )
  Deno.exit()
}

try {
  run('which', ['gh'])
} catch (_e) {
  throw Error(GH_MISSING)
}

await Deno.writeTextFile(VERSION_FILE, newVersionFile)

// cd to omicron, pull main, create new branch, commit changes, push, PR it, go back to
// main, delete branch
Deno.chdir(OMICRON_DIR)
run('git', ['checkout', 'main'])
run('git', ['pull'])
run('git', ['checkout', '-b', branchName])
run('git', ['add', '--all'])
run('git', ['commit', '-m', prTitle, '-m', prBody])
run('git', ['push', '--set-upstream', 'origin', branchName])
const prUrl = run('gh', ['pr', 'create', '--title', prTitle, '--body', prBody])
console.log('PR created:', prUrl)
const prNum = prUrl.match(/\d+$/)![0]
console.log(run('gh', ['pr', 'merge', prNum, '--auto', '--squash']))
run('git', ['checkout', 'main'])
run('git', ['branch', '-D', branchName])
