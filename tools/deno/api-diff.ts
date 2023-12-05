#! /usr/bin/env -S deno run --allow-run --allow-net --allow-read --allow-write=/tmp --allow-env

/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import * as flags from 'https://deno.land/std@0.208.0/flags/mod.ts'
import { exists } from 'https://deno.land/std@0.208.0/fs/mod.ts'
import { $, CommandBuilder } from 'https://deno.land/x/dax@0.35.0/mod.ts'

const HELP = `
Display changes to API client caused by a given Omicron PR. Works by downloading
the OpenAPI spec before and after, generating clients in temp dirs, and diffing.

Requirements:
  - Deno (which you have if you're seeing this message)
  - GitHub CLI (gh)

Usage:
  ./tools/deno/api-diff.ts [-f] [PR number]
  ./tools/deno/api-diff.ts -h

Flags:
  -f, --force          Download spec and regen client even if dir already exists
  -h, --help           Show this help message

Parameters:
  PR number <int>: If left out, interactive picker is shown
`.trim()

function printHelpAndExit() {
  console.log(HELP)
  Deno.exit()
}

// inspired by: https://github.com/dsherret/dax/issues/137#issuecomment-1603848769
declare module 'https://deno.land/x/dax@0.35.0/mod.ts' {
  interface CommandBuilder {
    pipe(next: CommandBuilder): CommandBuilder
  }
}

CommandBuilder.prototype.pipe = function (next: CommandBuilder): CommandBuilder {
  const p = this.stdout('piped').spawn()
  return next.stdin(p.stdout())
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
  return parseInt(prNum, 10)
}

async function getPrRange(prNum: number) {
  const query = `{
      repository(owner: "oxidecomputer", name: "omicron") {
        pullRequest(number: ${prNum}) {
          baseRefOid
          headRefOid
        }
      }
    }`
  const pr = await $`gh api graphql -f query=${query}`.json()
  const { baseRefOid: base, headRefOid: head } = pr.data.repository.pullRequest
  return { base, head } as { base: string; head: string }
}

async function genForCommit(commit: string, force: boolean) {
  const tmpDir = `/tmp/api-diff/${commit}`
  const alreadyExists = await exists(tmpDir + '/Api.ts')

  // if the directory already exists, skip it
  if (force || !alreadyExists) {
    await $`rm -rf ${tmpDir}`
    await $`mkdir -p ${tmpDir}`
    await $`npm run --silent --prefix ../oxide.ts gen-from ${commit} ${tmpDir}`
    await $`npx prettier --write --log-level error ${tmpDir}`
  }

  return tmpDir
}

//////////////////////////////
// ACTUAL SCRIPT FOLLOWS
//////////////////////////////

if (!$.commandExistsSync('gh')) throw Error('Need gh (GitHub CLI)')

// prefer difftastic if it exists. https://difftastic.wilfred.me.uk/
const diffTool = $.commandExistsSync('difft') ? 'difft' : 'diff'

const args = flags.parse(Deno.args, {
  alias: { force: ['f'], h: 'help' },
  boolean: ['force', 'help'],
})

if (args.help) printHelpAndExit()

const prNum = args._[0] ? args._[0] : await pickPr()

if (typeof prNum !== 'number') {
  throw new Error(`PR number must be a number. Got '${prNum}' instead.`)
}

const { base, head } = await getPrRange(prNum)

const tmpDirBase = await genForCommit(base, args.force)
const tmpDirHead = await genForCommit(head, args.force)

await $`${diffTool} ${tmpDirBase}/Api.ts ${tmpDirHead}/Api.ts || true`
