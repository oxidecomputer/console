import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { relative } from 'node:path'

/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { FullConfig, FullResult, Reporter, Suite } from '@playwright/test/reporter'
import stripAnsi from 'strip-ansi'

// Compact plain-text reporter for local runs. Writes a timestamped file to
// `.e2e-logs/` per run with a summary line and one block per failed or flaky
// test (ANSI stripped). Cheap for an LLM agent to read end-to-end.
// Latest: `ls .e2e-logs | tail -1`.

export default class CompactReporter implements Reporter {
  private suite!: Suite
  private rootDir = ''

  onBegin(config: FullConfig, suite: Suite) {
    this.suite = suite
    this.rootDir = config.rootDir
  }

  async onEnd(result: FullResult) {
    const tests = this.suite.allTests()
    const counts = {
      total: tests.length,
      passed: tests.filter((t) => t.outcome() === 'expected').length,
      failed: tests.filter((t) => t.outcome() === 'unexpected').length,
      flaky: tests.filter((t) => t.outcome() === 'flaky').length,
      skipped: tests.filter((t) => t.outcome() === 'skipped').length,
    }

    const lines = [
      `status: ${result.status}  total=${counts.total} passed=${counts.passed} failed=${counts.failed} flaky=${counts.flaky} skipped=${counts.skipped}`,
    ]

    for (const t of tests) {
      const outcome = t.outcome()
      if (outcome !== 'unexpected' && outcome !== 'flaky') continue
      const last = t.results[t.results.length - 1]
      const err = stripAnsi(last?.error?.message ?? last?.errors[0]?.message ?? '')
      const file = relative(this.rootDir, t.location.file)
      const title = t.titlePath().slice(1).join(' › ')
      lines.push(
        '',
        `── ${outcome.toUpperCase()}  ${file}:${t.location.line}  ${title}`,
        `   attempts=${t.results.length} duration=${Math.round(last?.duration ?? 0)}ms`,
        '',
        err
      )
    }

    const stamp = new Date().toISOString().replace(/[:.]/g, '-')
    mkdirSync('.e2e-logs', { recursive: true })
    writeFileSync(`.e2e-logs/${stamp}.log`, lines.join('\n') + '\n')

    // Keep only the 10 most recent runs. Timestamps sort lexicographically.
    const KEEP = 10
    const old = readdirSync('.e2e-logs')
      .filter((f) => f.endsWith('.log'))
      .sort()
      .slice(0, -KEEP)
    for (const f of old) rmSync(`.e2e-logs/${f}`)
  }
}
