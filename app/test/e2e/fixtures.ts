import type { Page } from '@playwright/test'
import { test as base } from '@playwright/test'

import type {
  InstanceCreate,
  InstanceDeletePathParams,
  OrganizationCreate,
  OrganizationDeletePathParams,
  ProjectCreate,
  ProjectDeletePathParams,
  VpcCreate,
  VpcDeletePathParams,
} from '@oxide/api'

import { expectNotVisible } from './utils'

/**
 * Returns a callback to result position and fails if response code over 400.
 */
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
  /**
   * Generates a unique name in the format `${prefix}-${filename}-line${line_number_of_test}-${shortcode}`.
   * Useful for creating non-conflicting resource names that are also hint at their context.
   */
  genName: (prefix: string) => string
  orgName: string
  projectName: string
  instanceName: string
  vpcName: string
  /**
   * Creates an organization with the given name. When the test is complete, the organization will be deleted.
   *
   * @param orgName The name of the organization to create.
   * @param body The body payload for the organization create request.
   */
  createOrg: (orgName: string, body?: Body<OrganizationCreate>) => Promise<void>
  /**
   * Deletes an organization with the given name. Typically this shouldn't be called directly. Instead, use `createOrg` to create an organization and have it deleted automatically when the test is complete.
   */
  deleteOrg: (params: OrganizationDeletePathParams) => Promise<void>
  /**
   * Creates a project with the given name. When the test is complete, the project will be deleted.
   *
   * @param orgName The name of the organization to create the project in.
   * @param projectName The name of the project to create.
   * @param body The body payload for the project create request.
   **/
  createProject: (
    orgName: string,
    projectName: string,
    body?: Body<ProjectCreate>
  ) => Promise<void>
  /**
   * Deletes a project with the given name. Typically this shouldn't be called directly. Instead, use `createProject` to create a project and have it deleted automatically when the test is complete.
   */
  deleteProject: (params: ProjectDeletePathParams) => Promise<void>
  /**
   * Creates an instance with the given name. When the test is complete, the instance will be deleted.
   *
   * @param orgName The name of the organization to create the instance in.
   * @param projectName The name of the project to create the instance in.
   * @param instanceName The name of the instance to create.
   * @param body The body payload for the instance create request.
   */
  createInstance: (
    orgName: string,
    projectName: string,
    instanceName: string,
    body?: Body<InstanceCreate>
  ) => Promise<void>
  /**
   * Deletes an instance with the given name. Typically this shouldn't be called directly. Instead, use `createInstance` to create an instance and have it deleted automatically when the test is complete.
   */
  deleteInstance: (params: InstanceDeletePathParams) => Promise<void>
  /**
   * Creates a VPC with the given name. When the test is complete, the VPC will be deleted.
   *
   * @param orgName The name of the organization to create the VPC in.
   * @param projectName The name of the project to create the VPC in.
   * @param vpcName The name of the VPC to create.
   * @param body The body payload for the VPC create request.
   */
  createVpc: (
    orgName: string,
    projectName: string,
    vpcName: string,
    body?: Body<VpcCreate>
  ) => Promise<void>
  /**
   * Deletes a VPC with the given name. Typically this shouldn't be called directly. Instead, use `createVpc` to create a VPC and have it deleted automatically when the test is complete.
   */
  deleteVpc: (params: VpcDeletePathParams) => Promise<void>
  deleteTableRow: (rowText: string) => Promise<void>
}

