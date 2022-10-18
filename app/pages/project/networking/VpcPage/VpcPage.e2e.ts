import { expect, test } from '@playwright/test'

test.describe('VpcPage', () => {
  test('can nav to VpcPage from /', async ({ page }) => {
    await page.goto('/')
    await page.click('table :text("maze-war")')
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
    await page.fill('input[name=ipv4Block]', '10.1.1.2/24')
    await page.fill('input[name=name]', 'mock-subnet-2')
    await page.click('button:has-text("Create subnet")')

    await expect(rows).toHaveCount(2)

    await expect(rows.nth(0).locator('text="mock-subnet"')).toBeVisible()
    await expect(rows.nth(0).locator('text="10.1.1.1/24"')).toBeVisible()

    await expect(rows.nth(1).locator('text="mock-subnet-2"')).toBeVisible()
    await expect(rows.nth(1).locator('text="10.1.1.2/24"')).toBeVisible()
  })

  const defaultRules = ['allow-internal-inbound', 'allow-ssh', 'allow-icmp', 'allow-rdp']

  test('can create firewall rule', async ({ page }) => {
    await page.goto('/orgs/maze-war/projects/mock-project/vpcs/mock-vpc')
    await page.locator('text="Firewall Rules"').click()

    // default rules are all there
    for (const name of defaultRules) {
      await expect(page.locator(`text="${name}"`)).toBeVisible()
    }
    const rows = page.locator('tbody >> tr')
    await expect(rows).toHaveCount(4)

    const modal = page.locator('text="Add firewall rule"')
    await expect(modal).not.toBeVisible()

    // open modal
    await page.locator('text="New rule"').click()

    // modal is now open
    await expect(modal).toBeVisible()

    await page.fill('input[name=name]', 'my-new-rule')
    await page.locator('text=Outgoing').click()

    await page.fill('role=spinbutton[name="Priority"]', '5')

    // add target VPC "my-target-vpc"
    await page.locator('role=button[name="Target type"]').click()
    await page.locator('role=option[name="VPC"]').click()
    await page.fill('role=textbox[name="Target name"]', 'my-target-vpc')
    await page.locator('text="Add target"').click()

    // target is added to targets table
    await expect(page.locator('td:has-text("my-target-vpc")')).toBeVisible()

    // add host filter instance "host-filter-instance"
    await page.locator('role=button[name="Host type"]').click()
    await page.locator('role=option[name="Instance"]').click()
    await page.fill('role=textbox[name="Value"]', 'host-filter-instance')
    await page.locator('text="Add host filter"').click()

    // host is added to hosts table
    await expect(page.locator('td:has-text("host-filter-instance")')).toBeVisible()

    // TODO: test invalid port range once I put an error message in there
    await page.fill('role=textbox[name="Port filter"]', '123-456')
    await page.locator('text="Add port filter"').click()

    // port range is added to port ranges table
    await expect(page.locator('td:has-text("123-456")')).toBeVisible()

    // check the UDP box
    await page.locator('text=UDP').click()

    // submit the form
    await page.locator('text="Add rule"').click()

    // modal closes again
    await expect(modal).not.toBeVisible()

    // table refetches and now includes the new rule as well as the originals
    await expect(page.locator('td >> text="my-new-rule"')).toBeVisible()
    // target shows up in target cell
    await expect(page.locator('text=vpcmy-target-vpc')).toBeVisible()
    // other stuff filled out shows up in the filters column
    await expect(page.locator('text=instancehost-filter-instanceUDP123-456')).toBeVisible()

    await expect(rows).toHaveCount(5)
    for (const name of defaultRules) {
      await expect(page.locator(`text="${name}"`)).toBeVisible()
    }
  })

  test('can update firewall rule', async ({ page }) => {
    await page.goto('/orgs/maze-war/projects/mock-project/vpcs/mock-vpc')
    await page.locator('text="Firewall Rules"').click()

    const rows = await page.locator('tbody >> tr')
    await expect(rows).toHaveCount(4)

    // allow-icmp is the one we're doing to change
    const oldNameCell = page.locator('td >> text="allow-icmp"')
    expect(oldNameCell).toBeVisible()

    const newNameCell = page.locator('td >> text="new-rule-name"')
    expect(newNameCell).not.toBeVisible()

    const modal = page.locator('text="Edit rule"')
    await expect(modal).not.toBeVisible()

    // click more button on allow-icmp row to get menu, then click Edit
    await page
      .locator('role=row', { hasText: 'allow-icmp' })
      .locator('role=button[name="Row actions"]')
      .click()

    // filter visible to distinguish from all the hidden menus' Edit button
    await page.locator('text="Edit" >> visible=true').click()

    // modal is now open
    await expect(modal).toBeVisible()

    // TODO: get these by their label when that becomes easier to do

    // name is populated
    await expect(page.locator('input[name=name]')).toHaveValue('allow-icmp')

    // priority is populated
    await expect(page.locator('input[name=priority]')).toHaveValue('65534')

    // protocol is populated
    await expect(page.locator('label >> text=ICMP')).toBeChecked()
    await expect(page.locator('label >> text=TCP')).not.toBeChecked()
    await expect(page.locator('label >> text=UDP')).not.toBeChecked()

    // targets default vpc
    // screen.getByRole('cell', { name: 'vpc' })
    // screen.getByRole('cell', { name: 'default' })

    // update name
    await page.fill('input[name=name]', 'new-rule-name')

    // add host filter
    await page.locator('role=button[name="Host type"]').click()
    await page.locator('role=option[name="Instance"]').click()
    await page.fill('role=textbox[name="Value"]', 'edit-filter-instance')
    await page.locator('text="Add host filter"').click()

    // new host is added to hosts table
    await expect(page.locator('td:has-text("edit-filter-instance")')).toBeVisible()

    // submit the form
    await page.locator('text="Update rule"').click()

    // modal closes again
    await expect(modal).not.toBeVisible()

    // table refetches and now includes the updated rule name, not the old name
    await expect(newNameCell).toBeVisible()
    expect(oldNameCell).not.toBeVisible()

    await expect(rows).toHaveCount(4)

    // new target shows up in target cell
    await expect(page.locator('text=instanceedit-filter-instanceICMP')).toBeVisible()

    // other 3 rules are still there
    const rest = defaultRules.filter((r) => r !== 'allow-icmp')
    for (const name of rest) {
      await expect(page.locator(`text="${name}"`)).toBeVisible()
    }
  })
})
