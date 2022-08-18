import type { Page } from '@playwright/test'
import { test as base } from '@playwright/test'

import type {
  OrganizationCreate,
  OrganizationDeleteParams,
  ProjectCreate,
  ProjectCreateParams,
  ProjectDeleteParams,
} from '@oxide/api'

import { expectNotVisible } from './utils'

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

interface Fixtures {
  createOrg: (body: OrganizationCreate) => Promise<void>
  deleteOrg: (params: OrganizationDeleteParams) => Promise<void>
  createProject: (params: ProjectCreateParams, body: ProjectCreate) => Promise<void>
  deleteProject: (params: ProjectDeleteParams) => Promise<void>
}

export const test = base.extend<Fixtures>({
  async createOrg({ page, deleteOrg }, use) {
    const orgsToRemove: string[] = []

    await use(async (body) => {
      const back = await goto(page, '/orgs/new')

      await page.fill('role=textbox[name="Name"]', body.name)
      await page.fill('role=textbox[name="Description"]', body.description)
      await page.click('role=button[name="Create organization"]')
      await page.waitForNavigation()
      await back()
    })

    for (const org of orgsToRemove) {
      await deleteOrg({ orgName: org })
    }
  },

  async deleteOrg({ page }, use) {
    await use(async (params: OrganizationDeleteParams) => {
      const back = await goto(page, '/orgs')

      await page
        .locator('role=row', { hasText: params.orgName })
        .locator('role=button[name="Row actions"]')
        .click()
      await page.click('role=menuitem[name="Delete"]')
      await expectNotVisible(page, [`role=cell[name="${params.orgName}"]`])

      await back()
    })
  },

  async createProject({ page, deleteProject }, use) {
    const projectsToRemove: ProjectDeleteParams[] = []

    await use(async (params, body) => {
      const back = await goto(page, `/orgs/${params.orgName}/projects/new`)
      await page.fill('role=textbox[name="Name"]', body.name)
      await page.fill('role=textbox[name="Description"]', body.description)
      await page.click('role=button[name="Create project"]')
      await back()
    })

    for (const params of projectsToRemove) {
      await deleteProject(params)
    }
  },

  async deleteProject({ page }, use) {
    await use(async (params: ProjectDeleteParams) => {
      const back = await goto(page, `/orgs/${params.orgName}/projects`)

      await page
        .locator('role=row', { hasText: params.projectName })
        .locator('role=button[name="Row actions"]')
        .click()
      await page.click('role=menuitem[name="Delete"]')
      await expectNotVisible(page, [`role=cell[name="${params.projectName}"]`])

      await back()
    })
  },
})
