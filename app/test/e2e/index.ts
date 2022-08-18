import { test as base } from '@playwright/test'

import type { ProjectDeleteParams } from '@oxide/api'

import { createProject, deleteProject } from './fixtures'
import { createOrg, deleteOrg } from './fixtures'
import { genName } from './utils'

interface Fixtures {
  createOrg: ReturnType<typeof createOrg>
  deleteOrg: ReturnType<typeof deleteOrg>
  createProject: ReturnType<typeof createProject>
  deleteProject: ReturnType<typeof deleteProject>
}

export * from '@playwright/test'
export * from './utils'

export const test = base.extend<Fixtures>({
  async createOrg({ page, deleteOrg }, use) {
    const orgsToRemove: string[] = []
    await use(
      createOrg(page, ({ name, ...others }) => {
        const newName = genName(name)
        orgsToRemove.push(newName)
        return [{ name: newName, ...others }]
      })
    )
    for (const org of orgsToRemove) {
      await deleteOrg({ orgName: org })
    }
  },

  async deleteOrg({ page }, use) {
    await use(deleteOrg(page))
  },

  async createProject({ page, deleteProject }, use) {
    const projectsToRemove: ProjectDeleteParams[] = []
    await use(
      createProject(page, (params, { name, ...others }) => {
        const newName = genName(name)
        projectsToRemove.push({ ...params, projectName: newName })
        return [params, { name: newName, ...others }]
      })
    )
    for (const params of projectsToRemove) {
      await deleteProject(params)
    }
  },

  async deleteProject({ page }, use) {
    await use(deleteProject(page))
  },
})
