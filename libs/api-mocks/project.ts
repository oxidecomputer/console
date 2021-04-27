import type { ApiProjectView, ApiProjectViewResultsPage } from '@oxide/api'

export const project: ApiProjectView = {
  id: 'mock-project-uuid',
  name: 'mock-project',
  description: 'a fake project',
  timeCreated: new Date(2021, 0, 1),
  timeModified: new Date(2021, 0, 2),
}

export const projects: ApiProjectViewResultsPage = { items: [project] }
