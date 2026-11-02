#! /usr/bin/env node

/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'

import { Command, Option } from '@commander-js/extra-typings'
import $ from 'dax'

import { isJjRepository, pickPr, resolveLocalCommit } from './common.ts'

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

const SPEC_RAW_URL = (ref: string, path: string) =>
  `https://raw.githubusercontent.com/oxidecomputer/omicron/${ref}/${path}`

async function resolveCommit(ref?: string | number): Promise<string> {
  if (ref === undefined) return resolveCommit(await pickPr('oxidecomputer/omicron'))
  if (typeof ref === 'number') {
    console.error(`Resolving PR #${ref} to commit...`)
    const query = `{
      repository(owner: "oxidecomputer", name: "omicron") {
        pullRequest(number: ${ref}) { headRefOid }
      }
    }`
    const pr = await $`gh api graphql -f query=${query}`.json()
    return pr.data.repository.pullRequest.headRefOid
  }
  // Full SHA is already resolved
  if (/^[0-9a-f]{40}$/.test(ref)) return ref
  // Resolve branches, tags, and short SHAs to a full commit SHA so the
  // cache directory is keyed by immutable commit, not a moving ref
  console.error(`Resolving ${ref} to commit...`)
  try {
    const sha = await $`gh api repos/oxidecomputer/omicron/commits/${ref} --jq .sha`
      .stderr('null')
      .text()
    return sha.trim()
  } catch {
    throw new Error(`Ref '${ref}' not found in oxidecomputer/omicron`)
  }
}

/** 5 or fewer digits is a PR number; longer digit strings are short SHAs */
const normalizeRef = (ref?: string | number) =>
  typeof ref === 'string' && /^\d{1,5}$/.test(ref) ? parseInt(ref, 10) : ref

const LEGACY_SPEC_PATH = 'openapi/nexus.json'

/**
 * A source of schema files. The remote source reads from GitHub; the local
 * source reads from the git repo in the current directory. Both expose the
 * same primitives so the diff logic doesn't care where schemas come from.
 */
type Source = {
  /** Resolve a ref (PR number, SHA, branch, jj revset, or undefined for the default) to a commit id */
  resolveCommit: (ref?: string | number) => Promise<string>
  /** List schema filenames under openapi/nexus at a commit, or null if the dir is absent */
  listSchemaNames: (commit: string) => Promise<string[] | null>
  /** Read the filename that nexus-latest.json points to at a commit */
  readLatestPointer: (commit: string) => Promise<string>
  /** Read spec content at a commit (the remote source follows gitstub references) */
  readSpec: (commit: string, specPath: string) => Promise<string>
}

/** Subset of the GitHub contents API entry we rely on */
type GhContent = { name: string; download_url: string }

// the contents listing is hit twice per ref (names + latest pointer), so memoize
const schemaDirCache = new Map<string, GhContent[] | null>()
async function listSchemaDir(ref: string): Promise<GhContent[] | null> {
  if (schemaDirCache.has(ref)) return schemaDirCache.get(ref)!
  let result: GhContent[] | null
  try {
    result = await $`gh api ${SPEC_DIR_URL(ref)}`.stderr('null').json()
  } catch {
    result = null
  }
  schemaDirCache.set(ref, result)
  return result
}

const remoteSource: Source = {
  resolveCommit,
  listSchemaNames: async (commit) => {
    const contents = await listSchemaDir(commit)
    return contents?.map((f) => f.name) ?? null
  },
  readLatestPointer: async (commit) => {
    const contents = await listSchemaDir(commit)
    const latestLink = contents?.find((f) => f.name === 'nexus-latest.json')
    // callers verify nexus-latest.json exists before calling, but guard anyway
    if (!latestLink) throw new Error(`nexus-latest.json not found at ${commit}`)
    return (await fetch(latestLink.download_url).then((r) => r.text())).trim()
  },
  readSpec: async (commit, specPath) => {
    const url = await resolveSpecUrl(commit, specPath)
    const resp = await fetch(url)
    if (!resp.ok) {
      throw new Error(
        `Failed to download ${specPath} at ${commit}: ${resp.status} ${resp.statusText}`
      )
    }
    return resp.text()
  },
}

