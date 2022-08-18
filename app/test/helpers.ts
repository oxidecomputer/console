import type { Page } from '@playwright/test'

import type {
  OrganizationCreate,
  OrganizationDeleteParams,
  ProjectCreate,
  ProjectCreateParams,
  ProjectDeleteParams,
} from '@oxide/api'

import { expectNotVisible } from 'app/util/e2e'

// TODO: This is duplicated from `@oxide/api` and can't be pulled in due to
// inlined tests using `import.meta` being imported and causing a syntax error
// given that playwright converts all the tests to commonjs.
export const genName = (...parts: [string, ...string[]]) => {
  const numParts = parts.length
  const partLength = Math.floor(63 / numParts) - Math.ceil(6 / numParts) - 1
  return (
    parts
      .map((part) => part.substring(0, partLength))
      .join('-')
      // generate random hex string of 6 characters
      .concat(`-${Math.random().toString(16).substring(2, 8)}`)
  )
}

const goto = async (page: Page, url: string) => {
  const currentUrl = page.url()
  const response = await page.goto(url)
  if (!response) throw new Error(`No response recieved for request to ${url}`)
  const status = response.status()
  if (status > 399) {
    throw new Error(`Loading ${url} failed with a status code of ${status}`)
  }
  return () => page.goto(currentUrl)
}

export async function checkIfExists(page: Page, path: string) {
  const res = await page.request.get(path)
  const status = res.status()
  if (status >= 500) {
    throw new Error(`${path} failed to load with a ${status} response code`)
  }
  return status >= 200 && status < 300
}

// --- Organizations ---------

/**
 * Creates an Organization and returns to the page it was called from.
 */
export async function createOrg(page: Page, body: OrganizationCreate) {
  const back = await goto(page, '/orgs/new')
  await page.fill('role=textbox[name="Name"]', body.name)
  await page.fill('role=textbox[name="Description"]', body.description)
  await page.click('role=button[name="Create organization"]')
  await page.waitForNavigation()
  await back()
  return () => {
    return deleteOrg(page, { orgName: body.name })
  }
}

export async function deleteOrg(page: Page, params: OrganizationDeleteParams) {
  const back = await goto(page, '/orgs')

  await page
    .locator('role=row', { hasText: params.orgName })
    .locator('role=button[name="Row actions"]')
    .click()
  await page.click('role=menuitem[name="Delete"]')
  await expectNotVisible(page, [`role=cell[name="${params.orgName}"]`])

  await back()
}

// --- Projects --------------

/*
 * Creates a project (and its parent org if it doesn't already exist) then returns
 * to the page it was called from.
 */
export async function createProject(
  page: Page,
  params: ProjectCreateParams,
  body: ProjectCreate
) {
  let orgCreated = false
  if (!checkIfExists(page, `/orgs/${params.orgName}`)) {
    await createOrg(page, { name: params.orgName, description: '' })
    orgCreated = true
  }
  const back = await goto(page, `/orgs/${params.orgName}/projects/new`)
  await page.fill('role=textbox[name="Name"]', body.name)
  await page.fill('role=textbox[name="Description"]', body.description)
  await back()

  return async () => {
    await deleteProject(page, { ...params, projectName: body.name })
    if (orgCreated) {
      await deleteOrg(page, params)
    }
  }
}

export async function deleteProject(page: Page, params: ProjectDeleteParams) {
  const back = await goto(page, `/orgs/${params.orgName}/projects`)

  await page
    .locator('role=row', { hasText: params.projectName })
    .locator('role=button[name="Row actions"]')
    .click()
  await page.click('role=menuitem[name="Delete"]')
  await expectNotVisible(page, [`role=cell[name="${params.projectName}"]`])

  await back()
}
