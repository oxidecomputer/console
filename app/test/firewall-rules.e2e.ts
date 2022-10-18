import { expect, expectVisible, test } from 'app/test/e2e'

test.beforeEach(async ({ page, createVpc, orgName, projectName, vpcName }) => {
  await createVpc(orgName, projectName, vpcName)
  await page.goto(
    `/orgs/${orgName}/projects/${projectName}/vpcs/${vpcName}?tab=firewall-rules`
  )
})

test('Expect no firewall rules by default', async ({ page }) => {
  await expectVisible(page, ['text="No firewall rules"'])
})

test('Can create a firewall rule', async ({ page, genName }) => {
  const modal = page.locator('text="Add firewall rule"')
  await page.locator('text="New rule"').first().click()

  await expect(modal).toBeVisible()

  const rule = genName('rule-1')
  await page.fill('input[name=name]', rule)
  await page.getByRole('radio', { name: 'Outgoing' }).click()
  await page.fill('role=spinbutton[name="Priority"]', '5')

  // check the UDP box
  await page.getByRole('checkbox', { name: 'UDP' }).click()

  // submit the form
  await page.locator('text="Add rule"').click()

  // modal closes again
  await expect(modal).not.toBeVisible()

  // table refetches and now includes the new rule
  await expect(page.locator(`td >> text="${rule}"`)).toBeVisible()
})
