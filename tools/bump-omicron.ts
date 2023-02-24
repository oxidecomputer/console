#! /usr/bin/env -S deno run --allow-run --allow-net --allow-read --allow-write
import * as flags from 'https://deno.land/std@0.159.0/flags/mod.ts'
import * as path from 'https://deno.land/std@0.159.0/path/mod.ts'

// Automatically update tools/console_version in ../omicron with current console
// commit hash and tarball hash. Then create PR in Omicron with that change.
//
// Requirements/assumptions:
//
// - GitHub CLI
// - Omicron is a sibling dir to console

const OMICRON_DIR = '../omicron'
const VERSION_FILE = path.join(OMICRON_DIR, 'tools/console_version')

const GH_MISSING = 'GitHub CLI not found. Please install it and try again.'
const VERSION_FILE_MISSING = `Omicron console version file at '${VERSION_FILE}' not found. This script assumes Omicron is cloned in a sibling directory next to Console.`

/** Run shell command, get output as string */
function run(cmd: string, args: string[]): string {
  const { code, stdout } = new Deno.Command(cmd, { args, stdout: 'piped' }).outputSync()

  if (code !== 0) throw Error(`Shell command '${args.join(' ')}' failed`)

  return new TextDecoder().decode(stdout).trim()
}

// script starts here

const { dryRun } = flags.parse(Deno.args, {
  alias: { dryRun: ['d', 'dry-run'] },
  boolean: ['dryRun'],
})

const newCommit = run('git', ['rev-parse', 'HEAD'])
const shaUrl = `https://dl.oxide.computer/releases/console/${newCommit}.sha256.txt`
const newSha2 = (await fetch(shaUrl).then((resp) => resp.text())).trim()

const newVersionFile = `COMMIT="${newCommit}"\nSHA2="${newSha2}"\n`

if (dryRun) {
  console.log(newVersionFile)
  Deno.exit()
}

try {
  run('which', ['gh'])
} catch (_e) {
  throw Error(GH_MISSING)
}

const oldVersionFile = await Deno.readTextFile(VERSION_FILE).catch(() => {
  throw Error(VERSION_FILE_MISSING)
})

const oldCommit = /COMMIT="?([a-f0-9]+)"?/.exec(oldVersionFile)?.[1]
if (!oldCommit) throw Error('Could not parse existing version file')

await Deno.writeTextFile(VERSION_FILE, newVersionFile)

const branchName = `bump-console-${newCommit.slice(0, 8)}`
const prTitle = 'Bump console to latest main'
const prBody = `Changes: https://github.com/oxidecomputer/console/compare/${oldCommit}...${newCommit}`

// cd to omicron, pull main, create new branch, commit changes, push, PR it, go back to
// main, delete branch
Deno.chdir(OMICRON_DIR)
run('git', ['checkout', 'main'])
run('git', ['pull'])
run('git', ['checkout', '-b', branchName])
run('git', ['add', '--all'])
run('git', ['commit', '-m', prTitle, '-m', prBody])
run('git', ['push', '--set-upstream', 'origin', branchName])
run('gh', ['pr', 'create', '--title', prTitle, '--body', prBody])
run('git', ['checkout', 'main'])
run('git', ['branch', '-D', branchName])
