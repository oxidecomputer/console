import type { Page } from '@playwright/test'
import { test, expect } from '@playwright/test'
import { roundToNearestMinutesWithOptions } from 'date-fns/fp'

test.describe('VpcPage', () => {
  test('can nav from root by clicking', async ({ page }) => {
    await page.goto('/')
    await page.click('table :text("mock-project")')
    await page.click('a:has-text("Networking")')
    await page.click('a:has-text("mock-vpc")')
    await expect(page.locator('text=mock-subnet')).toBeVisible()
  })

  test('can create subnet', async ({ page }) => {
    await page.goto('/orgs/maze-war/projects/mock-project/vpcs/mock-vpc')
    // only one row in table, the default mock-subnet
    const rows = await page.locator('tbody >> tr')
    await expect(rows).toHaveCount(1)
    await expect(rows.nth(0).locator('text="mock-subnet"')).toBeVisible()

    // open modal, fill out form, submit
    await page.click('text=New subnet')
    await page.fill('text=IPv4 block', '1.1.1.2/24')
    await page.fill('input[name=name]', 'mock-subnet-2')
    await page.click('button:has-text("Create subnet")')

    await expect(rows).toHaveCount(2)

    await expect(rows.nth(0).locator('text="mock-subnet"')).toBeVisible()
    await expect(rows.nth(0).locator('text="1.1.1.1/24"')).toBeVisible()

    await expect(rows.nth(1).locator('text="mock-subnet-2"')).toBeVisible()
    await expect(rows.nth(1).locator('text="1.1.1.2/24"')).toBeVisible()
  })

  const defaultRules = [
    'allow-internal-inbound',
    'allow-ssh',
    'allow-icmp',
    'allow-rdp',
  ]

  test('can create firewall rule', async ({ page }) => {
    await page.goto('/orgs/maze-war/projects/mock-project/vpcs/mock-vpc')
    await page.locator('text="Firewall Rules"').click()

    // default rules are all there
    for (const name of defaultRules) {
      await expect(page.locator(`text="${name}"`)).toBeVisible()
    }
    const rows = await page.locator('tbody >> tr')
    await expect(rows).toHaveCount(4)

    const modal = page.locator('text="Create firewall rule"')
    expect(modal).not.toBeVisible()

    // open modal
    await page.locator('text="New rule"').click()

    // modal is now open
    await expect(modal).toBeVisible()

    await page.fill('input[name=name]', 'my-new-rule')
    await page.locator('text=Outgoing').click()

    await page.fill('text="Priority"', '5')

    // add target VPC "my-target-vpc"
    await page.locator('button:has-text("Target type")').click()
    await page.locator('[role=option] >> text="VPC"').click()
    await page.fill('text="Target name"', 'my-target-vpc')
    await page.locator('text="Add target"').click()

    // target is added to targets table
    await expect(page.locator('td:has-text("my-target-vpc")')).toBeVisible()

    // add host filter instance "host-filter-instance"
    await page.locator('button:has-text("Host type")').click()
    await page.locator('[role=option] >> text="Instance"').click()
    await page.fill('text="Value"', 'host-filter-instance')
    await page.locator('text="Add host filter"').click()

    // host is added to hosts table
    await expect(
      page.locator('td:has-text("host-filter-instance")')
    ).toBeVisible()

    // TODO: test invalid port range once I put an error message in there
    await page.fill('text="Port filter"', '123-456')
    await page.locator('text="Add port filter"').click()

    // port range is added to port ranges table
    await expect(page.locator('td:has-text("123-456")')).toBeVisible()

    // check the UDP box
    await page.locator('text=UDP').click()

    // submit the form
    await page.locator('text="Create rule"').click()

    // modal closes again
    await expect(modal).not.toBeVisible()

    // table refetches and now includes the new rule as well as the originals
    await expect(page.locator('td >> text="my-new-rule"')).toBeVisible()
    // target shows up in target cell
    await expect(page.locator('text=vpcmy-target-vpc')).toBeVisible()
    // other stuff filled out shows up in the filters column
    await expect(
      page.locator('text=instancehost-filter-instanceUDP123-456')
    ).toBeVisible()

    await expect(rows).toHaveCount(5)
    for (const name of defaultRules) {
      await expect(page.locator(`text="${name}"`)).toBeVisible()
    }
  })
})
