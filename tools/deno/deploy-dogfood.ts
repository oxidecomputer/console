#! /usr/bin/env -S deno run --allow-run --allow-net --allow-read --allow-write --allow-env

/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import $ from 'jsr:@david/dax@0.41.0'
import { parseArgs } from 'jsr:@std/cli@0.224.7'

// This script will not work unless you have the following helpful bits in your SSH config:
//
// Host gc*
// StrictHostKeyChecking no
// UserKnownHostsFile /dev/null
// User root
// ProxyCommand ssh castle.eng.oxide.computer pilot tp nc any $(echo "%h" | sed s/gc//) %p
// ServerAliveInterval 15
// ForwardAgent yes
//
// host castle
// hostname %h.eng.oxide.computer
// user <your actual username>
// ForwardAgent yes

const USAGE = `
Usage:

  tools/deno/dogfood-deploy.ts <console commit hash>
`.trim()

const args = parseArgs(Deno.args)
const consoleRevision = args._[0]

if (!consoleRevision) {
  console.error('Error: Console commit hash is required\n')
  console.info(USAGE)
  Deno.exit(1)
}

const isTag = (await $`git cat-file -t ${consoleRevision}`.noThrow().text()) === 'tag'

// if console commit is a tag we use ^{} to get the hash of the commit
// underneath the tag, not of the tag itself
const fullCommit = await $`git rev-parse ${consoleRevision}${isTag ? '^{}' : ''}`.text()

if (consoleRevision !== fullCommit) {
  console.info(`Resolved ${consoleRevision} to ${fullCommit}`)
}

console.info('Finding nexus zones...')
const zones: string = await $`./tools/dogfood/find-zone.sh nexus`.text()
const gimletNums = zones
  .split('\n')
  .filter((line) => line.includes('nexus'))
  .map((line) => line.trim().split(' ')[0])

console.info(`Found: ${JSON.stringify(gimletNums)}\n`)

const TARBALL_URL = `https://dl.oxide.computer/releases/console/${fullCommit}.tar.gz`
const TARBALL_FILE = '/tmp/console.tar.gz'

console.info(`Downloading tarball to ${TARBALL_FILE}`)
await $`curl --show-error --fail --location --output ${TARBALL_FILE} ${TARBALL_URL}`
console.info(`Done downloading.\n`)

const go = await $.confirm(`Deploy console to gimlets ${JSON.stringify(gimletNums)}?`)
if (!go) {
  console.info('Deploy aborted')
  Deno.exit()
}

async function deploy(num: string) {
  console.info(`Deploying to gimlet ${num}...`)
  await $`./tools/dogfood/scp-assets.sh gc${num} ${TARBALL_FILE}`
  console.info(`Done with gimlet ${num}...`)
}

await Promise.all(gimletNums.map(deploy))
