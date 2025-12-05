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

// have to do this this way because I couldn't figure out how to get
// my stupid bash function to show up here. I'm sure it's possible
async function pickPr(): Promise<number> {
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

type DiffTarget =
  | { type: 'single'; commit: string } // PR or single commit: compare two schemas on same commit
  | { type: 'two-commits'; base: string; head: string } // Two commits: compare latest schema on each

async function getDiffTarget(ref1?: string | number, ref2?: string): Promise<DiffTarget> {
  // Two args means two commits
  if (ref1 !== undefined && ref2 !== undefined) {
    return { type: 'two-commits', base: String(ref1), head: ref2 }
  }

  // No ref provided: interactive PR picker
  if (ref1 === undefined) {
    ref1 = await pickPr()
  }

  // Number means PR - get head commit
  if (typeof ref1 === 'number') {
    const query = `{
      repository(owner: "oxidecomputer", name: "omicron") {
        pullRequest(number: ${ref1}) { headRefOid }
      }
    }`
    const pr = await $`gh api graphql -f query=${query}`.json()
    return { type: 'single', commit: pr.data.repository.pullRequest.headRefOid }
  }

  // Single string arg: single commit, compare two schemas on it
  return { type: 'single', commit: ref1 }
}

const SPEC_DIR_URL = (commit: string) =>
  `https://api.github.com/repos/oxidecomputer/omicron/contents/openapi/nexus?ref=${commit}`

const SPEC_RAW_URL = (commit: string, filename: string) =>
  `https://raw.githubusercontent.com/oxidecomputer/omicron/${commit}/openapi/nexus/${filename}`

/** Get schema filenames from a commit. Returns latest and optionally the previous version. */
async function getSchemaFiles(
  commit: string,
  includePrevious: boolean
): Promise<{ latest: string; before?: string }> {
  const contents = await $`gh api ${SPEC_DIR_URL(commit)}`.json()

  const symlinkEntry = contents.find(
    (f: { name: string }) => f.name === 'nexus-latest.json'
  )
  if (!symlinkEntry) throw new Error('nexus-latest.json not found')

  const latest = (await fetch(symlinkEntry.download_url).then((r) => r.text())).trim()

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

/** Download spec and optionally generate TS client. Returns { schema, client? } paths. */
async function fetchSpec(
  commit: string,
  specFilename: string,
  genClient: boolean,
  force: boolean
) {
  const dir = `/tmp/api-diff/${commit}/${specFilename}`
  const schemaPath = `${dir}/spec.json`
  const clientPath = `${dir}/Api.ts`

  const schemaExists = await exists(schemaPath)
  const clientExists = await exists(clientPath)

  if (force || !schemaExists) {
    await $`mkdir -p ${dir}`
    console.info(`Downloading ${specFilename}...`)
    const content = await fetch(SPEC_RAW_URL(commit, specFilename)).then((r) => r.text())
    await Deno.writeTextFile(schemaPath, content)
  }

  if (genClient && (force || !clientExists)) {
    console.info(`Generating client for ${specFilename}...`)
    await $`npx @oxide/openapi-gen-ts@latest ${schemaPath} ${dir}`
    await $`npx prettier --write --log-level error ${dir}`
  }

  return { schema: schemaPath, client: clientPath }
}

//////////////////////////////
// ACTUAL SCRIPT FOLLOWS
//////////////////////////////

if (!$.commandExistsSync('gh')) throw Error('Need gh (GitHub CLI)')

// prefer delta if it exists. https://dandavison.github.io/delta/
const diffTool = $.commandExistsSync('delta') ? 'delta' : 'diff'

/** Parse a PR number or commit SHA from a string argument */
function parseRef(arg: string): string | number {
  return /^\d+$/.test(arg) ? parseInt(arg, 10) : arg
}

type Format = 'ts' | 'schema'

async function runDiff(target: DiffTarget, format: Format, force: boolean) {
  let baseCommit: string, baseSchema: string
  let headCommit: string, headSchema: string

  if (target.type === 'single') {
    const { before, latest } = await getSchemaFiles(target.commit, true)
    baseCommit = headCommit = target.commit
    baseSchema = before!
    headSchema = latest
  } else {
    const [base, head] = await Promise.all([
      getSchemaFiles(target.base, false),
      getSchemaFiles(target.head, false),
    ])
    baseCommit = target.base
    headCommit = target.head
    baseSchema = base.latest
    headSchema = head.latest
  }

  const genClient = format === 'ts'
  const [basePaths, headPaths] = await Promise.all([
    fetchSpec(baseCommit, baseSchema, genClient, force),
    fetchSpec(headCommit, headSchema, genClient, force),
  ])

  const basePath = genClient ? basePaths.client : basePaths.schema
  const headPath = genClient ? headPaths.client : headPaths.schema

  await $`${diffTool} ${basePath} ${headPath} || true`
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
  - Optional: delta diff pager https://dandavison.github.io/delta/`
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
    const format = options.format as Format
    if (format !== 'ts' && format !== 'schema') {
      throw new ValidationError(`Invalid format: ${format}. Must be 'ts' or 'schema'`)
    }
    const target = await getDiffTarget(ref ? parseRef(ref) : undefined, ref2)
    await runDiff(target, format, options.force ?? false)
  })
  .parse(Deno.args)
