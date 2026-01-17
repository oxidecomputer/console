import { mkdirSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { test as base } from '@playwright/test'
import v8toIstanbul from 'v8-to-istanbul'

const baseURL = 'http://localhost:4009'

export const test = base.extend({
  collectCoverage: [
    async ({ page }, use) => {
      await page.coverage.startJSCoverage()

      await use(null)

      const coverage = await page.coverage.stopJSCoverage()
      mkdirSync('.nyc_output', { recursive: true })

      const allCoverage: Record<string, any> = {}

      for (const entry of coverage) {
        const localPath = entry.url.replace(baseURL, '').split('?')[0]
        const cleanPath = localPath.startsWith('/') ? localPath.slice(1) : localPath
        const filePath = resolve(cleanPath)

        const converter = v8toIstanbul(filePath)
        try {
          await converter.load()
          converter.applyCoverage(entry.functions)
          Object.assign(allCoverage, converter.toIstanbul())
        } catch (e) {
          console.warn(
            `Failed to convert coverage for ${filePath}:`,
            e instanceof Error ? e.message : String(e)
          )
        }
      }

      writeFileSync(resolve('.nyc_output/coverage.json'), JSON.stringify(allCoverage))
    },
    { auto: true },
  ],
})

export { expect } from '@playwright/test'
