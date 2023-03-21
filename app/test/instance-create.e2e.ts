import { images } from '@oxide/api-mocks'

import { expectVisible, test } from 'app/test/e2e'
import { pb } from 'app/util/path-builder'

test.beforeEach(async ({ createProject, orgName, projectName }) => {
  await createProject(orgName, projectName)
})

test('can invoke instance create form from instances page', async ({
  page,
  orgName,
  projectName,
  genName,
}) => {
  await page.goto(pb.instances({ project: projectName }))
  await page.locator('text="New Instance"').click()

  await expectVisible(page, [
    'role=heading[name*="Create instance"]',
    'role=heading[name="Hardware"]',
    'role=heading[name="Boot disk"]',
    'role=heading[name="Additional disks"]',
    'role=heading[name="Networking"]',
    'role=textbox[name="Name"]',
    'role=textbox[name="Description"]',
    'role=textbox[name="Disk name"]',
    'role=spinbutton[name="Disk size (GiB)"]',
    'role=radiogroup[name="Network interface"]',
    'role=textbox[name="Hostname"]',
    'role=button[name="Create instance"]',
  ])

  const instanceName = genName('instance')
  await page.fill('input[name=name]', instanceName)
  await page.locator('.ox-radio-card').nth(3).click()

  await page.fill('input[name=bootDiskName]', genName('my-boot-disk'))
  await page.fill('input[name=bootDiskSize]', '20')

  // TODO: image is not found because images are no longer global, and the
  // project used in this test is created for the test, so the mock images in
  // the MSW DB are not in that project.
  await page.locator(`input[value="${images[0].id}"] ~ .ox-radio-card`).click()

  await page.locator('button:has-text("Create instance")').click()

  await page.waitForURL(
    pb.instancePage({
      organization: orgName,
      project: projectName,
      instance: instanceName,
    })
  )

  await expectVisible(page, [
    `h1:has-text("${instanceName}")`,
    'text=6 vCPUs',
    'text=24 GiB',
  ])
})
