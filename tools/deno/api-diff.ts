#! /usr/bin/env -S deno run --allow-run --allow-net --allow-read --allow-write=/tmp --allow-env

/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { $, CommandBuilder } from 'https://deno.land/x/dax@0.35.0/mod.ts'

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
    $`gh pr list -R oxidecomputer/omicron --limit 100 --json number,title,updatedAt,author --template  '{{range .}}{{tablerow .number .title .author.name (timeago .updatedAt)}}{{end}}'`
  const picker = () => $`fzf --height 25% --reverse`
  const cut = () => $`cut -f1 -d ' '`

  return listPRs().pipe(picker()).pipe(cut()).text()
}

async function getPrRange(prNum: string) {
  const pr = await $`gh api graphql -f query='{ 
      repository(owner: "oxidecomputer", name: "omicron") { 
        pullRequest(number: ${prNum}) { 
          baseRefOid
          headRefOid
        }
      }
    }'`.json()
  const { baseRefOid: base, headRefOid: head } = pr.data.repository.pullRequest
  return { base, head } as { base: string; head: string }
}

async function genForCommit(commit: string) {
  const tmpDir = `/tmp/api-diff/${commit}`
  await $`rm -rf ${tmpDir}`
  await $`mkdir -p ${tmpDir}`
  await $`npm run --silent --prefix ../oxide.ts gen-from ${commit} ${tmpDir}`
  await $`npx prettier --write --log-level error ${tmpDir}`
  return tmpDir
}

//////////////////////////////
// ACTUAL SCRIPT FOLLOWS
//////////////////////////////

if (!$.commandExistsSync('gh')) throw Error('Need gh (GitHub CLI)')

const prNum = await pickPr()

if (!/^\d+$/.test(prNum)) {
  console.error(`Error picking PR. Expected number, got '${prNum}'`)
  Deno.exit()
}

const { base, head } = await getPrRange(prNum)

const tmpDirBase = await genForCommit(base)
const tmpDirHead = await genForCommit(head)

// git difftool is a trick to diff with whatever you have git set to use
await $`git --no-pager difftool ${tmpDirBase}/Api.ts ${tmpDirHead}/Api.ts || true`
