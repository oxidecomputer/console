import { test } from '@playwright/test'

import { expectSimultaneous } from './utils'

test('Silo/system picker does not pop in', async ({ page }) => {
  await page.goto('/projects')

  // make sure the system policy call is prefetched properly so that the
  // silo/system picker doesn't pop in. if this turns out to be flaky, just
  // throw it out. it's extra as hell
  await expectSimultaneous(page, [
    'role=button[name="Switch between system and silo"]',
    'role=button[name="Switch project"]',
  ])
})
