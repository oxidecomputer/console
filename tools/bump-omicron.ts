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

const GH_MISSING =
  'GitHub CLI not found. This script needs it to create a PR. Please install it and try again.'

/** Wrap Deno.run, get output as string */
async function run(cmd: string[]): Promise<string> {
  const proc = Deno.run({ cmd, stdout: 'piped' })
  const { code } = await proc.status()
  if (code !== 0) {
    // stderr is not piped so it'll show up automatically
    return Promise.reject(`Shell command '${cmd.join(' ')}' failed`)
  }
  const output = await proc.output()
  return new TextDecoder().decode(output).trim()
}

function parseVersionFile(contents: string): Record<string, string> {
  return Object.fromEntries(
    contents
      .trim()
      .split('\n')
      .map((line) => {
        console.log(line)
        const [k, v] = line.split('=')
        return [k, v.replace(/"/g, '')]
      })
  )
}

async function cmdExists(cmd: string): Promise<boolean> {
  try {
    const proc = Deno.run({ cmd: [cmd], stdout: 'null', stderr: 'null' })
    const { code } = await proc.status()
    return code === 0
  } catch (_e) {
    // command not found
    return false
  }
}

const args = flags.parse(Deno.args)
const dryRun = !!args['dry-run'] || !!args.d

// const newCommit = await run(['git', 'rev-parse', 'HEAD'])
const newCommit = '6f50cffce18f387e531d707487d40cf53b3c320d'
const newSha2 = await fetch(
  `https://dl.oxide.computer/releases/console/${newCommit}.sha256.txt`
)
  .then((resp) => resp.text())
  .then((text) => text.trim())

const newVersionFile = `COMMIT="${newCommit}"\nSHA2="${newSha2}"\n`

if (dryRun) {
  console.log(newVersionFile)
  Deno.exit()
}

if (!(await cmdExists('gh'))) {
  console.error(GH_MISSING)
  Deno.exit(1)
}

const oldVersionFile = await Deno.readTextFile(VERSION_FILE).catch(() => {
  console.error(
    `Omicron console version file at '${VERSION_FILE}' not found. This script assumes Omicron is cloned in a sibling directory next to Console.`
  )
  Deno.exit(1)
})

const { COMMIT: oldCommit } = parseVersionFile(oldVersionFile)

await Deno.writeTextFile(VERSION_FILE, newVersionFile)

Deno.chdir(OMICRON_DIR)
await run(['git', 'checkout', 'main'])
await run(['git', 'pull'])
await run(['git', 'checkout', '-b', `bump-console-${newCommit.slice(0, 8)}`])

const prTitle = 'Bump console to latest main'
const prBody = `Changes: https://github.com/oxidecomputer/console/compare/${oldCommit}...${newCommit}`

await run(['git', 'add', '--all'])
await run(['git', 'commit', '-m', prTitle, '-m', prBody])
await run(['gh', 'pr', 'create', '--title', prTitle, '--body', prBody])