/** Read schemas from the git repo in the current directory (run from an omicron checkout) */
async function createLocalSource(): Promise<Source> {
  if (!$.commandExistsSync('git')) throw new Error('--local requires git')
  const repoRoot = process.cwd()
  // jj's working copy is always a commit, so in a jj repo @ is the natural
  // default and reflects in-progress (even uncommitted) work. Plain git uses HEAD.
  const isJj = await isJjRepository(repoRoot)

  const gitShow = (target: string) => $`git show ${target}`.text()

  return {
    resolveCommit: async (ref) => {
      if (typeof ref === 'number')
        throw new Error(
          `PR numbers aren't supported in --local mode; pass a git or jj revision`
        )
      if (ref === undefined) {
        const def = isJj ? '@' : 'HEAD'
        console.error(`No ref given, defaulting to ${def} (comparing against its parent)`)
        return resolveLocalCommit(repoRoot, def, isJj)
      }
      return resolveLocalCommit(repoRoot, ref, isJj)
    },
    listSchemaNames: async (commit) => {
      const out = (
        await $`git ls-tree --name-only ${commit} -- openapi/nexus/`.text()
      ).trim()
      if (!out) return null
      return out.split('\n').map((p) => p.replace(/^openapi\/nexus\//, ''))
    },
    readLatestPointer: (commit) =>
      gitShow(`${commit}:openapi/nexus/nexus-latest.json`).then((s) => s.trim()),
    // local mode only diffs current schemas, which are always real files at
    // each commit (the versioned gitstub files are never read), so unlike the
    // remote source this doesn't need to follow gitstub references
    readSpec: (commit, specPath) => gitShow(`${commit}:${specPath}`),
  }
}

/** First parent of a commit, via git (used for local single-ref vs-parent diffs) */
async function gitParent(commit: string): Promise<string> {
  const rev = `${commit}^`
  try {
    return (await $`git rev-parse --verify ${rev}`.stderr('null').text()).trim()
  } catch {
    throw new Error(`${commit} has no parent commit to compare against`)
  }
}

async function getLatestSchema(source: Source, ref: string) {
  const names = await source.listSchemaNames(ref)
  if (!names) {
    console.error(`No openapi/nexus/ dir at ${ref}, falling back to ${LEGACY_SPEC_PATH}`)
    return LEGACY_SPEC_PATH
  }
  if (!names.includes('nexus-latest.json')) {
    const schemaFiles = names.filter((n) => n.startsWith('nexus-')).sort()
    throw new Error(
      `nexus-latest.json not found at ref '${ref}'. ` +
        `Available schemas: ${schemaFiles.join(', ') || '(none)'}`
    )
  }
  const latest = await source.readLatestPointer(ref)
  return `openapi/nexus/${latest}`
}

/** When diffing a single ref, we diff its latest schema against the previous one */
async function getLatestAndPreviousSchema(source: Source, ref: string) {
  const names = await source.listSchemaNames(ref)
  if (!names) {
    throw new Error(
      `No openapi/nexus/ dir at ref '${ref}'. ` +
        `Single-ref mode requires the versioned schema directory.`
    )
  }

  const schemaFiles = names
    .filter((n) => n.startsWith('nexus-') && n !== 'nexus-latest.json')
    .sort()

  if (!names.includes('nexus-latest.json')) {
    throw new Error(
      `nexus-latest.json not found at ref '${ref}'. ` +
        `Available schemas: ${schemaFiles.join(', ') || '(none)'}`
    )
  }
  const latest = await source.readLatestPointer(ref)

  const latestIndex = schemaFiles.indexOf(latest)
  if (latestIndex === -1)
    throw new Error(`Latest schema ${latest} not found in dir at ref '${ref}'`)
  if (latestIndex === 0) throw new Error(`No previous schema version found at ref '${ref}'`)

  return {
    previous: `openapi/nexus/${schemaFiles[latestIndex - 1]}`,
    latest: `openapi/nexus/${latest}`,
  }
}

/** Compare the latest (current) schema at two commits */
async function diffLatest(
  source: Source,
  baseRef: string,
  headRef: string
): Promise<DiffTarget> {
  console.error(`Comparing ${baseRef} vs ${headRef}`)
  const [baseSchema, headSchema] = await Promise.all([
    getLatestSchema(source, baseRef),
    getLatestSchema(source, headRef),
  ])
  return { baseCommit: baseRef, baseSchema, headCommit: headRef, headSchema }
}

async function resolveTarget(
  source: Source,
  local: boolean,
  ref1?: string | number,
  ref2?: string
): Promise<DiffTarget> {
  // PR numbers are a remote concept; locally everything is a git/jj revision
  const norm = (ref?: string | number) => (local ? ref : normalizeRef(ref))

  // Two refs: compare latest schema on each
  if (ref2 !== undefined) {
    const [baseRef, headRef] = await Promise.all([
      source.resolveCommit(norm(ref1)),
      source.resolveCommit(norm(ref2)),
    ])
    return diffLatest(source, baseRef, headRef)
  }

  // Local single ref: compare this commit's current schema against its parent's
  if (local) {
    const headRef = await source.resolveCommit(norm(ref1))
    return diffLatest(source, await gitParent(headRef), headRef)
  }

  // Remote single ref: compare previous schema to latest within that ref
  const ref = await source.resolveCommit(norm(ref1))
  const { previous, latest } = await getLatestAndPreviousSchema(source, ref)
  return {
    baseCommit: ref,
    baseSchema: previous,
    headCommit: ref,
    headSchema: latest,
  }
}

/** Resolve the raw URL for a spec file, following gitstub references */
async function resolveSpecUrl(commit: string, specFilename: string): Promise<string> {
  if (!specFilename.endsWith('.gitstub')) {
    return SPEC_RAW_URL(commit, specFilename)
  }
  // gitstub files contain "<commit>:<path>\n" — follow the reference
  const stubResp = await fetch(SPEC_RAW_URL(commit, specFilename))
  if (!stubResp.ok) {
    throw new Error(
      `Failed to download stub ${specFilename} at ${commit}: ${stubResp.status} ${stubResp.statusText}`
    )
  }
  const stub = (await stubResp.text()).trim()
  const match = stub.match(/^([0-9a-f]+):(.+)$/)
  if (!match) throw new Error(`Unexpected gitstub format in ${specFilename}: ${stub}`)
  const [, stubCommit, stubPath] = match
  console.error(`  Resolved gitstub → ${stubCommit.slice(0, 10)}:${stubPath}`)
  return SPEC_RAW_URL(stubCommit, stubPath)
}

async function ensureSchema(
  source: Source,
  commit: string,
  specFilename: string,
  force: boolean
) {
  const dir = `/tmp/api-diff/${commit}/${specFilename}`
  const schemaPath = `${dir}/spec.json`
  if (force || !existsSync(schemaPath)) {
    await mkdir(dir, { recursive: true })
    console.error(`Loading ${specFilename}...`)
    const content = await source.readSpec(commit, specFilename)
    await writeFile(schemaPath, content)
  }
  return schemaPath
}

const OXFMT_CONFIG = '/tmp/api-diff/oxfmt.json'

/**
 * ensureClient runs for base and head in parallel, so install its npx deps
 * once up front — concurrent npx installs of the same package race the npm
 * cache and each prompt for confirmation. --yes skips the install prompt.
 */
async function ensureClientTools() {
  await $`npx --yes --package @oxide/openapi-gen-ts@latest --package oxfmt true`
  await mkdir('/tmp/api-diff', { recursive: true })
  // an explicit (empty) config silences oxfmt's "No config found" warning
  await writeFile(OXFMT_CONFIG, '{}\n')
}

async function ensureClient(schemaPath: string, force: boolean) {
  const dir = schemaPath.replace(/\/spec\.json$/, '')
  const clientPath = `${dir}/Api.ts`
  if (force || !existsSync(clientPath)) {
    console.error(`Generating client...`)
    await $`npx --yes @oxide/openapi-gen-ts@latest ${schemaPath} ${dir}`
    await $`npx --yes oxfmt -c ${OXFMT_CONFIG} ${dir}`
  }
  return clientPath
}

//////////////////////////////
// ACTUAL SCRIPT FOLLOWS
//////////////////////////////

/** Run diff with clean labels (version extracted from spec filename) */
async function runDiff(
  base: string,
  head: string,
  baseVersion: string,
  headVersion: string
) {
  const filename = base.endsWith('spec.json') ? 'spec.json' : 'Api.ts'
  // prefer delta if it exists and output is a terminal, otherwise use diff
  // https://dandavison.github.io/delta/
  const useDelta = $.commandExistsSync('delta') && process.stdout.isTTY

  // use -L to set labels, extracting version from spec filename (e.g., nexus-2026010300.0.0-7599dd.json)
  const getVersion = (spec: string) =>
    spec.match(/nexus-([^.]+\.[^.]+\.[^.]+)/)?.[1] ?? 'unversioned'
  const baseLabel = `a/${getVersion(baseVersion)}/${filename}`
  const headLabel = `b/${getVersion(headVersion)}/${filename}`
  // diff exits 1 when files differ, so noThrow() to avoid breaking the pipe
  const diff = $`diff -u -L ${baseLabel} -L ${headLabel} ${base} ${head}`.noThrow()
  await (useDelta ? diff.pipe($`delta`) : diff)
}

await new Command()
  .name('api-diff')
  .description('Display changes to API client or schema caused by a given Omicron PR.')
  .addHelpText(
    'after',
    `
Arguments:
  No args          Interactive PR picker (or, with --local, the default ref)
  <ref>            PR number, commit SHA, branch, or tag
  <base> <head>    Two refs, compare latest schema on each

With --local, schemas are read from the git repo in the current directory
(run it from your omicron checkout) instead of GitHub, and every diff compares
the current schema (nexus-latest) at each commit:
  No args / <ref>  Compare a commit's schema against its parent's
                   (default ref is @ in a jj repo, otherwise HEAD)
  <base> <head>    Compare the schema at each ref
Refs are git revisions (jj revsets in a jj repo). PR numbers are not available.

Dependencies:
  - Node.js
  - GitHub CLI (gh), or git in the current directory with --local
  - Optional: delta diff pager https://dandavison.github.io/delta/
  - Optional: fzf for PR picker https://github.com/junegunn/fzf`
  )
  .option('--local', 'Read schemas from the repo in the current directory')
  .option('--force', 'Redo everything even if cached')
  .addOption(
    new Option('-f, --format <format>', 'Output format')
      .choices(['ts', 'schema'] as const)
      .default('ts' as const)
  )
  .argument('[ref1]')
  .argument('[ref2]')
  .showHelpAfterError()
  .action(async (ref, ref2, options) => {
    try {
      const local = options.local ?? false
      const force = options.force ?? false
      if (!local && !$.commandExistsSync('gh')) throw new Error('Need gh (GitHub CLI)')
      const source = local ? await createLocalSource() : remoteSource

      const target = await resolveTarget(source, local, ref, ref2)

      const [baseSchema, headSchema] = await Promise.all([
        ensureSchema(source, target.baseCommit, target.baseSchema, force),
        ensureSchema(source, target.headCommit, target.headSchema, force),
      ])

      if (options.format === 'schema') {
        await runDiff(baseSchema, headSchema, target.baseSchema, target.headSchema)
      } else {
        await ensureClientTools()
        const [baseClient, headClient] = await Promise.all([
          ensureClient(baseSchema, force),
          ensureClient(headSchema, force),
        ])
        await runDiff(baseClient, headClient, target.baseSchema, target.headSchema)
      }
    } catch (e) {
      console.error(`error: ${e instanceof Error ? e.message : String(e)}`)
      process.exit(1)
    }
  })
  .parseAsync()
