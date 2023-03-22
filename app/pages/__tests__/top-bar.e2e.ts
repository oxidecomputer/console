import { test } from '@playwright/test'

import { expectSimultaneous } from 'app/test/e2e'
import { pb } from 'app/util/path-builder'

test('Silo/system picker does not pop in', async ({ page }) => {
  await page.goto(pb.projects())

  // make sure the system policy call is prefetched properly so that the
  // silo/system picker doesn't pop in. if this turns out to be flaky, just
  // throw it out. it's extra as hell
  await expectSimultaneous(page, [
    'role=button[name="Switch between system and silo"]',
    'role=button[name="Switch project"]',
  ])
})
