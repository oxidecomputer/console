#! /usr/bin/env -S deno run --allow-run --allow-net --allow-read --allow-write=/tmp --allow-env

/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { exists } from 'https://deno.land/std@0.208.0/fs/mod.ts'
import { $ } from 'https://deno.land/x/dax@0.39.1/mod.ts'
import { Command, ValidationError } from 'jsr:@cliffy/command@1.0.0-rc.8'

// fzf picker keeps UX quick without requiring people to wire up shell helpers
async function pickPr(): Promise<number> {
  const prNum = await $`gh pr list -R oxidecomputer/omicron --limit 100
        --json number,title,updatedAt,author
        --template '{{range .}}{{tablerow .number .title .author.name (timeago .updatedAt)}}{{end}}'`
    .pipe($`fzf --height 25% --reverse`)
    .pipe($`cut -f1 -d ' '`)
    .text()
  if (!/^\d+$/.test(prNum))
    throw new Error(`Error picking PR. Expected number, got '${prNum}'`)
  return parseInt(prNum, 10)
}

// because the schema files change, in order to specify a schema you need both a
// commit and a filename
type DiffTarget = {
  baseCommit: string
  baseSchema: string
  headCommit: string
  headSchema: string
}

const SPEC_DIR_URL = (commit: string) =>
  `https://api.github.com/repos/oxidecomputer/omicron/contents/openapi/nexus?ref=${commit}`

const SPEC_RAW_URL = (commit: string, filename: string) =>
  `https://raw.githubusercontent.com/oxidecomputer/omicron/${commit}/openapi/nexus/${filename}`

async function resolveCommit(ref?: string | number): Promise<string> {
  if (ref === undefined) return resolveCommit(await pickPr())
  if (typeof ref === 'number') {
    const query = `{
      repository(owner: "oxidecomputer", name: "omicron") {
        pullRequest(number: ${ref}) { headRefOid }
      }
    }`
    const pr = await $`gh api graphql -f query=${query}`.json()
    return pr.data.repository.pullRequest.headRefOid
  }
  return ref
}

const normalizeRef = (ref?: string | number) =>
  typeof ref === 'string' && /^\d+$/.test(ref) ? parseInt(ref, 10) : ref

async function getSchemaFiles(
  commit: string,
  /**
   * Include previous is for when we're diffing against a single commit, so we
   * need both current and previous schema filename
   */
  includePrevious: boolean
) {
  const contents = await $`gh api ${SPEC_DIR_URL(commit)}`.json()

  const latestLink = contents.find((f: { name: string }) => f.name === 'nexus-latest.json')
  if (!latestLink) throw new Error('nexus-latest.json not found')
  const latest = (await fetch(latestLink.download_url).then((r) => r.text())).trim()

  if (!includePrevious) return { latest }

  const schemaFiles = contents
    .filter(
      (f: { name: string }) => f.name.startsWith('nexus-') && f.name !== 'nexus-latest.json'
    )
    .map((f: { name: string }) => f.name)
    .sort()

  const latestIndex = schemaFiles.indexOf(latest)
  if (latestIndex === -1) throw new Error(`Latest schema ${latest} not found in dir`)
  if (latestIndex === 0) throw new Error('No previous schema version found')

  return { before: schemaFiles[latestIndex - 1], latest }
}

async function resolveTarget(ref1?: string | number, ref2?: string): Promise<DiffTarget> {
  if (ref2 !== undefined) {
    if (ref1 === undefined)
      throw new ValidationError('Provide a base ref when passing two refs')
    const [baseCommit, headCommit] = await Promise.all([
      resolveCommit(normalizeRef(ref1)),
      resolveCommit(normalizeRef(ref2)),
    ])
    const [baseSchema, headSchema] = await Promise.all([
      getSchemaFiles(baseCommit, false).then((r) => r.latest),
      getSchemaFiles(headCommit, false).then((r) => r.latest),
    ])
    return { baseCommit, baseSchema, headCommit, headSchema }
  }

  const commit = await resolveCommit(normalizeRef(ref1))
  const { before, latest } = await getSchemaFiles(commit, true)
  return { baseCommit: commit, baseSchema: before, headCommit: commit, headSchema: latest }
}

async function ensureSpec(
  commit: string,
  specFilename: string,
  genClient: boolean,
  force: boolean
) {
  const dir = `/tmp/api-diff/${commit}/${specFilename}`
  const schemaPath = `${dir}/spec.json`
  const clientPath = `${dir}/Api.ts`

  if (force || !(await exists(schemaPath))) {
    await $`mkdir -p ${dir}`
    console.info(`Downloading ${specFilename}...`)
    const content = await fetch(SPEC_RAW_URL(commit, specFilename)).then((r) => r.text())
    await Deno.writeTextFile(schemaPath, content)
  }

  if (genClient && (force || !(await exists(clientPath)))) {
    console.info(`Generating client for ${specFilename}...`)
    await $`npx @oxide/openapi-gen-ts@latest ${schemaPath} ${dir}`
    await $`npx prettier --write --log-level error ${dir}`
  }

  return genClient ? clientPath : schemaPath
}

//////////////////////////////
// ACTUAL SCRIPT FOLLOWS
//////////////////////////////

if (!$.commandExistsSync('gh')) throw Error('Need gh (GitHub CLI)')

// prefer delta if it exists. https://dandavison.github.io/delta/
const diffTool = $.commandExistsSync('delta') ? 'delta' : 'diff'

type Format = 'ts' | 'schema'

async function runDiff(target: DiffTarget, format: Format, force: boolean) {
  const genClient = format === 'ts'
  const [basePath, headPath] = await Promise.all([
    ensureSpec(target.baseCommit, target.baseSchema, genClient, force),
    ensureSpec(target.headCommit, target.headSchema, genClient, force),
  ])

  await $`${diffTool} ${basePath} ${headPath}`.noThrow()
}

function parseFormat(format: string): Format {
  if (format !== 'ts' && format !== 'schema') {
    throw new ValidationError(`Invalid format: '${format}'. Must be 'ts' or 'schema'`)
  }
  return format as Format
}

await new Command()
  .name('api-diff')
  .description(
    `Display changes to API client or schema caused by a given Omicron PR.

Arguments:
  No args          Interactive PR picker
  <pr>             PR number (e.g., 1234)
  <commit>         Commit SHA
  <base> <head>    Two refs (commits or PRs), compare latest schema on each

Dependencies:
  - Deno
  - GitHub CLI (gh)
  - Optional: delta diff pager https://dandavison.github.io/delta/
  - Optional: fzf for PR picker https://github.com/junegunn/fzf`
  )
  .helpOption('-h, --help', 'Show help')
  .option('-f, --force', 'Re-download spec and regenerate client even if cached')
  .option(
    '--format <format:string>',
    'Output format: ts (generated client) or schema (raw JSON)',
    { default: 'ts' }
  )
  .arguments('[ref1:string] [ref2:string]')
  .action(async (options, ref?: string, ref2?: string) => {
    const format = parseFormat(options.format)
    const target = await resolveTarget(ref, ref2)
    await runDiff(target, format, options.force ?? false)
  })
  .parse(Deno.args)
