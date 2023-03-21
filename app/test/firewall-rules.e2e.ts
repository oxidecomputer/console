import { expect, expectNotVisible, expectVisible, test } from 'app/test/e2e'

test.beforeEach(async ({ page, createVpc, projectName, vpcName }) => {
  await createVpc(projectName, vpcName)
  await page.goto(`/orgs/abc/projects/${projectName}/vpcs/${vpcName}?tab=firewall-rules`)
})

test.fixme('Expect no firewall rules by default', async ({ page }) => {
  await expectVisible(page, ['text="No firewall rules"'])
})

test('Can create a firewall rule', async ({ page, genName }) => {
  await page.locator('text="New rule"').first().click()

  const modal = 'role=dialog[name="Add firewall rule"]'
  await expectVisible(page, [modal])

  const rule = genName('rule-1')
  await page.fill('input[name=name]', rule)
  await page.getByRole('radio', { name: 'Outgoing' }).click()
  await page.fill('role=spinbutton[name="Priority"]', '5')

  // check the UDP box
  await page.getByRole('checkbox', { name: 'UDP' }).click()

  // submit the form
  await page.locator('text="Add rule"').click()

  // modal closes again
  await expectNotVisible(page, [modal])

  // table refetches and now includes the new rule
  await expect(page.locator(`td >> text="${rule}"`)).toBeVisible()
})
