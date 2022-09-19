import { expectVisible, test } from 'app/test/e2e'

test.beforeEach(async ({ page, createVpc, orgName, projectName, vpcName }) => {
  await createVpc(orgName, projectName, vpcName)
  await page.goto(
    `/orgs/${orgName}/projects/${projectName}/vpcs/${vpcName}?tab=firewall-rules`
  )
})

test('Expect no firewall rules by default', async ({ page }) => {
  await expectVisible(page, ['text="No firewall rules"'])
})
