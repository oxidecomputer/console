/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { $ } from 'jsr:@david/dax@0.41.0'

export async function pickPr(repo: string): Promise<number> {
  if (!$.commandExistsSync('gh')) throw new Error('Need gh (GitHub CLI)')
  if (!$.commandExistsSync('fzf')) throw new Error('Need fzf to pick a PR')

  const selection = await $`gh pr list --repo ${repo} --limit 100
      --json number,title,updatedAt,author
      --template '{{range .}}{{tablerow .number .title .author.name (timeago .updatedAt)}}{{end}}'`
    .pipe($`fzf --height 25% --reverse`)
    .text()
  const prNumber = selection.match(/^\d+/)?.[0]
  if (!prNumber) {
    throw new Error('Expected the selected row to start with a PR number')
  }
  return Number(prNumber)
}

export async function isJjRepository(repoRoot: string): Promise<boolean> {
  return (
    $.commandExistsSync('jj') &&
    (await $`jj root`.cwd(repoRoot).noThrow().stdout('null').stderr('null')).code === 0
  )
}

export async function resolveLocalCommit(
  repoRoot: string,
  ref: string,
  isJj?: boolean
): Promise<string> {
  const useJj = isJj ?? (await isJjRepository(repoRoot))
  if (useJj) {
    try {
      const template = 'commit_id ++ "\\n"'
      const commits = (
        await $`jj log --revisions ${ref} --no-graph --template ${template}`
          .cwd(repoRoot)
          .stderr('null')
          .text()
      )
        .trim()
        .split('\n')
        .filter(Boolean)
      if (commits.length !== 1) {
        throw new Error(`Revision '${ref}' resolved to ${commits.length} commits`)
      }
      return commits[0]
    } catch (e) {
      if (e instanceof Error && e.message.startsWith('Revision')) throw e
      // A newly fetched Git commit may not have been imported into jj yet.
    }
  }

  try {
    // Pass the peel as a single argument so ^{commit} isn't brace-expanded.
    const rev = `${ref}^{commit}`
    return (
      await $`git rev-parse --verify ${rev}`.cwd(repoRoot).stderr('null').text()
    ).trim()
  } catch {
    throw new Error(`Could not resolve revision '${ref}'`)
  }
}
