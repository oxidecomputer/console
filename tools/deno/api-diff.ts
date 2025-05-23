#! /usr/bin/env -S deno run --allow-run --allow-net --allow-read --allow-write=/tmp --allow-env

/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { exists } from 'https://deno.land/std@0.208.0/fs/mod.ts'
import { parseArgs } from 'https://deno.land/std@0.220.1/cli/mod.ts'
import { $ } from 'https://deno.land/x/dax@0.39.1/mod.ts'

const HELP = `
Display changes to API client caused by a given Omicron PR. Works by downloading
the OpenAPI spec before and after, generating clients in temp dirs, and diffing.

Dependencies:
  - Deno (which you have if you're seeing this message)
  - GitHub CLI (gh)
  - Optional: delta diff pager https://dandavison.github.io/delta/

Usage:
  ./tools/deno/api-diff.ts [-f] [PR number or commit SHA]
  ./tools/deno/api-diff.ts [-f] [commit SHA] [commit SHA]
  ./tools/deno/api-diff.ts -h

Flags:
  -f, --force       Download spec and regen client even if dir already exists
  -h, --help        Show this help message

Parameters:
  PR number or commit SHA: If left out, interactive picker is shown.
  If two positional arguments are passed, we assume they are commits.
`.trim()

function printHelpAndExit(): never {
  console.info(HELP)
  Deno.exit()
}

// have to do this this way because I couldn't figure out how to get
// my stupid bash function to show up here. I'm sure it's possible
async function pickPr() {
  const listPRs = () =>
    $`gh pr list -R oxidecomputer/omicron --limit 100 
        --json number,title,updatedAt,author 
        --template '{{range .}}{{tablerow .number .title .author.name (timeago .updatedAt)}}{{end}}'`
  const picker = () => $`fzf --height 25% --reverse`
  const cut = () => $`cut -f1 -d ' '`

  const prNum = await listPRs().pipe(picker()).pipe(cut()).text()
  if (!/^\d+$/.test(prNum)) {
    throw new Error(`Error picking PR. Expected number, got '${prNum}'`)
  }
  return prNum
}

async function getCommitRange(
  args: Array<string | number>
): Promise<{ base: string; head: string }> {
  // if there are two or more args, assume two commits
  if (args.length >= 2) {
    return { base: args[0].toString(), head: args[1].toString() }
  }

  // if there are no args or the arg is a number, we're talking about a PR
  if (args.length === 0 || typeof args[0] === 'number') {
    const prNum = args[0] || (await pickPr())
    // This graphql thing is absurd, but the idea is to use the branch point as
    // the base, i.e., the parent of the first commit. If we use the base ref
    // (e.g., main) directly, we get the current state of main, which means the
    // diff will reflect both the current PR and any changes made on main since
    // it branched off.
    const query = `{
      repository(owner: "oxidecomputer", name: "omicron") {
        pullRequest(number: ${prNum}) {
          headRefOid
          commits(first: 1) {
            nodes {
              commit {
                parents(first: 1) { nodes { oid } }
              }
            }
          }
        }
      }
    }`
    const pr = await $`gh api graphql -f query=${query}`.json()
    const head = pr.data.repository.pullRequest.headRefOid
    const base = pr.data.repository.pullRequest.commits.nodes[0].commit.parents.nodes[0].oid
    return { base, head }
  }

  // otherwise assume it's a commit
  const head = args[0]
  const parents =
    await $`gh api repos/oxidecomputer/omicron/commits/${head} --jq '.parents'`.json()
  if (parents.length > 1) throw new Error(`Commit has multiple parents:`)
  return { base: parents[0].sha, head }
}

const specUrl = (commit: string) =>
  `https://raw.githubusercontent.com/oxidecomputer/omicron/${commit}/openapi/nexus.json`

async function genForCommit(commit: string, force: boolean) {
  const tmpDir = `/tmp/api-diff/${commit}`
  const alreadyExists = await exists(tmpDir + '/Api.ts')

  // if the directory already exists, skip it
  if (force || !alreadyExists) {
    await $`rm -rf ${tmpDir}`
    await $`mkdir -p ${tmpDir}`
    console.info(`Generating for ${commit}...`)
    await $`npx @oxide/openapi-gen-ts@latest ${specUrl(commit)} ${tmpDir}`
    await $`npx prettier --write --log-level error ${tmpDir}`
  }

  return tmpDir
}

//////////////////////////////
// ACTUAL SCRIPT FOLLOWS
//////////////////////////////

if (!$.commandExistsSync('gh')) throw Error('Need gh (GitHub CLI)')

// prefer delta if it exists. https://dandavison.github.io/delta/
const diffTool = $.commandExistsSync('delta') ? 'delta' : 'diff'

const args = parseArgs(Deno.args, {
  alias: { force: 'f', help: 'h' },
  boolean: ['force', 'help'],
})

if (args.help) printHelpAndExit()

const { base, head } = await getCommitRange(args._)

const basePath = (await genForCommit(base, args.force)) + '/Api.ts'
const headPath = (await genForCommit(head, args.force)) + '/Api.ts'

await $`${diffTool} ${basePath} ${headPath} || true`

// useful if you want to open the file directly in an editor
console.info('Before:', basePath)
console.info('After: ', headPath)
