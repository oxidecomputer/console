import { test } from '@playwright/test'

import { expectRowVisible, expectVisible } from './utils'

test('Sled inventory page', async ({ page }) => {
  await page.goto('/system/inventory/sleds')

  await expectVisible(page, ['role=heading[name*="Inventory"]'])

  const sledsTab = page.getByRole('tab', { name: 'Sleds' })
  expect(sledsTab).toBeVisible()
  expect(sledsTab).toHaveClass('.is-selected')

  const sledsTable = page.getByRole('table')
  await expectRowVisible(sledsTable, {
    // TODO: Once sled location is piped through this'll need to be dynamic
    location: 'SLD0',
  })

  // Visit the sled detail page of the first sled
  sledsTable.getByRole('link').first().click()

  // TODO: Once sled location is piped through this'll need to be dynamic
  await expectVisible(page, ['role=heading[name*="Sled 0"'])

  const instancesTab = page.getByRole('tab', { name: 'Instances' })
  expect(instancesTab).toBeVisible()
  expect(instancesTab).toHaveClass('.is-selected')

  const instancesTable = page.getByRole('table')
  await expectRowVisible(instancesTable, {
    name: 'default-silo / mock-project\ndb1',
  })
})
