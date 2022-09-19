import { expectVisible, genName, test } from 'app/test/e2e'

const orgName = genName('firewall-rules-org')
const projectName = genName('firewall-rules-project')
let vpcName: string

test.beforeAll(async ({ createOrg, createProject }) => {
  await createOrg(orgName)
  await createProject(orgName, projectName)
})

test.beforeEach(async ({ page, createVpc }) => {
  vpcName = genName('firewall-rules-vpc')
  await createVpc(orgName, projectName, vpcName)
  await page.goto(
    `/orgs/${orgName}/projects/${projectName}/vpcs/${vpcName}?tab=firewall-rules`
  )
})

test('Expect no firewall rules by default', async ({ page }) => {
  await expectVisible(page, ['text=No firewall rules'])
})
