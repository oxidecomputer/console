#! /usr/bin/env -S deno run --allow-run=gh,git,jj,npm,diff,delta,fzf --allow-read --allow-write --allow-env

/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Command, ValidationError } from 'jsr:@cliffy/command@1.0.0'
import { $ } from 'jsr:@david/dax@0.41.0'
import { exists } from 'jsr:@std/fs@1.0'

import { pickPr, resolveLocalCommit } from './common.ts'

const REPO = 'oxidecomputer/console'
const CACHE_ROOT = '/tmp/bundle-size-diff'
const SMALL_CHANGE_KB = 0.05

type Pr = {
  baseRefOid: string
  headRefOid: string
  number: number
}

type DiffTarget = {
  baseCommit: string
  headCommit: string
}

async function getPr(number: number): Promise<Pr> {
  const result: unknown = await $`gh pr view ${number} --repo ${REPO}
      --json number,baseRefOid,headRefOid`.json()

  if (
    typeof result !== 'object' ||
    result === null ||
    !('number' in result) ||
    typeof result.number !== 'number' ||
    !('baseRefOid' in result) ||
    typeof result.baseRefOid !== 'string' ||
    !('headRefOid' in result) ||
    typeof result.headRefOid !== 'string'
  ) {
    throw new Error(`Unexpected response while resolving PR #${number}`)
  }

  return {
    number: result.number,
    baseRefOid: result.baseRefOid,
    headRefOid: result.headRefOid,
  }
}

async function hasCommit(repoRoot: string, commit: string): Promise<boolean> {
  const rev = `${commit}^{commit}`
  return (
    (await $`git cat-file -e ${rev}`.cwd(repoRoot).noThrow().stdout('null').stderr('null'))
      .code === 0
  )
}

async function fetchMissingCommits(repoRoot: string, pr: Pr): Promise<void> {
  if (!(await hasCommit(repoRoot, pr.baseRefOid))) {
    console.error(`Fetching base ${pr.baseRefOid.slice(0, 8)}...`)
    await $`git fetch --quiet origin ${pr.baseRefOid}`.cwd(repoRoot)
  }

  if (!(await hasCommit(repoRoot, pr.headRefOid))) {
    console.error(`Fetching head ${pr.headRefOid.slice(0, 8)}...`)
    const pullRef = `refs/pull/${pr.number}/head`
    await $`git fetch --quiet origin ${pullRef}`.cwd(repoRoot)
  }
}

async function resolveTarget(
  repoRoot: string,
  ref1?: string,
  ref2?: string
): Promise<DiffTarget> {
  if (ref1 === undefined) {
    ref1 = String(await pickPr(REPO))
  }

  if (ref2 === undefined) {
    if (!/^\d+$/.test(ref1)) {
      throw new ValidationError(
        'A single argument must be a console PR number; pass two arguments to compare revisions'
      )
    }
    if (!$.commandExistsSync('gh')) throw new Error('Need gh (GitHub CLI)')

    const pr = await getPr(Number(ref1))
    await fetchMissingCommits(repoRoot, pr)
    return { baseCommit: pr.baseRefOid, headCommit: pr.headRefOid }
  }

  // jj may snapshot the working copy while resolving a revision, so avoid
  // running two jj processes against it concurrently.
  const baseCommit = await resolveLocalCommit(repoRoot, ref1)
  const headCommit = await resolveLocalCommit(repoRoot, ref2)
  return { baseCommit, headCommit }
}

async function addWorktree(repoRoot: string, dir: string, commit: string): Promise<void> {
  await $`git worktree add --detach --quiet ${dir} ${commit}`.cwd(repoRoot)
}

function extractBundleSizes(output: string): string {
  const lines = output.split('\n')
  const start = lines.findIndex((line) => line === 'computing gzip size...')
  const end = lines.findIndex(
    (line, index) => index > start && line.startsWith('✓ built in')
  )

  if (start === -1 || end === -1) {
    throw new Error('Could not find the bundle size table in npm run build output')
  }

  return (
    lines
      .slice(start + 1, end)
      // Content changes cascade new hashes through importing chunks. Keep a
      // fixed-width placeholder so hash-only changes disappear from the diff.
      .map((line) => line.replace(/-[\w-]{8}(?=\.[a-z0-9]+(?:\s|$))/i, '-HASHHASH'))
      // Vite sorts by size, which makes unchanged rows look moved when a
      // nearby chunk changes. Filename order is stable across builds.
      .sort()
      .join('\n')
      .trimEnd() + '\n'
  )
}

type BundleRow = {
  file: string
  line: string
  sizes: number[]
}

function parseBundleRow(line: string): BundleRow | undefined {
  const file = line.match(/^\S+/)?.[0]
  const sizes = [...line.matchAll(/([\d,]+\.\d+) kB/g)].map((match) =>
    Number(match[1].replaceAll(',', ''))
  )
  return file && sizes.length > 0 ? { file, line, sizes } : undefined
}

