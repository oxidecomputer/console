import type { Page } from '@playwright/test'
import { test as base } from '@playwright/test'

import type {
  OrganizationCreate,
  OrganizationDeleteParams,
  ProjectCreate,
  ProjectDeleteParams,
  VpcCreate,
  VpcDeleteParams,
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

type Body<T> = Partial<Omit<T, 'name'>>

interface Fixtures {
  createOrg: (orgName: string, body?: Body<OrganizationCreate>) => Promise<void>
  deleteOrg: (params: OrganizationDeleteParams) => Promise<void>
  createProject: (
    orgName: string,
    projectName: string,
    body?: Body<ProjectCreate>
  ) => Promise<void>
  deleteProject: (params: ProjectDeleteParams) => Promise<void>
  createVpc: (
    orgName: string,
    projectName: string,
    vpcName: string,
    body?: Body<VpcCreate>
  ) => Promise<void>
  deleteVpc: (params: VpcDeleteParams) => Promise<void>
  deleteTableRow: (rowText: string) => Promise<void>
}

export const test = base.extend<Fixtures>({
  async createOrg({ page, deleteOrg }, use) {
    const orgsToRemove: string[] = []

    await use(async (orgName, body = {}) => {
      const back = await goto(page, '/orgs/new')

      await page.fill('role=textbox[name="Name"]', orgName)
      await page.fill('role=textbox[name="Description"]', body.description || '')
      await page.click('role=button[name="Create organization"]')
      await back()
    })

    for (const org of orgsToRemove) {
      await deleteOrg({ orgName: org })
    }
  },

  async deleteOrg({ page, deleteTableRow }, use) {
    await use(async (params: OrganizationDeleteParams) => {
      const back = await goto(page, '/orgs')
      await deleteTableRow(params.orgName)
      await back()
    })
  },

  async createProject({ page, deleteProject }, use) {
    const projectsToRemove: ProjectDeleteParams[] = []

    await use(async (orgName, projectName, body = {}) => {
      const back = await goto(page, `/orgs/${orgName}/projects/new`)
      await page.fill('role=textbox[name="Name"]', projectName)
      await page.fill('role=textbox[name="Description"]', body.description || '')
      await page.click('role=button[name="Create project"]')
      await back()
    })

    for (const params of projectsToRemove) {
      await deleteProject(params)
    }
  },

  async deleteProject({ page, deleteTableRow }, use) {
    await use(async (params: ProjectDeleteParams) => {
      const back = await goto(page, `/orgs/${params.orgName}/projects`)
      await deleteTableRow(params.projectName)
      await back()
    })
  },

  async createVpc({ page, deleteVpc }, use) {
    const vpcsToRemove: VpcDeleteParams[] = []

    await use(async (orgName, projectName, vpcName, body = {}) => {
      const back = await goto(page, `/orgs/${orgName}/projects/${projectName}/vpcs/new`)
      await page.fill('role=textbox[name="Name"]', vpcName)
      await page.fill('role=textbox[name="Description"]', body.description || '')
      await page.click('role=button[name="Create VPC"]')
      await back()
    })

    for (const params of vpcsToRemove) {
      await deleteVpc(params)
    }
  },

  async deleteVpc({ page, deleteTableRow }, use) {
    await use(async (params: VpcDeleteParams) => {
      const back = await goto(
        page,
        `/orgs/${params.orgName}/projects/${params.projectName}/vpcs`
      )
      await deleteTableRow(params.vpcName)
      await back()
    })
  },

  async deleteTableRow({ page }, use) {
    await use(async (rowText: string) => {
      await page
        .locator('role=row', { hasText: rowText })
        .locator('role=button[name="Row actions"]')
        .click()
      await page.click('role=menuitem[name="Delete"]')
      await expectNotVisible(page, [`role=cell[name="${rowText}"]`])
    })
  },
})
