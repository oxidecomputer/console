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
// ProxyCommand ssh jeeves.eng.oxide.computer pilot tp nc any $(echo "%h" | sed s/gc//) %p
// ServerAliveInterval 15
// ForwardAgent yes
//
// host jeeves
// hostname %h.eng.oxide.computer
// user <your actual username>
// ForwardAgent yes

const USAGE = `
Usage:

  tools/deno/dogfood-deploy.ts <console commit hash>
`.trim()

const args = parseArgs(Deno.args)
const consoleCommit = args._[0]

if (!consoleCommit) {
  console.error('Error: Console commit hash is required\n')
  console.log(USAGE)
  Deno.exit(1)
}

console.log('Finding nexus zones...')
const zones: string = await $`./tools/dogfood/find-zone.sh nexus`.text()
const gimletNums = zones
  .split('\n')
  .filter((line) => line.includes('nexus'))
  .map((line) => line.trim().split(' ')[0])

console.log(`Found: ${JSON.stringify(gimletNums)}\n`)

const TARBALL_URL = `https://dl.oxide.computer/releases/console/${consoleCommit}.tar.gz`
const TARBALL_FILE = '/tmp/console.tar.gz'

console.log(`Downloading tarball to ${TARBALL_FILE}`)
await $`curl --show-error --fail --location --output ${TARBALL_FILE} ${TARBALL_URL}`
console.log(`Done downloading.\n`)

const go = await $.confirm(`Deploy console to gimlets ${JSON.stringify(gimletNums)}?`)
if (!go) {
  console.log('Deploy aborted')
  Deno.exit()
}

async function deploy(num: string) {
  console.log(`Deploying to gimlet ${num}...`)
  await $`./tools/dogfood/scp-assets.sh gc${num} ${TARBALL_FILE}`
  console.log(`Done with gimlet ${num}...`)
}

await Promise.all(gimletNums.map(deploy))
