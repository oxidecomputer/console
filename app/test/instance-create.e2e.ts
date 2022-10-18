import { globalImages } from '@oxide/api-mocks'

import { expectVisible, test } from 'app/test/e2e'

test.beforeEach(async ({ createProject, orgName, projectName }) => {
  await createProject(orgName, projectName)
})

test('can invoke instance create form from instances page', async ({
  page,
  orgName,
  projectName,
}) => {
  await page.goto(`/orgs/${orgName}/projects/${projectName}/instances`)
  await page.locator('text="New Instance"').click()

  await page.pause()
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
    'role=button[name="Create instance"][disabled]',
  ])

  await page.fill('input[name=name]', 'mock-instance')
  await page.locator('.ox-radio-card').nth(3).click()

  await page.fill('input[name=bootDiskName]', 'my-boot-disk')
  await page.fill('input[name=bootDiskSize]', '20')

  await page.locator(`input[value="${globalImages[0].id}"] ~ .ox-radio-card`).click()

  await page.locator('button:has-text("Create instance")').click()

  await page.waitForURL(`/orgs/${orgName}/projects/${projectName}/instances/mock-instance`)

  await expectVisible(page, ['h1:has-text("mock-instance")', 'text=6 vCPUs', 'text=24 GiB'])
})
