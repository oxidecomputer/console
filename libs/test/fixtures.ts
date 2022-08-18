import type { Page } from '@playwright/test'

import type {
  OrganizationCreate,
  OrganizationDeleteParams,
  ProjectCreate,
  ProjectCreateParams,
  ProjectDeleteParams,
} from '@oxide/api'

import { expectNotVisible } from './utils'

function interceptArgs<A extends Array<unknown>, B extends unknown>(
  f: (...args: A) => B,
  callback: (...args: A) => A
): (...args: A) => B {
  return new Proxy(f, {
    apply(target, context, args) {
      return target.apply(context, callback(...(args as A)))
    },
  })
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

/**
 * Creates an Organization and returns to the page it was called from.
 */
export const createOrg = (
  page: Page,
  callback: (body: OrganizationCreate) => [body: OrganizationCreate]
) =>
  interceptArgs(async (body: OrganizationCreate) => {
    const back = await goto(page, '/orgs/new')

    await page.fill('role=textbox[name="Name"]', body.name)
    await page.fill('role=textbox[name="Description"]', body.description)
    await page.click('role=button[name="Create organization"]')
    await page.waitForNavigation()
    await back()

    return body
  }, callback)

export const deleteOrg = (page: Page) => async (params: OrganizationDeleteParams) => {
  const back = await goto(page, '/orgs')

  await page
    .locator('role=row', { hasText: params.orgName })
    .locator('role=button[name="Row actions"]')
    .click()
  await page.click('role=menuitem[name="Delete"]')
  await expectNotVisible(page, [`role=cell[name="${params.orgName}"]`])

  await back()
}

export const createProject = (
  page: Page,
  callback: (
    params: ProjectCreateParams,
    body: ProjectCreate
  ) => [ProjectCreateParams, ProjectCreate]
) =>
  interceptArgs(async (params: ProjectCreateParams, body: ProjectCreate) => {
    const back = await goto(page, `/orgs/${params.orgName}/projects/new`)
    await page.fill('role=textbox[name="Name"]', body.name)
    await page.fill('role=textbox[name="Description"]', body.description)
    await page.click('role=button[name="Create project"]')
    await back()
  }, callback)

export const deleteProject = (page: Page) => async (params: ProjectDeleteParams) => {
  const back = await goto(page, `/orgs/${params.orgName}/projects`)

  await page
    .locator('role=row', { hasText: params.projectName })
    .locator('role=button[name="Row actions"]')
    .click()
  await page.click('role=menuitem[name="Delete"]')
  await expectNotVisible(page, [`role=cell[name="${params.projectName}"]`])

  await back()
}