export const test = base.extend<Fixtures>({
  // Tests fail if destructuring isn't used here which is why the ignore exists
  // eslint-disable-next-line no-empty-pattern
  async genName({}, use, testInfo) {
    // Maximum length of the Name type
    const NAME_LENGTH = 63
    // Length of a unique hash to append to the end
    const HASH_LENGTH = 6

    const name = testInfo.file.split('/').pop()?.split('.')[0] ?? 'test'
    await use((prefix) =>
      `${prefix}-${name}-line${testInfo.line}`
        .substring(0, NAME_LENGTH - HASH_LENGTH)
        .concat(
          `-${Math.random()
            .toString(16)
            .substring(2, 2 + HASH_LENGTH)}`
        )
    )
  },
  async orgName({ genName }, use) {
    await use(genName('org'))
  },
  async projectName({ genName }, use) {
    await use(genName('proj'))
  },
  async instanceName({ genName }, use) {
    await use(genName('inst'))
  },
  async vpcName({ genName }, use) {
    await use(genName('vpc'))
  },
  async createOrg({ page, deleteOrg }, use) {
    const orgsToRemove: string[] = []

    await use(async (orgName, body = {}) => {
      if (orgsToRemove.includes(orgName)) {
        return
      }

      const back = await goto(page, '/orgs-new')

      await page.fill('role=textbox[name="Name"]', orgName)
      await page.fill('role=textbox[name="Description"]', body.description || '')
      await page.click('role=button[name="Create organization"]')
      orgsToRemove.push(orgName)
      await back()
    })

    for (const org of orgsToRemove) {
      await deleteOrg({ orgName: org })
    }
  },

  async deleteOrg({ page, deleteTableRow }, use) {
    await use(async (params: OrganizationDeletePathParams) => {
      const back = await goto(page, '/orgs')
      await deleteTableRow(params.orgName)
      await back()
    })
  },

  async createProject({ page, createOrg, deleteProject }, use) {
    const projectsToRemove: ProjectDeletePathParams[] = []

    await use(async (orgName, projectName, body = {}) => {
      if (
        projectsToRemove.find((p) => p.orgName === orgName && p.projectName === projectName)
      ) {
        return
      }

      await createOrg(orgName)

      const back = await goto(page, `/orgs/${orgName}/projects-new`)
      await page.fill('role=textbox[name="Name"]', projectName)
      await page.fill('role=textbox[name="Description"]', body.description || '')
      await page.click('role=button[name="Create project"]')

      projectsToRemove.push({ orgName, projectName })
      await back()
    })

    for (const params of projectsToRemove) {
      await deleteProject(params)
    }
  },

  async deleteProject({ page, deleteTableRow }, use) {
    await use(async (params: ProjectDeletePathParams) => {
      const back = await goto(page, `/orgs/${params.orgName}/projects`)
      await deleteTableRow(params.projectName)
      await back()
    })
  },

  // TODO: Wire up all create options
  async createInstance({ page, createProject, deleteInstance }, use) {
    const instancesToRemove: InstanceDeletePathParams[] = []
    await use(async (orgName, projectName, instanceName, _body = {}) => {
      if (
        instancesToRemove.find(
          (i) =>
            i.orgName === orgName &&
            i.projectName === projectName &&
            i.instanceName === instanceName
        )
      ) {
        return
      }

      await createProject(orgName, projectName)

      const back = await goto(
        page,
        `/orgs/${orgName}/projects/${projectName}/instances-new`
      )

      await page.fill('input[name=name]', instanceName)
      await page.locator('.ox-radio-card').nth(3).click()
      await page.locator('input[value=ubuntu-1] ~ .ox-radio-card').click()
      await page.locator('button:has-text("Create instance")').click()

      instancesToRemove.push({ orgName, projectName, instanceName })
      await back()
    })

    for (const params of instancesToRemove) {
      await deleteInstance(params)
    }
  },

  async deleteInstance({ page, deleteTableRow }, use) {
    await use(async (params: InstanceDeletePathParams) => {
      const back = await goto(
        page,
        `/orgs/${params.orgName}/projects/${params.projectName}/instances`
      )
      await deleteTableRow(params.instanceName)
      await back()
    })
  },

  async createVpc({ page, createProject, deleteVpc }, use) {
    const vpcsToRemove: VpcDeletePathParams[] = []

    await use(async (orgName, projectName, vpcName, body = {}) => {
      if (
        vpcsToRemove.find(
          (v) =>
            v.orgName === orgName && v.projectName === projectName && v.vpcName === vpcName
        )
      ) {
        return
      }

      await createProject(orgName, projectName)

      const back = await goto(page, `/orgs/${orgName}/projects/${projectName}/vpcs-new`)
      await page.fill('role=textbox[name="Name"]', vpcName)
      await page.fill('role=textbox[name="Description"]', body.description || '')
      await page.fill('role=textbox[name="DNS name"]', body.dnsName || vpcName)
      await page.click('role=button[name="Create VPC"]')

      vpcsToRemove.push({ orgName, projectName, vpcName })
      await back()
    })

    for (const params of vpcsToRemove) {
      await deleteVpc(params)
    }
  },

  async deleteVpc({ page, deleteTableRow }, use) {
    await use(async (params: VpcDeletePathParams) => {
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
      /**
       * FIXME: This is a workaround to prevent a test failure flake where the `expectNotVisible` fails
       * by finding _two_ of the cell that was supposed to be deleted above. I've been unable to reproduce
       * this locally, so I'm not sure what's going on.
       */
      await page.reload()
      await expectNotVisible(page, [`role=cell[name="${rowText}"]`])
    })
  },
})