function suppressSmallChanges(base: string, head: string): string {
  const baseRows = new Map<string, BundleRow[]>()
  for (const line of base.trimEnd().split('\n')) {
    const row = parseBundleRow(line)
    if (!row) continue
    const rows = baseRows.get(row.file) ?? []
    rows.push(row)
    baseRows.set(row.file, rows)
  }

  const lines = head.trimEnd().split('\n')
  return (
    lines
      .map((line) => {
        const headRow = parseBundleRow(line)
        const baseRow = headRow && baseRows.get(headRow.file)?.shift()
        const isSmallChange =
          baseRow &&
          baseRow.sizes.length === headRow.sizes.length &&
          baseRow.sizes.every(
            (size, index) => Math.abs(size - headRow.sizes[index]) <= SMALL_CHANGE_KB + 1e-9
          )
        return isSmallChange ? baseRow.line : line
      })
      .join('\n') + '\n'
  )
}

async function ensureBuild(
  repoRoot: string,
  dir: string,
  commit: string,
  label: string,
  force: boolean
): Promise<string> {
  const cacheDir = `${CACHE_ROOT}/${commit}`
  const outputPath = `${cacheDir}/build-output.txt`
  if (!force && (await exists(outputPath))) {
    console.error(`Using cached ${label} build...`)
    return extractBundleSizes(await Deno.readTextFile(outputPath))
  }

  await addWorktree(repoRoot, dir, commit)
  try {
    console.error(`Installing ${label} dependencies...`)
    await $`npm ci --no-audit --no-fund`.cwd(dir).env('HUSKY', '0').stdout('null')

    console.error(`Building ${label}...`)
    const output = await $`npm run build`.cwd(dir).text()
    const sizes = extractBundleSizes(output)
    await Deno.mkdir(cacheDir, { recursive: true })
    await Deno.writeTextFile(outputPath, output)
    return sizes
  } finally {
    console.error(`Cleaning up ${label} worktree...`)
    await $`git worktree remove --force ${dir}`.cwd(repoRoot).noThrow().quiet()
  }
}

async function runDiff(base: string, head: string, baseLabel: string, headLabel: string) {
  const dir = await Deno.makeTempDir({ prefix: 'bundle-size-diff-output-' })
  const basePath = `${dir}/base.txt`
  const headPath = `${dir}/head.txt`

  try {
    await Promise.all([
      Deno.writeTextFile(basePath, base),
      Deno.writeTextFile(headPath, head),
    ])

    // Match api-diff: render through delta for interactive use and leave plain
    // unified output intact when piping the result elsewhere.
    const useDelta = $.commandExistsSync('delta') && Deno.stdout.isTerminal()
    const diff =
      $`diff -u -L ${baseLabel} -L ${headLabel} ${basePath} ${headPath}`.noThrow()
    await (useDelta ? diff.pipe($`delta`) : diff)
  } finally {
    await Deno.remove(dir, { recursive: true })
  }
}

await new Command()
  .name('bundle-size-diff')
  .description(
    `Build two console revisions and display a unified diff of Vite's
bundle size table.

Arguments:
  No args         Pick a console PR with fzf
  <pr>            Compare the base and head of a console PR
  <base> <head>   Compare two local git or jj revisions

Dependencies:
  - Deno
  - GitHub CLI (gh) for PRs
  - Git
  - Node.js and npm
  - Optional: delta diff pager https://dandavison.github.io/delta/
  - Optional: fzf for PR picker https://github.com/junegunn/fzf`
  )
  .helpOption('-h, --help', 'Show help')
  .option('--force', 'Rebuild even if output is cached')
  .arguments('[ref1:string] [ref2:string]')
  .action(async (options, ref1?: string, ref2?: string) => {
    let tempRoot: string | undefined

    try {
      const repoRoot = (await $`git rev-parse --show-toplevel`.text()).trim()
      const target = await resolveTarget(repoRoot, ref1, ref2)

      tempRoot = await Deno.makeTempDir({ prefix: 'bundle-size-diff-' })
      const baseDir = `${tempRoot}/base`
      const headDir = `${tempRoot}/head`

      const baseShort = target.baseCommit.slice(0, 8)
      const headShort = target.headCommit.slice(0, 8)
      const force = options.force ?? false
      const base = await ensureBuild(
        repoRoot,
        baseDir,
        target.baseCommit,
        `base (${baseShort})`,
        force
      )
      const head = await ensureBuild(
        repoRoot,
        headDir,
        target.headCommit,
        `head (${headShort})`,
        force
      )
      await runDiff(
        base,
        suppressSmallChanges(base, head),
        `a/${baseShort}/bundle-size`,
        `b/${headShort}/bundle-size`
      )
    } catch (e) {
      console.error(`error: ${e instanceof Error ? e.message : String(e)}`)
      Deno.exitCode = 1
    } finally {
      if (tempRoot) await Deno.remove(tempRoot, { recursive: true }).catch(() => {})
    }
  })
  .parse(Deno.args)
