import { physicalDisks } from '@oxide/api-mocks'

import { expect, expectRowVisible, expectVisible, test } from './utils'

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

test('Disk inventory page', async ({ page }) => {
  await page.goto('/system/inventory/disks')

  await expectVisible(page, ['role=heading[name*="Inventory"]'])

  const disksTab = page.getByRole('tab', { name: 'Disks' })
  await expect(disksTab).toBeVisible()
  await expect(disksTab).toHaveClass(/is-selected/)

  const table = page.getByRole('table')
  await expectRowVisible(table, { id: physicalDisks[0].id, 'Form factor': 'U.2' })
  await expectRowVisible(table, { id: physicalDisks[3].id, 'Form factor': 'M.2' })
})
