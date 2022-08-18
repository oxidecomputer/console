import { expectVisible, test } from '@oxide/test'

test('Root to orgs redirect', async ({ page }) => {
  await page.goto('/')
  await page.waitForURL('/orgs')
  await expectVisible(page, ['role=heading[name="Organizations"]'])
})

test('Create org and navigate to project', async ({ page, createOrg }) => {
  await page.goto('/orgs')
  await expectVisible(page, ['role=heading[name="Organizations"]'])

  // verify create org form
  await page.click('role=link[name="New Organization"]')
  await expectVisible(page, [
    'role=heading[name*="Create organization"]',
    'role=textbox[name="Name"]',
    'role=textbox[name="Description"]',
    'role=button[name="Create organization"][disabled]',
  ])
  await page.goBack()

  const org = await createOrg({
    name: 'org-create-test',
    description: 'used to test org creation',
  })

  // org page (redirects to /org/org-name/projects)
  await page.click(`role=link[name="${org.name}"]`)
  await expectVisible(page, [
    'role=heading[name="Projects"]',
    'role=heading[name="No projects"]',
  ])
})
