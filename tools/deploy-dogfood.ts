#! /usr/bin/env node

/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { parseArgs } from 'node:util'

import $ from 'dax'

// This script will not work unless you have the following helpful bits in your SSH config:
//
// Host gc*
// StrictHostKeyChecking no
// UserKnownHostsFile /dev/null
// User root
// ProxyCommand ssh castle.eng.oxide.computer pilot -r rack2 tp nc any $(echo "%h" | sed s/gc//) %p
// ServerAliveInterval 15
// ForwardAgent yes
//
// host castle
// hostname %h.eng.oxide.computer
// user <your actual username>
// ForwardAgent yes

const DOGFOOD_HOST = 'https://oxide.sys.rack2.eng.oxide.computer'

/**
 * Nexus validates `api-version` before auth, so an unauthenticated request
 * suffices to check whether `major.0.0` is newer than dogfood supports.
 * Supported versions proceed to auth and return 401.
 */
async function isTooNew(major: number) {
  const res = await fetch(`${DOGFOOD_HOST}/v1/me`, {
    headers: { 'api-version': `${major}.0.0` },
  })
  const body = await res.text()
  if (res.status === 400 && body.includes('server does not support this API version')) {
    return true
  }
  // other 400s are for retired versions ("no longer supports"), below dogfood's newest
  if (res.status === 401 || res.status === 400) return false
  throw new Error(`Unexpected response checking dogfood API version: ${res.status} ${body}`)
}

/** As `<YYYYMMDDNN>`. A week out leaves room for time zones and dates picked a little ahead. */
const weekFromNow = () =>
  Number(
    new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10).replaceAll('-', '')
  ) * 100

/**
 * Bisects to find dogfood's newest API version until Nexus has a version
 * endpoint. Versions have the form `<YYYYMMDDNN>.0.0`, so only the major
 * number varies. `lo` is accepted and `hi` rejected. `lo` starts at the first
 * versioned Nexus API, and no version can be dated much after today.
 */
async function getDogfoodApiMajor(lo = 2025_11_20_00, hi = weekFromNow()): Promise<number> {
  if (hi - lo <= 1) return lo
  const mid = Math.floor((lo + hi) / 2)
  return (await isTooNew(mid)) ? getDogfoodApiMajor(lo, mid) : getDogfoodApiMajor(mid, hi)
}

const USAGE = `
Usage:

  tools/deploy-dogfood.ts <console commit hash>
`.trim()

const { positionals } = parseArgs({ allowPositionals: true, strict: false })
const consoleRevision = positionals[0]

if (!consoleRevision) {
  console.error('Error: Console commit hash is required\n')
  console.info(USAGE)
  process.exit(1)
}

const isTag = (await $`git cat-file -t ${consoleRevision}`.noThrow().text()) === 'tag'

// if console commit is a tag we use ^{} to get the hash of the commit
// underneath the tag, not of the tag itself
const fullCommit = await $`git rev-parse ${consoleRevision}${isTag ? '^{}' : ''}`.text()

if (consoleRevision !== fullCommit) {
  console.info(`Resolved ${consoleRevision} to ${fullCommit}`)
}

const consoleApiVersion = (
  await $`git show ${fullCommit}:app/api/__generated__/API_VERSION`.text()
).trim()
const consoleApiMajor = Number(consoleApiVersion.split('.')[0])

console.info('Checking which API versions dogfood accepts...')
const dogfoodApiMajor = await getDogfoodApiMajor()
console.info(`Dogfood API version: ${dogfoodApiMajor}.0.0`)
console.info(`Console API version: ${consoleApiVersion}\n`)

if (consoleApiMajor > dogfoodApiMajor) {
  console.error(
    "Error: dogfood would reject API requests from this console build. Pick a commit with app/api/__generated__/API_VERSION at or below dogfood's."
  )
  process.exit(1)
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
  process.exit()
}

async function deploy(num: string) {
  console.info(`Deploying to gimlet ${num}...`)
  await $`./tools/dogfood/scp-assets.sh gc${num} ${TARBALL_FILE}`
  console.info(`Done with gimlet ${num}...`)
}

await Promise.all(gimletNums.map(deploy))
