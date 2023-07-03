import { expect, test } from '@playwright/test'

import { expectRowVisible, expectVisible } from './utils'

test('Sled inventory page', async ({ page }) => {
  await page.goto('/system/inventory/sleds')

  await expectVisible(page, ['role=heading[name*="Inventory"]'])

  const sledsTab = page.getByRole('tab', { name: 'Sleds' })
  await expect(sledsTab).toBeVisible()
  await expect(sledsTab).toHaveClass(/is-selected/)

  const sledsTable = page.getByRole('table')
  // Visit the sled detail page of the first sled
  await sledsTable.getByRole('link').first().click()

  // TODO: Once sled location is piped through this'll need to be dynamic
  await expectVisible(page, ['role=heading[name*="Sled"]'])

  const instancesTab = page.getByRole('tab', { name: 'Instances' })
  await expect(instancesTab).toBeVisible()
  await expect(instancesTab).toHaveClass(/is-selected/)

  const instancesTable = page.getByRole('table')
  await expectRowVisible(instancesTable, {
    name: 'default-silo / mock-projectdb1',
  })
})
