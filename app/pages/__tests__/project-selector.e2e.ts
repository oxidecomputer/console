import { expect, expectVisible, genName, test } from 'app/test/e2e'

test('Project selector', async ({ page, createOrg, createProject }) => {
  const orgName = genName('project-selector-org')
  const p1Name = genName('project-a')
  const p2Name = genName('project-b')

  await createOrg(orgName)

  // Create 1st project
  await createProject(orgName, p1Name)

  // Create 2nd project
  await createProject(orgName, p2Name)

  // Go to the projects page
  await page.goto(`/orgs/${orgName}/projects`)

  await expectVisible(page, [`role=cell[name="${p1Name}"]`, `role=cell[name="${p2Name}"]`])

  // switcher button is present, has text indicating no project selected
  await expect(page.locator('role=button[name="Switch project"]')).toHaveText(
    `${orgName}select a project`
  )
  await page.click('role=button[name="Switch project"]')
  await expectVisible(page, [
    `role=menuitem[name="${p1Name}"]`,
    `role=menuitem[name="${p2Name}"]`,
  ])

  // picking p1 in the menu takes you there
  await page.click(`role=menuitem[name="${p1Name}"]`)
  await expect(page).toHaveURL(`/orgs/${orgName}/projects/${p1Name}/instances`)
  await expect(page.locator('role=button[name="Switch project"]')).toHaveText(
    `${orgName}${p1Name}`
  )

  // picking other-project in the menu takes you there
  await page.click('role=button[name="Switch project"]')
  await page.click(`role=menuitem[name="${p2Name}"]`)
  await expect(page).toHaveURL(`/orgs/${orgName}/projects/${p2Name}/instances`)
  await expect(page.locator('role=button[name="Switch project"]')).toHaveText(
    `${orgName}${p2Name}`
  )
})
